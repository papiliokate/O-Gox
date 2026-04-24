import puppeteer from 'puppeteer';
import { PuppeteerScreenRecorder } from 'puppeteer-screen-recorder';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import * as googleTTS from 'google-tts-api';

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const TTS_PATH = path.resolve('public/tts.mp3');
// Use a standard public dir for bgm, assuming it will be populated or using a placeholder
const bgmDir = path.resolve('public/bgm');
if (!fs.existsSync(bgmDir)) fs.mkdirSync(bgmDir, { recursive: true });

let BGM_PATH = '';
if (fs.existsSync(bgmDir)) {
    const bgmFiles = fs.readdirSync(bgmDir).filter(f => f.endsWith('.mp3'));
    if (bgmFiles.length > 0) {
        const randomBgm = bgmFiles[Math.floor(Math.random() * bgmFiles.length)];
        BGM_PATH = path.resolve(bgmDir, randomBgm);
        console.log(`Selected BGM: ${randomBgm}`);
    }
}

const RAW_VIDEO = path.resolve('raw.mp4');
const FINAL_VIDEO = path.resolve('public/daily_video.mp4');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
    const server = spawn('node', ['node_modules/vite/bin/vite.js', '--port', '5173', '--strictPort', '--host', '127.0.0.1', '--clearScreen', 'false'], {
        cwd: process.cwd(),
        shell: false
    });
    
    server.stderr.on('data', (data) => console.error("VITE ERROR:", data.toString()));
    server.stdout.on('data', (data) => console.log("VITE:", data.toString()));

    console.log("Waiting for Vite dev server to boot...");
    let viteReady = false;
    for (let i = 0; i < 30; i++) {
        try {
            const res = await fetch("http://127.0.0.1:5173/");
            if (res.ok) { viteReady = true; break; }
        } catch (e) {}
        await sleep(500);
    }
    if (!viteReady) throw new Error("Vite server failed to start.");
    console.log("Server is ready!");

    const FORMAT = process.env.FORMAT || 'standard';
    console.log(`Generating video for format: ${FORMAT}`);
    
    const ttsPools = {
        standard: [
            "Can you spell today's animal? Watch the arrows fly, then click the link in our bio to play for free!",
            "Here is today's puzzle. Pay attention, and head to our profile to play for free!",
            "Do you have what it takes to beat today's challenge? Play free from our profile!"
        ],
        fail: [
            "Even the AI couldn't shoot straight! Can you beat this level? Link in bio to play.",
            "Absolute disaster of a run! Think you can do better? Try the challenge for free at the link in our bio."
        ],
        interactive: [
            "Only 1% of players know this animal! What is it? Play for free via the link in our profile!",
            "Can you spot the final match? Test your skills for free via the link in our profile."
        ]
    };

    let urlParam = 'standard';
    let pool = ttsPools.standard;
    
    if (FORMAT === 'fail') {
        urlParam = 'fail';
        pool = ttsPools.fail;
    } else if (FORMAT === 'interactive') {
        urlParam = 'interactive';
        pool = ttsPools.interactive;
    }

    const ttsText = pool[Math.floor(Math.random() * pool.length)];

    console.log("Generating TTS audio...");
    try {
        const ttsUrl = googleTTS.getAudioUrl(ttsText, {
            lang: 'en',
            slow: false,
            host: 'https://translate.google.com',
        });
        const ttsResponse = await fetch(ttsUrl);
        const ttsBuffer = await ttsResponse.arrayBuffer();
        fs.writeFileSync(TTS_PATH, Buffer.from(ttsBuffer));
        console.log("TTS audio successfully generated.");
    } catch (err) {
        console.warn("Failed to generate TTS audio, continuing without it.", err);
        fs.writeFileSync(TTS_PATH, Buffer.from([]));
    }

    const browser = await puppeteer.launch({
        headless: 'new',
        args: [
            '--window-size=720,1280',
            '--autoplay-policy=no-user-gesture-required',
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage'
        ]
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 720, height: 1280 });
    
    const recorder = new PuppeteerScreenRecorder(page, {
        fps: 30,
        ffmpeg_Path: ffmpegInstaller.path,
        videoFrame: {
            width: 720,
            height: 1280,
        },
        aspectRatio: '9:16',
    });

    console.log("Navigating to game and starting recording...");
    try {
        await page.goto(`http://127.0.0.1:5173/?autoplay=${urlParam}&tiktok=true`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    } catch (e) {
        console.warn("Navigation timeout reached, but we will wait for internal game completion flag.", e.message);
    }

    console.log("Starting Puppeteer Screen Recorder...");
    await recorder.start(RAW_VIDEO);

    console.log("Recording... Waiting for game completion.");
    
    let gameWon = false;
    for (let i = 0; i < 240; i++) { 
        gameWon = await page.evaluate(() => window._VIDEO_RECORDING_DONE === true);
        if (gameWon) break;
        await sleep(500);
    }

    console.log("Gameplay finished. Saving video...");
    await recorder.stop();
    
    try { await browser.close(); } catch(e) {}
    server.kill();

    console.log("Compositing TikTok video using FFmpeg...");
    
    await new Promise((resolve, reject) => {
        let ff = ffmpeg().input(RAW_VIDEO);
        
        if (BGM_PATH) {
            ff = ff.input(BGM_PATH).inputOptions(['-stream_loop', '-1']);
        } else {
            // No BGM, just quiet audio
            // Create dummy audio for complex filter to work if needed, or simply map video and TTS
        }
        
        ff = ff.input(TTS_PATH);
        
        if (BGM_PATH) {
            ff = ff.complexFilter([
                '[1:a]volume=0.3[bgm_quiet]',
                '[2:a]volume=1.5[tts_loud]',
                '[bgm_quiet][tts_loud]amix=inputs=2:duration=first:dropout_transition=3[audio_out]'
            ])
            .outputOptions([
                '-map 0:v',
                '-map [audio_out]'
            ]);
        } else {
            ff = ff.outputOptions([
                '-map 0:v',
                '-map 1:a' // TTS is input 1 now
            ]);
        }
        
        ff.outputOptions([
            '-y',
            '-c:v libx264',
            '-pix_fmt yuv420p',
            '-preset slow',
            '-crf 18',
            '-c:a aac',
            '-b:a 192k',
            '-shortest'
        ])
        .save(FINAL_VIDEO)
        .on('end', () => {
            console.log(`Successfully generated TikTok video at: ${FINAL_VIDEO}`);
            resolve();
        })
        .on('error', (err) => {
            console.error("FFmpeg Error:", err);
            reject(err);
        });
    });
}

main().then(() => {
    if (!fs.existsSync(FINAL_VIDEO) || fs.statSync(FINAL_VIDEO).size < 1024) {
        throw new Error("Final video was not created or is empty!");
    }
    console.log("Process complete. Exiting natively.");
    process.exit(0);
}).catch(err => {
    console.error("Script failed:", err);
    process.exit(1);
});
