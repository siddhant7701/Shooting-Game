const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 400;
canvas.height = 400;

let shots = 0;
let hits = 0;
let level = 1;
let highScore = 0;

const targetRadius = 20;
const targets = [];
const blastRadius = 35; // Increased blast radius for better effect
const blastDuration = 300; // milliseconds
const maxTargets = 5; // Maximum number of targets on screen

const cursorImg = new Image();
cursorImg.src = 'crosshair.png';

let mouseX = 0;
let mouseY = 0;

// Wait for the crosshair image to load
cursorImg.onload = () => {
    // Event Listeners
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
    });

    canvas.addEventListener('click', (e) => {
        shots++;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        createBlast(x, y);
        checkBlastHits(x, y);
        updateStats();
    });

    gameLoop();
};

// Popup elements
const levelUpPopup = document.getElementById('levelUpPopup');
const continueBtn = document.getElementById('continueBtn');
const restartBtn = document.getElementById('restartBtn');
const nextLevelText = document.getElementById('nextLevel');

continueBtn.addEventListener('click', continueGame);
restartBtn.addEventListener('click', restartGame);

function drawCursor() {
    ctx.drawImage(cursorImg, mouseX - 16, mouseY - 16, 32, 32);
}

function createTarget() {
    const x = Math.random() * (canvas.width - 2 * targetRadius) + targetRadius;
    const y = Math.random() * (canvas.height - 2 * targetRadius) + targetRadius;
    const dx = (Math.random() - 0.5) * 4 * level;
    const dy = (Math.random() - 0.5) * 4 * level;
    targets.push({ x, y, dx, dy });
}

function drawTargets() {
    targets.forEach(target => {
        target.x += target.dx;
        target.y += target.dy;

        if (target.x < targetRadius || target.x > canvas.width - targetRadius) {
            target.dx = -target.dx;
        }
        if (target.y < targetRadius || target.y > canvas.height - targetRadius) {
            target.dy = -target.dy;
        }

        // Draw new target with shadow
        ctx.beginPath();
        ctx.arc(target.x, target.y, targetRadius, 0, 2 * Math.PI);
        const gradient = ctx.createRadialGradient(target.x, target.y, targetRadius / 2, target.x, target.y, targetRadius);
        gradient.addColorStop(0, 'white');
        gradient.addColorStop(1, 'red');
        ctx.fillStyle = gradient;
        ctx.fill();

        // Add shadow
        ctx.shadowColor = 'black';
        ctx.shadowBlur = 122;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        ctx.strokeStyle = 'white';
        ctx.stroke();
    });
}

function checkBlastHits(blastX, blastY) {
    let hitCount = 0;
    for (let i = targets.length - 1; i >= 0; i--) {
        const target = targets[i];
        const dist = Math.sqrt((blastX - target.x) ** 2 + (blastY - target.y) ** 2);
        if (dist < blastRadius + targetRadius) {
            hits++;
            hitCount++;
            createBlast(target.x, target.y);
            targets.splice(i, 1);
        }
    }

    if (hitCount > 0 && targets.length === 0) {
        levelUp();
    }
}

const blasts = [];

function createBlast(x, y) {
    blasts.push({ x, y, startTime: Date.now() });
}

function drawBlasts() {
    for (let i = blasts.length - 1; i >= 0; i--) {
        const blast = blasts[i];
        const elapsed = Date.now() - blast.startTime;

        if (elapsed > blastDuration) {
            blasts.splice(i, 1);
            continue;
        }

        const opacity = 1 - elapsed / blastDuration;
        const currentRadius = blastRadius * (1 - opacity); // Expanding blast effect
        ctx.beginPath();
        ctx.arc(blast.x, blast.y, currentRadius, 0, 2 * Math.PI);
        ctx.fillStyle = `rgba(275, 255, 0, ${opacity})`;
        ctx.fill();
    }
}

function updateStats() {
    const accuracy = shots === 0 ? 0 : ((hits / shots) * 100).toFixed(2);
    document.getElementById('shots').innerText = shots;
    document.getElementById('hits').innerText = hits;
    document.getElementById('accuracy').innerText = accuracy;
    document.getElementById('level').innerText = level;
    document.getElementById('highScore').innerText = highScore;
}

function levelUp() {
    highScore = Math.max(hits, highScore);
    levelUpPopup.style.display = 'flex';
    nextLevelText.innerText = level + 1;
}

function continueGame() {
    level++;
    initializeLevel();
    levelUpPopup.style.display = 'none';
}

function restartGame() {
    level = 1;
    hits = 0;
    shots = 0;
    initializeLevel();
    levelUpPopup.style.display = 'none';
}

function initializeLevel() {
    targets.length = 0;
    for (let i = 0; i < maxTargets; i++) {
        createTarget();
    }
    updateStats();
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawTargets();
    drawBlasts();
    drawCursor();
    requestAnimationFrame(gameLoop);
}

// Start the game by initializing the first level
initializeLevel();