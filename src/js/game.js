import { Grid } from './Grid.js';
import { Player } from './Player.js';

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


// keys
const keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false
};

window.addEventListener("keydown", (e) => {
    if (keys.hasOwnProperty(e.key)) keys[e.key] = true;
});

window.addEventListener("keyup", (e) => {
    if (keys.hasOwnProperty(e.key)) keys[e.key] = false;
});

function update() {
    player.update(keys, grid);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(MARGIN, MARGIN);

    grid.draw(ctx);

    player.draw(ctx, CELL_SIZE);

    ctx.restore();
}

function gameLoop() {
    update();
    draw();
    
    setTimeout(() => {
        requestAnimationFrame(gameLoop);
    }, 1000 / 30);
}

gameLoop();