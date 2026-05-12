import './style.css';
import confetti from 'canvas-confetti';
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getAnalytics, logEvent } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-analytics.js";

// --- Audio Synthesizer ---
const urlParams = new URLSearchParams(window.location.search);

if (urlParams.get('autoplay') === 'split') {
    const asmrFile = urlParams.get('asmr');
    if (asmrFile) {
        const vid = document.createElement('video');
        vid.src = `/asmr/${asmrFile}`;
        vid.autoplay = true;
        vid.loop = true;
        vid.muted = true;
        vid.style.position = 'absolute';
        vid.style.bottom = '0';
        vid.style.left = '0';
        vid.style.width = '100%';
        vid.style.height = '50%';
        vid.style.objectFit = 'cover';
        document.body.appendChild(vid);
    }
    
    const banner = document.createElement('div');
    banner.innerText = "O-Gox from Oops-games";
    banner.style.position = 'absolute';
    banner.style.top = '50%';
    banner.style.left = '50%';
    banner.style.transform = 'translate(-50%, -50%)';
    banner.style.background = 'rgba(0, 0, 0, 0.85)';
    banner.style.color = '#fde047';
    banner.style.padding = '12px 24px';
    banner.style.borderRadius = '12px';
    banner.style.border = '2px solid #b45309';
    banner.style.fontFamily = 'system-ui, -apple-system, sans-serif';
    banner.style.fontWeight = '800';
    banner.style.fontSize = '28px';
    banner.style.zIndex = '1000';
    banner.style.whiteSpace = 'nowrap';
    banner.style.boxShadow = '0 4px 15px rgba(0,0,0,0.5)';
    banner.style.textShadow = '1px 1px 2px rgba(0,0,0,0.8)';
    document.body.appendChild(banner);
}

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const playSound = (type) => {
  if (audioCtx.state === 'suspended') audioCtx.resume();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  const now = audioCtx.currentTime;
  
  if (type === 'shoot') {
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.1);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
    osc.start(now); osc.stop(now + 0.1);
  } else if (type === 'hit') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
    osc.start(now); osc.stop(now + 0.2);
  } else if (type === 'backspace') {
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.2);
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
    osc.start(now); osc.stop(now + 0.2);
  } else if (type === 'clear') {
    osc.type = 'square';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.4);
    gain.gain.setValueAtTime(0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
    osc.start(now); osc.stop(now + 0.4);
  } else if (type === 'error') {
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.1);
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    osc.start(now); osc.stop(now + 0.3);
  } else if (type === 'win') {
    [400, 500, 600, 800].forEach((freq, i) => {
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.type = 'sine';
      o.connect(g);
      g.connect(audioCtx.destination);
      o.frequency.value = freq;
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(0.3, now + 0.1 + i*0.1);
      g.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
      o.start(now); o.stop(now + 0.8);
    });
  }
};

// --- Firebase Initialization ---
let analytics;
if (import.meta.env && import.meta.env.VITE_FIREBASE_API_KEY) {
  try {
    const firebaseConfig = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
      measurementId: "G-BJLK9339LN",
    };
    const app = initializeApp(firebaseConfig);
    analytics = getAnalytics(app);
    logEvent(analytics, 'session_start');
  } catch (e) {
    console.warn("Analytics error:", e);
  }
}



// --- Meta-Cipher System ---
function mulberry32(a) {
  return function() {
    var t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}
function getSeed(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return hash;
}
function getDailyCypher(gameIndex) {
  const formatter = new Intl.DateTimeFormat('en-CA', { timeZone: 'Pacific/Kiritimati', year: 'numeric', month: '2-digit', day: '2-digit' });
  const dateStr = formatter.format(new Date());
  let seed = getSeed(dateStr);
  let rand = mulberry32(seed);
  let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let cyphers = [];
  for(let k=0; k<3; k++) {
      let str = "";
      for(let j=0; j<4; j++) { str += chars.charAt(Math.floor(rand() * chars.length)); }
      cyphers.push(str);
  }
  let assignment = [0,1,2];
  for (var i = assignment.length - 1; i > 0; i--) {
      var j = Math.floor(rand() * (i + 1));
      var temp = assignment[i];
      assignment[i] = assignment[j];
      assignment[j] = temp;
  }
  let result = ["","",""];
  result[assignment[0]] = cyphers[0];
  result[assignment[1]] = cyphers[1];
  result[assignment[2]] = cyphers[2];
  return result[gameIndex % 3];
}

// --- Configuration ---
const config = {
  animalName: "TIGER",
  emoji: "🐯",
  ringConfig: [
    { radius: 70, speed: 0.0008, direction: 1, numSlots: 8, points: 3 },    // Inner
    { radius: 130, speed: 0.0005, direction: -1, numSlots: 16, points: 2 }, // Middle
    { radius: 190, speed: 0.0003, direction: 1, numSlots: 24, points: 1 }   // Outer
  ],
  ballRadius: 18,
  arrowSpeed: 8,
  arrowRadius: 220 // Distance from center where arrow orbits
};

// --- Game State ---
let spelledWord = [];
let targetWord = config.animalName.split('');
let score = 0;
let rings = [];
let arrow = {
  angle: -Math.PI / 2, // Starts at top
  shooting: false,
  x: 0,
  y: 0,
  cx: 0,
  cy: 0,
  trail: []
};
let mouse = { x: -100, y: -100 };
let lastTime = 0;

// --- Elements ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const board = document.getElementById('spelling-board');

function resizeCanvas() {
  const container = document.getElementById('game-container');
  
  const LOGICAL_WIDTH = 450;
  const LOGICAL_HEIGHT = 800; 

  const width = document.documentElement.clientWidth || window.innerWidth;
  const height = document.documentElement.clientHeight || window.innerHeight;

  let effectiveHeight = height;
  if (urlParams.get('autoplay') === 'split') {
      effectiveHeight = height / 2;
  }

  const scaleWidth = width / LOGICAL_WIDTH;
  const scaleHeight = effectiveHeight / LOGICAL_HEIGHT;
  const scale = Math.min(scaleWidth, scaleHeight) * 0.98; // 98% prevents edge-case scrollbar triggering

  container.style.width = `${LOGICAL_WIDTH}px`;
  container.style.height = `${LOGICAL_HEIGHT}px`;
  container.style.minHeight = `${LOGICAL_HEIGHT}px`;
  container.style.transform = `scale(${scale})`;
  container.style.transformOrigin = 'center center';
  
  container.style.position = 'absolute';
  container.style.left = '50%';
  if (urlParams.get('autoplay') === 'split') {
      container.style.top = '25%';
  } else {
      container.style.top = '50%';
  }
  container.style.marginLeft = `-${LOGICAL_WIDTH / 2}px`;
  container.style.marginTop = `-${LOGICAL_HEIGHT / 2}px`;

  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight; 
  drawBoard();
}
window.addEventListener('resize', resizeCanvas);

// --- Initialization ---
async function initGame() {
  const validAnimals = [
      // Original list
      { name: "CAT", emoji: "🐱" }, { name: "DOG", emoji: "🐶" },
      { name: "MOUSE", emoji: "🐭" }, { name: "RABBIT", emoji: "🐰" },
      { name: "FOX", emoji: "🦊" }, { name: "BEAR", emoji: "🐻" },
      { name: "PANDA", emoji: "🐼" }, { name: "KOALA", emoji: "🐨" },
      { name: "TIGER", emoji: "🐯" }, { name: "LION", emoji: "🦁" },
      { name: "COW", emoji: "🐮" }, { name: "PIG", emoji: "🐷" },
      { name: "FROG", emoji: "🐸" }, { name: "MONKEY", emoji: "🐵" },
      
      // New additions for more variety
      { name: "WOLF", emoji: "🐺" }, { name: "DEER", emoji: "🦌" },
      { name: "ZEBRA", emoji: "🦓" }, { name: "HORSE", emoji: "🐴" },
      { name: "SHEEP", emoji: "🐑" }, { name: "GOAT", emoji: "🐐" },
      { name: "CAMEL", emoji: "🐫" }, { name: "RHINO", emoji: "🦏" },
      { name: "HIPPO", emoji: "🦛" }, { name: "SLOTH", emoji: "🦥" },
      { name: "SKUNK", emoji: "🦨" }, { name: "BADGER", emoji: "🦡" },
      { name: "OTTER", emoji: "🦦" }, { name: "BEAVER", emoji: "🦫" },
      { name: "DUCK", emoji: "🦆" }, { name: "SWAN", emoji: "🦢" },
      { name: "OWL", emoji: "🦉" }, { name: "EAGLE", emoji: "🦅" },
      { name: "PARROT", emoji: "🦜" }, { name: "TURTLE", emoji: "🐢" },
      { name: "SNAKE", emoji: "🐍" }, { name: "LIZARD", emoji: "🦎" },
      { name: "WHALE", emoji: "🐋" }, { name: "DOLPHIN", emoji: "🐬" },
      { name: "SEAL", emoji: "🦭" }, { name: "FISH", emoji: "🐟" },
      { name: "SHARK", emoji: "🦈" }, { name: "OCTOPUS", emoji: "🐙" },
      { name: "CRAB", emoji: "🦀" }, { name: "SQUID", emoji: "🦑" },
      { name: "SNAIL", emoji: "🐌" }, { name: "BUG", emoji: "🐛" },
      { name: "ANT", emoji: "🐜" }, { name: "BEE", emoji: "🐝" },
      { name: "SPIDER", emoji: "🕷️" }
  ];
  
  const formatter = new Intl.DateTimeFormat('en-CA', { timeZone: 'Pacific/Kiritimati', year: 'numeric', month: '2-digit', day: '2-digit' });
  const dateStr = formatter.format(new Date());
  let seed = getSeed(dateStr);
  let rand = mulberry32(seed);
  
  const selectedAnimal = validAnimals[Math.floor(rand() * validAnimals.length)];
  
  config.animalName = selectedAnimal.name;
  config.emoji = selectedAnimal.emoji;
  targetWord = config.animalName.split('');

  // Pack the board heavily so there are plenty of targets
  let pool = [];
  for (let i = 0; i < 5; i++) pool.push(...targetWord); // 5 full sets of the word
  pool.push('⌫', '⌫', '⌫', '⌫', '⌫', '⌫', '⌫', '⌫'); // Lots of backspaces
  
  rings = config.ringConfig.map(rConf => {
    let slots = Array(rConf.numSlots).fill(null);
    return { ...rConf, slots, currentRotation: 0 };
  });

  // Guarantee that every letter in the name appears at least once in the innermost ring
  let unplacedTarget = [...targetWord];
  let innerRing = rings[0];
  let innerEmpty = [];
  for (let i = 0; i < innerRing.slots.length; i++) innerEmpty.push(i);
  
  while (unplacedTarget.length > 0 && innerEmpty.length > 0) {
      const randIdx = Math.floor(Math.random() * innerEmpty.length);
      const slotIdx = innerEmpty.splice(randIdx, 1)[0];
      innerRing.slots[slotIdx] = unplacedTarget.pop();
  }

  // Distribute remaining items into rings, leaving gaps if pool < total slots
  while (pool.length > 0) {
    let emptySlots = [];
    rings.forEach((r, rIdx) => {
      r.slots.forEach((s, sIdx) => {
        if (!s) emptySlots.push({ rIdx, sIdx });
      });
    });
    // Stop if we filled all slots (leave at least 1-2 empty per ring ideally, but math random handles it)
    if (emptySlots.length <= 3) break; 
    const pos = emptySlots[Math.floor(Math.random() * emptySlots.length)];
    rings[pos.rIdx].slots[pos.sIdx] = pool.pop();
  }
}

// --- Input Handling ---
const ignoreInput = (e) => {
  return e.target.closest('.modal-content') || e.target.closest('header') || e.target.tagName === 'BUTTON';
};

window.addEventListener('mousemove', (e) => {
  if (ignoreInput(e)) return;
  const rect = canvas.getBoundingClientRect();
  mouse.x = (e.clientX - rect.left) * (canvas.width / rect.width);
  mouse.y = (e.clientY - rect.top) * (canvas.height / rect.height);
  
  if (arrow.shooting) return;
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  arrow.angle = Math.atan2(mouse.y - cy, mouse.x - cx);
});

window.addEventListener('mousedown', (e) => {
  if (ignoreInput(e)) return;
  const rect = canvas.getBoundingClientRect();
  mouse.x = (e.clientX - rect.left) * (canvas.width / rect.width);
  mouse.y = (e.clientY - rect.top) * (canvas.height / rect.height);
  
  if (arrow.shooting) return;
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  arrow.angle = Math.atan2(mouse.y - cy, mouse.x - cx);
});

window.addEventListener('mouseup', (e) => {
  if (ignoreInput(e)) return;
  if (!arrow.shooting) {
    arrow.shooting = true;
    playSound('shoot');
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    arrow.x = cx + Math.cos(arrow.angle) * config.arrowRadius;
    arrow.y = cy + Math.sin(arrow.angle) * config.arrowRadius;
  }
});

// Touch support
window.addEventListener('touchmove', (e) => {
  if (ignoreInput(e)) return;
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  const touch = e.touches[0];
  mouse.x = (touch.clientX - rect.left) * (canvas.width / rect.width);
  mouse.y = (touch.clientY - rect.top) * (canvas.height / rect.height);
  
  if (arrow.shooting) return;
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  arrow.angle = Math.atan2(mouse.y - cy, mouse.x - cx);
}, { passive: false });

window.addEventListener('touchstart', (e) => {
  if (ignoreInput(e)) return;
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  const touch = e.touches[0];
  mouse.x = (touch.clientX - rect.left) * (canvas.width / rect.width);
  mouse.y = (touch.clientY - rect.top) * (canvas.height / rect.height);
  
  if (arrow.shooting) return;
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  arrow.angle = Math.atan2(mouse.y - cy, mouse.x - cx);
}, { passive: false });

window.addEventListener('touchend', (e) => {
  if (ignoreInput(e)) return;
  e.preventDefault();
  if (!arrow.shooting) {
    arrow.shooting = true;
    playSound('shoot');
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    arrow.x = cx + Math.cos(arrow.angle) * config.arrowRadius;
    arrow.y = cy + Math.sin(arrow.angle) * config.arrowRadius;
  }
});

// --- Update & Rendering ---
function drawBoard() {
  board.innerHTML = '';
  for (let i = 0; i < targetWord.length; i++) {
    const slot = document.createElement('div');
    slot.className = 'letter-slot';
    if (spelledWord[i]) {
      slot.textContent = spelledWord[i];
      slot.classList.add('filled');
    }
    board.appendChild(slot);
  }
}

function updatePhysics(dt) {
  // Rotate rings
  rings.forEach(ring => {
    ring.currentRotation += ring.speed * ring.direction * dt;
  });

  // Move arrow
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;

  if (arrow.shooting) {
    arrow.trail.push({x: arrow.x, y: arrow.y});
    if (arrow.trail.length > 10) arrow.trail.shift();

    // Move towards center
    const dx = cx - arrow.x;
    const dy = cy - arrow.y;
    const dist = Math.hypot(dx, dy);
    
    if (dist < 15) {
      // Hit center emoji! Clear board and penalize.
      spelledWord = [];
      score -= 3;
      playSound('clear');
      drawBoard();
      arrow.shooting = false;
      arrow.trail = [];
    } else {
      arrow.x += (dx / dist) * config.arrowSpeed;
      arrow.y += (dy / dist) * config.arrowSpeed;
      
      // Check collisions with balls
      let hit = false;
      for (let rIdx = 0; rIdx < rings.length; rIdx++) {
        const ring = rings[rIdx];
        for (let sIdx = 0; sIdx < ring.numSlots; sIdx++) {
          const item = ring.slots[sIdx];
          if (!item) continue;
          
          const angle = ring.currentRotation + (sIdx * (Math.PI * 2) / ring.numSlots);
          const bx = cx + Math.cos(angle) * ring.radius;
          const by = cy + Math.sin(angle) * ring.radius;
          
          const bDist = Math.hypot(arrow.x - bx, arrow.y - by);
          if (bDist < config.ballRadius * 1.5) { // Collision
            hitItem(item, rIdx, sIdx, bx, by);
            hit = true;
            break;
          }
        }
        if (hit) break;
      }
    }
  }
}

function hitItem(item, ringIdx, slotIdx, bx, by) {
  arrow.shooting = false;
  arrow.trail = [];
  
  if (item === '⌫') {
    spelledWord.pop();
    score -= 1;
    playSound('backspace');
  } else {
    // Normal letter
    if (spelledWord.length < targetWord.length) {
      if (item === targetWord[spelledWord.length]) {
        // Correct letter
        spelledWord.push(item);
        score += rings[ringIdx].points;
        playSound('hit');
        
        // Calculate confetti origin based on canvas position
        const rect = canvas.getBoundingClientRect();
        const originX = (rect.left + bx * (rect.width / canvas.width)) / window.innerWidth;
        const originY = (rect.top + by * (rect.height / canvas.height)) / window.innerHeight;

        // Fun particle pop
        confetti({
            particleCount: 30,
            spread: 50,
            origin: { x: originX, y: originY },
            colors: ['#00f0ff', '#ff007f', '#ffffff']
        });
      } else {
        // Wrong letter
        spelledWord.push(item);
        playSound('error'); // Negative sound, no points
      }
    }
  }
  
  // Remove item from ring and DO NOT respawn it
  rings[ringIdx].slots[slotIdx] = null;
  drawBoard();

  checkWin();
}

function checkWin() {
  if (spelledWord.join('') === targetWord.join('')) {
    // Win!
    playSound('win');
    
    const isCarousel = false;
    
    const regBtns = document.getElementById('regular-win-btns');
    const carBtns = document.getElementById('carousel-btns');
    
    if (isCarousel) {
        if (regBtns) regBtns.style.display = 'none';
        if (carBtns) carBtns.style.display = 'flex';
        
        let playedGames = urlParams.get('played') ? urlParams.get('played').split(',').filter(Boolean) : [];
        if (!playedGames.includes('OG')) playedGames.push('OG');
        
        const playNextBtn = document.getElementById('carousel-play-next');
        const shareBtn = document.getElementById('carousel-share');
        
        fetch('https://oops-games.com/carousel_config.json')
            .then(res => res.json())
            .then(configList => {
                if (playedGames.length >= configList.length) {
                    if (playNextBtn) playNextBtn.style.display = 'none';
                    if (shareBtn) shareBtn.style.display = 'block';
                }
            }).catch(console.warn);
    } else {
        if (carBtns) carBtns.style.display = 'none';
        if (regBtns) regBtns.style.display = 'flex';
    }
    
    document.getElementById('win-modal').classList.remove('hidden');
    document.getElementById('vic-cypher').textContent = getDailyCypher(3); // O-Gox is game 3
    document.getElementById('vic-score').textContent = `Score: ${score}`;
    if (analytics) {
        let eventParams = { level: 1 };
        logEvent(analytics, 'level_complete', eventParams);
    }
    
    confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.3 }
    });

    // Auto-play hook
    if(urlParams.get('autoplay')) {
        setTimeout(() => { window._VIDEO_RECORDING_DONE = true; }, 1000);
    }
  }
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;

  // Draw Channels (Rings)
  rings.forEach((ring, idx) => {
    ctx.beginPath();
    ctx.arc(cx, cy, ring.radius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = config.ballRadius * 2;
    ctx.stroke();
    
    // Draw neon edge
    ctx.beginPath();
    ctx.arc(cx, cy, ring.radius, 0, Math.PI * 2);
    ctx.strokeStyle = idx === 0 ? 'rgba(255, 0, 127, 0.6)' : idx === 1 ? 'rgba(122, 0, 255, 0.6)' : 'rgba(0, 240, 255, 0.6)';
    ctx.lineWidth = 3;
    ctx.shadowColor = ctx.strokeStyle;
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.shadowBlur = 0; // Reset
  });

  // Draw Balls
  rings.forEach(ring => {
    ring.slots.forEach((item, i) => {
      if (!item) return; // Gap
      const angle = ring.currentRotation + (i * (Math.PI * 2) / ring.numSlots);
      const bx = cx + Math.cos(angle) * ring.radius;
      const by = cy + Math.sin(angle) * ring.radius;

      ctx.beginPath();
      ctx.arc(bx, by, config.ballRadius, 0, Math.PI * 2);
      
      // Gradient Fill
      let grad = ctx.createRadialGradient(bx - 5, by - 5, 2, bx, by, config.ballRadius);
      if (item === '⌫') {
        grad.addColorStop(0, '#ff4d94');
        grad.addColorStop(1, '#cc0052');
      } else {
        grad.addColorStop(0, '#00f0ff');
        grad.addColorStop(1, '#0055ff');
      }
      ctx.fillStyle = grad;
      ctx.fill();
      
      // Glossy highlight
      ctx.beginPath();
      ctx.arc(bx, by, config.ballRadius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255,255,255,0.4)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Text
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 22px Outfit';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 4;
      ctx.fillText(item, bx, by);
      ctx.shadowBlur = 0; // Reset
    });
  });

  // Draw Center Emoji
  ctx.beginPath();
  ctx.arc(cx, cy, 35, 0, Math.PI * 2);
  let bgGrad = ctx.createRadialGradient(cx, cy, 5, cx, cy, 35);
  bgGrad.addColorStop(0, 'rgba(255,255,255,0.2)');
  bgGrad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = bgGrad;
  ctx.fill();

  ctx.font = '50px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(255,255,255,0.5)';
  ctx.shadowBlur = 20;
  ctx.fillText(config.emoji, cx, cy);
  ctx.shadowBlur = 0;

  // Draw Arrow Trail
  if (arrow.shooting && arrow.trail.length > 1) {
    ctx.beginPath();
    ctx.moveTo(arrow.trail[0].x, arrow.trail[0].y);
    for (let i = 1; i < arrow.trail.length; i++) {
      ctx.lineTo(arrow.trail[i].x, arrow.trail[i].y);
    }
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.5)';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  // Draw Arrow
  ctx.save();
  if (arrow.shooting) {
    ctx.translate(arrow.x, arrow.y);
    ctx.rotate(Math.atan2(cy - arrow.y, cx - arrow.x)); // Point along path
  } else {
    // Arrow on outer orbit
    const ax = cx + Math.cos(arrow.angle) * config.arrowRadius;
    const ay = cy + Math.sin(arrow.angle) * config.arrowRadius;
    ctx.translate(ax, ay);
    ctx.rotate(arrow.angle + Math.PI); // Point towards center
  }

  // Draw sleek chevron
  ctx.beginPath();
  ctx.moveTo(18, 0);
  ctx.lineTo(-12, 14);
  ctx.lineTo(-6, 0);
  ctx.lineTo(-12, -14);
  ctx.closePath();
  ctx.fillStyle = '#fff';
  ctx.fill();
  ctx.strokeStyle = '#00f0ff';
  ctx.lineWidth = 2;
  ctx.shadowColor = '#00f0ff';
  ctx.shadowBlur = 15;
  ctx.stroke();
  ctx.restore();
  
  // Draw custom animated reticle
  if (mouse.x !== -100 && mouse.y !== -100 && !arrow.shooting) {
    ctx.save();
    ctx.translate(mouse.x, mouse.y);
    ctx.rotate(Date.now() / 400); // Slowly spin
    
    ctx.beginPath();
    ctx.arc(0, 0, 14, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 0, 127, 0.8)';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#ff007f';
    ctx.shadowBlur = 10;
    ctx.stroke();
    
    // Crosshairs
    ctx.beginPath();
    ctx.moveTo(-20, 0); ctx.lineTo(-8, 0);
    ctx.moveTo(20, 0); ctx.lineTo(8, 0);
    ctx.moveTo(0, -20); ctx.lineTo(0, -8);
    ctx.moveTo(0, 20); ctx.lineTo(0, 8);
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 8;
    ctx.stroke();
    
    // Center dot
    ctx.beginPath();
    ctx.arc(0, 0, 2, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.restore();
  }
  
  // Draw Score
  ctx.fillStyle = '#fff';
  ctx.font = '900 24px Outfit';
  ctx.textAlign = 'left';
  ctx.fillText(`SCORE: ${score}`, 20, 40);
}

function loop(timestamp) {
  if (!lastTime) lastTime = timestamp;
  const dt = timestamp - lastTime;
  lastTime = timestamp;

  updatePhysics(dt);
  render();

  requestAnimationFrame(loop);
}

// --- Start ---
resizeCanvas();
initGame().then(() => {
  drawBoard();
  requestAnimationFrame(loop);
});

// --- Standardized UI Buttons ---
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
});

document.getElementById('btn-tutorial').addEventListener('click', () => {
    document.getElementById('tutorial-modal').classList.remove('hidden');
});

document.getElementById('btn-close-tutorial').addEventListener('click', () => {
    document.getElementById('tutorial-modal').classList.add('hidden');
});

document.getElementById('btn-add-device').addEventListener('click', () => {
    if (analytics) logEvent(analytics, 'install_prompt_clicked');
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then(() => { deferredPrompt = null; });
    } else {
        alert("App is already installed or not supported on this browser.");
    }
});

document.getElementById('btn-share').addEventListener('click', () => {
    const text = `🐯 O-Gox\nI scored ${score} points!\n\nPlay free at https://o-gox.web.app`;
    if (navigator.share) {
        navigator.share({ title: 'O-Gox', text: text }).catch(console.error);
    } else {
        navigator.clipboard.writeText(text).then(() => {
            alert('Copied to clipboard!');
        });
    }
    if (analytics) logEvent(analytics, 'brag_clicked');
});

document.getElementById('btn-binge').addEventListener('click', () => {
    if (analytics) logEvent(analytics, 'binge_presale_click');
    window.location.href = 'https://oops-games.com/presale.html';
});

document.getElementById('btn-hub').addEventListener('click', () => {
    if (analytics) logEvent(analytics, 'hub_clicked');
    window.location.href = 'https://oops-games.com';
});



// Carousel Logic
const isCarousel = false;
if (isCarousel && typeof analytics !== 'undefined' && analytics) { logEvent(analytics, 'carousel_visit', { game_id: 'OG' }); }
const playedGamesStr = urlParams.get('played') || '';

if (urlParams.get('mockPurchase') === 'true') {
    // OGox doesn't seem to have binge token system implemented, but we can store it anyway
    let count = parseInt(localStorage.getItem('bingeTokens') || '0');
    count += 5;
    localStorage.setItem('bingeTokens', count);
    
    const newUrl = window.location.href.replace(/([&?])mockPurchase=true&?/, '$1').replace(/&$/, '').replace(/\?$/, '');
    window.history.replaceState({}, '', newUrl);
    setTimeout(() => alert('Mock Purchase Successful! Added 5 Binge Tokens.'), 100);
}

if (isCarousel) {
    const headerNext = document.getElementById('header-carousel-next');
    if (headerNext) headerNext.style.display = 'block';
}

const advanceCarousel = async (isAnotherRide = false) => {
    let currentPlayed = playedGamesStr ? playedGamesStr.split(',').filter(Boolean) : [];
    if (!currentPlayed.includes('OG')) currentPlayed.push('OG');
    
    if (isAnotherRide) {
        currentPlayed = ['OG'];
    }
    
    try {
        const res = await fetch('https://oops-games.com/carousel_config.json');
        const configList = await res.json();
        const unplayed = configList.filter(g => !currentPlayed.includes(g.id));
        if (unplayed.length > 0) {
            const nextGame = unplayed[Math.floor(Math.random() * unplayed.length)];
            window.location.href = `${nextGame.url}?carousel=true&played=${currentPlayed.join(',')}`;
        } else {
            window.location.href = 'https://oops-games.com/';
        }
    } catch(e) {
        window.location.href = 'https://oops-games.com/';
    }
};

// Autoplay for Video Gen
async function autoPlayLogic(mode) {
    const sleep = (ms) => new Promise(r => setTimeout(r, ms));
    await sleep(1000);
    
    const isSplit = mode === 'split';
    const speedMultiplier = isSplit ? 3 : 1;
    const delay = 2000 / speedMultiplier;
    
    while(spelledWord.length < targetWord.length) {
        if (window._VIDEO_RECORDING_DONE) break;
        
        let targetLetter = targetWord[spelledWord.length];
        let found = null;
        for(let r=0; r<rings.length; r++){
            for(let s=0; s<rings[r].slots.length; s++){
                if(rings[r].slots[s] === targetLetter){
                    found = {r, s}; break;
                }
            }
            if(found) break;
        }
        
        if (found) {
            let ring = rings[found.r];
            let angle = ring.currentRotation + (found.s * (Math.PI * 2) / ring.numSlots);
            const cx = canvas.width / 2;
            const cy = canvas.height / 2;
            let bx = cx + Math.cos(angle) * ring.radius;
            let by = cy + Math.sin(angle) * ring.radius;
            
            mouse.x = bx;
            mouse.y = by;
            
            await sleep(delay / 2);
            
            // To hit a moving target perfectly, we cheat slightly and aim a bit ahead
            angle = ring.currentRotation + (found.s * (Math.PI * 2) / ring.numSlots) + (ring.speed * ring.direction * 150);
            bx = cx + Math.cos(angle) * ring.radius;
            by = cy + Math.sin(angle) * ring.radius;
            
            arrow.angle = Math.atan2(by - cy, bx - cx);
            if (!arrow.shooting) {
                arrow.shooting = true;
                playSound('shoot');
                arrow.x = cx + Math.cos(arrow.angle) * config.arrowRadius;
                arrow.y = cy + Math.sin(arrow.angle) * config.arrowRadius;
            }
            
            while(arrow.shooting) {
                await sleep(50);
            }
            await sleep(delay / 2);
        } else {
            break;
        }
    }
}

if (urlParams.get('autoplay')) {
    autoPlayLogic(urlParams.get('autoplay'));
}

document.getElementById("carousel-play-next")?.addEventListener("click", () => advanceCarousel(false));
document.getElementById("header-carousel-next")?.addEventListener("click", () => advanceCarousel(false));

document.getElementById("carousel-binge")?.addEventListener("click", () => {
    if (analytics) logEvent(analytics, 'binge_presale_click');
    let playedGames = playedGamesStr ? playedGamesStr.split(',').filter(Boolean) : [];
    if (!playedGames.includes('OG')) playedGames.push('OG');
    window.location.href = 'https://oops-games.com/presale.html?carousel=true&played=' + playedGames.join(',') + '&returnUrl=' + encodeURIComponent(window.location.href);
});

document.getElementById("carousel-share")?.addEventListener("click", async () => {
    const text = "I rode the carousel at oops-games.";
    if (navigator.share) {
        try {
            await navigator.share({ title: 'Oops-Games Carousel', text });
            await advanceCarousel(true);
        } catch(e) { console.warn(e); }
    } else {
        navigator.clipboard.writeText(text).then(() => {
            alert("Copied to clipboard!");
            setTimeout(() => advanceCarousel(true), 1000);
        });
    }
});
