import { STATE_EDGE, STATE_EMPTY } from './Grid.js';

export class EdgeBlockManager {
    constructor() {
        this.blocks = [];
        this.timer = 0;
        this.state = 'WAITING'; // WAITING or ACTIVE 
        this.waitDuration = 300;   // 10 sec (30 FPS * 10)
        this.activeDuration = 150;  // 5 sec (30 FPS * 5)

        this.image = new Image();
        this.image.src = "src/assets/block.png";
    }

    // 5 block create in random edge cell and direction
    spawnMultipleBlocks(grid, count = 5) {
        this.blocks = []; // Önceki kalanları temizle
        let validEdgeCells = [];

        for (let r = 0; r < grid.rows; r++) {
            for (let c = 0; c < grid.cols; c++) {
                if (grid.getState(c, r) === STATE_EDGE) {
                    let neighbors = [
                        { x: c + 1, y: r, direction: 'right' },
                        { x: c - 1, y: r, direction: 'left' },
                        { x: c, y: r + 1, direction: 'down' },
                        { x: c, y: r - 1, direction: 'up' }
                    ];

                    for (let n of neighbors) {
                        if (grid.getState(n.x, n.y) === STATE_EMPTY) {
                            validEdgeCells.push({ x: c, y: r, direction: n.direction });
                            break;
                        }
                    }
                }
            }
        }

        // select random edge cells for create blocks cause want to different location to every block 
        for (let i = 0; i < count; i++) {
            if (validEdgeCells.length === 0) break;
            const randomIndex = Math.floor(Math.random() * validEdgeCells.length);
            const target = validEdgeCells.splice(randomIndex, 1)[0];

            this.blocks.push({
                x: target.x,
                y: target.y,
                direction: target.direction,
                color: "#ff9900"
            });
        }
    }

    update(grid) {
        this.timer++;

        if (this.state === 'WAITING') {
            // after 10 seconds, spawn 5 blocks and change state to ACTIVE
            if (this.timer >= this.waitDuration) {
                this.spawnMultipleBlocks(grid, 5);
                this.state = 'ACTIVE';
                this.timer = 0;
            }
        } else if (this.state === 'ACTIVE') {
            // when 5 seconds are complete , clear the blocks and go back to waiting state
            if (this.timer >= this.activeDuration) {
                this.blocks = [];
                this.state = 'WAITING';
                this.timer = 0;
            }
        }
    }

    checkCapturedBlocks(grid) {
        let earnedScore = 0;
        for (let i = this.blocks.length - 1; i >= 0; i--) {
            let block = this.blocks[i];

            let targetX = block.x;
            let targetY = block.y;
            if (block.direction === 'right') targetX += 1;
            else if (block.direction === 'left') targetX -= 1;
            else if (block.direction === 'down') targetY += 1;
            else if (block.direction === 'up') targetY -= 1;

            if (grid.getState(targetX, targetY) === 3) {
                this.blocks.splice(i, 1);
                earnedScore += 100;
            }
        }
        return earnedScore;
    }

    draw(ctx, cellSize) {
        const depthSize = cellSize * 5;     
        const thicknessSize = cellSize * 5; 

        for (let block of this.blocks) {
            ctx.fillStyle = block.color;
            let drawX = block.x * cellSize;
            let drawY = block.y * cellSize; 
            let drawWidth = cellSize;
            let drawHeight = cellSize;

            if (block.direction === 'right') {
                drawWidth = depthSize;     
                drawHeight = thicknessSize; 
            } else if (block.direction === 'left') {
                drawX = (block.x * cellSize) - depthSize + cellSize;
                drawWidth = depthSize;     
                drawHeight = thicknessSize; 
            } else if (block.direction === 'down') {
                drawWidth = thicknessSize; 
                drawHeight = depthSize;    
            } else if (block.direction === 'up') {
                drawY = (block.y * cellSize) - depthSize + cellSize;
                drawWidth = thicknessSize; 
                drawHeight = depthSize;    
            }

            if (this.image.complete && this.image.naturalWidth !== 0) {
                ctx.drawImage(this.image, drawX, drawY, drawWidth, drawHeight);
            } else {
                ctx.fillRect(drawX, drawY, drawWidth, drawHeight);
            }
        }
    }
}