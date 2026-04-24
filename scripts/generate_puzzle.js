const fs = require('fs');
const path = require('path');

// List of animals and their emojis
const animals = [
    { name: "CAT", emoji: "🐱" },
    { name: "DOG", emoji: "🐶" },
    { name: "MOUSE", emoji: "🐭" },
    { name: "RABBIT", emoji: "🐰" },
    { name: "FOX", emoji: "🦊" },
    { name: "BEAR", emoji: "🐻" },
    { name: "PANDA", emoji: "🐼" },
    { name: "KOALA", emoji: "🐨" },
    { name: "TIGER", emoji: "🐯" },
    { name: "LION", emoji: "🦁" },
    { name: "COW", emoji: "🐮" },
    { name: "PIG", emoji: "🐷" },
    { name: "FROG", emoji: "🐸" },
    { name: "MONKEY", emoji: "🐵" }
];

// O-Gox specific constraint: The inner ring only has 8 slots.
// We must ensure the animal's name is not too long for play.
const MAX_LENGTH = 8;
const validAnimals = animals.filter(a => a.name.length <= MAX_LENGTH);

if (validAnimals.length === 0) {
    throw new Error(`No animals found with name length <= ${MAX_LENGTH}`);
}

const randomAnimal = validAnimals[Math.floor(Math.random() * validAnimals.length)];

const puzzleConfig = {
    animalName: randomAnimal.name,
    emoji: randomAnimal.emoji,
    date: new Date().toISOString()
};

const outPath = path.join(__dirname, '../public/daily_puzzle.json');
fs.writeFileSync(outPath, JSON.stringify(puzzleConfig, null, 2));

console.log(`Generated daily puzzle: ${randomAnimal.name} ${randomAnimal.emoji} at ${outPath}`);
