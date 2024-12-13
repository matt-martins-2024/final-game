const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Resize canvas to fill window
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas(); // initial call

// Load images
const playerImg = new Image();
playerImg.src = 'images/player.png';

const shardImg = new Image();
shardImg.src = 'images/shard.png';

const enemyImg = new Image();
enemyImg.src = 'images/enemy.png';

// Game constants (adjust based on canvas size)
let GRAVITY = 0.5;
let PLAYER_SPEED = 3;
let JUMP_FORCE = -10;

// The ground will be near the bottom of the screen
function groundLevel() {
    return canvas.height - 100; 
}

// Game state
let keys = { left: false, right: false, up: false };
let score = 0;
let health = 3;

let player = {
    x: canvas.width * 0.1,
    y: groundLevel(),
    width: 32,
    height: 32,
    vx: 0,
    vy: 0,
    grounded: true
};

let shards = [
    { x: canvas.width * 0.3, y: groundLevel() - 50, collected: false },
    { x: canvas.width * 0.5, y: groundLevel() - 50, collected: false }
];

let enemy = { 
    x: canvas.width * 0.7, 
    y: groundLevel(), 
    width: 32, 
    height: 32, 
    vx: 1 
};

// Keyboard listeners
document.addEventListener('keydown', (e) => {
    if (e.code === 'ArrowLeft') keys.left = true;
    if (e.code === 'ArrowRight') keys.right = true;
    if (e.code === 'Space') keys.up = true;
});

document.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowLeft') keys.left = false;
    if (e.code === 'ArrowRight') keys.right = false;
    if (e.code === 'Space') keys.up = false;
});

function update() {
    // Horizontal movement
    player.vx = 0;
    if (keys.left) player.vx = -PLAYER_SPEED;
    if (keys.right) player.vx = PLAYER_SPEED;
    player.x += player.vx;

    // Jump
    if (keys.up && player.grounded) {
        player.vy = JUMP_FORCE;
        player.grounded = false;
    }

    // Gravity
    player.vy += GRAVITY;
    player.y += player.vy;

    // Ground collision
    if (player.y + player.height > groundLevel() + player.height) {
        player.y = groundLevel();
        player.vy = 0;
        player.grounded = true;
    }

    // Collect shards
    for (let shard of shards) {
        if (!shard.collected &&
            player.x < shard.x + 20 &&
            player.x + player.width > shard.x &&
            player.y < shard.y + 20 &&
            player.y + player.height > shard.y) {
            shard.collected = true;
            score++;
        }
    }

    // Enemy movement
    enemy.x += enemy.vx;
    // Make the enemy patrol between two points
    if (enemy.x < canvas.width * 0.6) enemy.vx = 1;
    if (enemy.x > canvas.width * 0.8) enemy.vx = -1;

    // Check enemy collision
    if (player.x < enemy.x + enemy.width &&
        player.x + player.width > enemy.x &&
        player.y < enemy.y + enemy.height &&
        player.y + player.height > enemy.y) {
        health--;
        player.x -= 50; // Knockback
        if (health < 0) health = 0;
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw player
    ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);

    // Draw shards
    for (let shard of shards) {
        if (!shard.collected) {
            ctx.drawImage(shardImg, shard.x, shard.y, 20, 20);
        }
    }

    // Draw enemy
    ctx.drawImage(enemyImg, enemy.x, enemy.y, enemy.width, enemy.height);

    // HUD
    ctx.fillStyle = '#fff';
    ctx.font = '16px sans-serif';
    ctx.fillText('Score: ' + score, 20, 30);
    ctx.fillText('Health: ' + health, 20, 50);
    ctx.fillText('Matthew Martins', canvas.width - 120, 30);

    if (health <= 0) {
        ctx.font = '48px sans-serif';
        ctx.fillStyle = 'red';
        ctx.fillText('Game Over!', canvas.width / 2 - 100, canvas.height / 2);
    }
}

function loop() {
    if (health > 0) update();
    draw();
    requestAnimationFrame(loop);
}

// Wait until images load before starting
playerImg.onload = () => {
    shardImg.onload = () => {
        enemyImg.onload = () => {
            loop();
        };
    };
};
