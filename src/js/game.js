import { Grid } from './Grid.js';
import { Player } from './Player.js';
import { Enemy } from './Enemy.js';
import { UIManager } from './UIManager.js'; 

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const GRID_WIDTH = 300;
const GRID_HEIGHT = 200;
const CELL_SIZE = 4;

const MARGIN = 20;

canvas.width = (GRID_WIDTH * CELL_SIZE) + (MARGIN * 2);   // 1200 + 40 = 1240 px
canvas.height = (GRID_HEIGHT * CELL_SIZE) + (MARGIN * 2); // 800 + 40 = 840 px

const grid = new Grid(GRID_WIDTH, GRID_HEIGHT);
const player = new Player(0, 0);
const enemy = new Enemy(150, 100, 15, 5);
const uiManager = new UIManager(); 

// (Score, Lives, Timer)
let score = 0.0;
let lives = 3;
let timeLeft = 180; 

// 3. Geri sayım sayacı
setInterval(() => {
    if (timeLeft > 0) {
        timeLeft--;
        uiManager.updateTimer(timeLeft);
    } else {
        // TODO: game over
    }
}, 1000);

// keys
const keys = {
    Space: false,
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false
};

window.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
        keys.Space = true;
        e.preventDefault();
    }
    if (keys.hasOwnProperty(e.key)) keys[e.key] = true;
});

window.addEventListener("keyup", (e) => {
    if (e.code === "Space") {
        keys.Space = false;
        e.preventDefault();
    }
    if (keys.hasOwnProperty(e.key)) keys[e.key] = false;
});

function update() {
    player.update(keys, grid, enemy, player);
    enemy.update(grid, player);

    uiManager.updateScore(score);
    uiManager.updateLives(lives);
}

function draw() {
    
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(MARGIN, MARGIN);

    grid.draw(ctx);
    player.draw(ctx, CELL_SIZE);
    enemy.draw(ctx, CELL_SIZE);

    ctx.restore();
}

function gameLoop() {
    if (player.winGame) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.save();
        ctx.translate(MARGIN, MARGIN);
        grid.draw(ctx);
        player.draw(ctx, CELL_SIZE);
        ctx.restore();

        ctx.fillStyle = "#00ffee";
        ctx.font = "32px Arial";
        ctx.textAlign = "center";
        ctx.fillText("CONGRATULATIONS !\n YOU WON !", canvas.width / 2, canvas.height / 2);
        return;
    }

    update();
    draw();

    setTimeout(() => {
        requestAnimationFrame(gameLoop);
    }, 1000 / 30);
}

gameLoop();