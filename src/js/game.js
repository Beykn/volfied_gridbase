import { Grid } from './Grid.js';
import { Player } from './Player.js';
import { Enemy } from './Enemy.js';
import { UIManager } from './UIManager.js';
import { EdgeBlockManager } from './EdgeBlockManager.js';


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
const enemy = new Enemy(150, 100, 20, 10);
const uiManager = new UIManager();
const blockManager = new EdgeBlockManager();

// (Score, Lives, Timer)
let score = 0;
let timeLeft = 180;
let gameStarted = false; // Flag to check if the game has started
let timerInterval = null; // Declare timerInterval in the outer scope so it can be cleared later

// keys
const keys = {
    Space: false,
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false
};

window.addEventListener("keydown", (e) => {
    if (!gameStarted) return; // Ignore key presses if the game hasn't started yet
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

// Start button event listener
document.getElementById("startButton").addEventListener("click", () => {
    document.getElementById("start-screen").style.display = "none";
    gameStarted = true;

    //start the timer countdown
    const timerInterval = setInterval(() => {
        if (timeLeft > 0) {
            timeLeft--;
            uiManager.updateTimer(timeLeft);
        } else {
            clearInterval(timerInterval);
        }
    }, 1000);

    gameLoop();
});

function update() {
    // Oyuncuyu ve çizim/alan kapatma durumunu tek bir yerde güncelle
    let areaCaptured = player.update(keys, grid, enemy);
    
    if (areaCaptured) {
        let earnedScore = blockManager.checkCapturedBlocks(grid);
        if (earnedScore > 0) {
            score += earnedScore;
        }
    }

    // Düşman hareketlerini ve mermileri güncelle
    enemy.update(grid, player, uiManager);
    
    // Blok yöneticisini güncelle (10s bekle / 5s göster mantığı için grid parametresi veridi)
    blockManager.update(grid);

    // Arayüzü (Score ve Lives) güncelle
    uiManager.updateScore(score);
    uiManager.updateLives(player.lives);
}

function draw() {
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(MARGIN, MARGIN);

    grid.draw(ctx);

    player.draw(ctx, CELL_SIZE);
    enemy.draw(ctx, CELL_SIZE);
    blockManager.draw(ctx, CELL_SIZE);
    ctx.restore();
}

function textScreen(text) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(MARGIN, MARGIN);
    grid.draw(ctx);
    player.draw(ctx, CELL_SIZE);
    ctx.restore();

    ctx.fillStyle = "#00ffee";
    ctx.font = "32px Arial";
    ctx.textAlign = "center";

    ctx.fillText(text, canvas.width / 2, canvas.height / 2);
}

function gameLoop() {

    if (!gameStarted) return;
    if (player.winGame) {
        clearInterval(timerInterval); 
        textScreen("CONGRATULATIONS! YOU WON !");
        return;
    }
    if (timeLeft == 0 || player.gameOver) {
        clearInterval(timerInterval);
        textScreen("GAME OVER!");
        return;
    }
    // if gameover true , display gameover text and stop the game loop
    if (player.gameOver) {
        clearInterval(timerInterval);
        textScreen("GAME OVER!");
        return;
    }
    update();
    draw();
    setTimeout(() => {
        requestAnimationFrame(gameLoop);
    }, 1000 / 30);
}
