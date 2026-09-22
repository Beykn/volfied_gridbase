import { STATE_EMPTY, STATE_EDGE, STATE_PATH, STATE_DEACTIVE } from "./Grid.js";

export class Player {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
        this.protection = true; // safe or not 
        this.pathArray = [];    // path array

        this.size = 30; //player size
    }

    update(keys, grid) {
        let dx = 0;
        let dy = 0;

        // Keys input
        if (keys.ArrowUp) dy = -1;
        else if (keys.ArrowDown) dy = 1;
        else if (keys.ArrowLeft) dx = -1;
        else if (keys.ArrowRight) dx = 1;

        if (dx === 0 && dy === 0) return;

        const nextX = this.x + dx;
        const nextY = this.y + dy;

        const targetState = grid.getState(nextX, nextY);

        // RULE: Player cannot go out of the grid and deactive place 
        if (targetState === null || targetState === STATE_DEACTIVE) {
            return;
        }

        // STAGE 1: Protection on (SAFE ZONE)
        if (this.protection) {
            if (targetState === STATE_EDGE) {
                this.x = nextX;
                this.y = nextY;
            }
            else if (targetState === STATE_EMPTY) {
                this.protection = false;
                this.x = nextX;
                this.y = nextY;

                // Make it path 
                grid.setState(this.x, this.y, STATE_PATH);
                this.pathArray.push({ x: this.x, y: this.y });
            }
        }
        // STAGE 2: Protection off (GAME ZONE)
        else {
            if (targetState === STATE_EMPTY) {
                this.x = nextX;
                this.y = nextY;
                grid.setState(this.x, this.y, STATE_PATH);
                this.pathArray.push({ x: this.x, y: this.y });
            }
            else if (targetState === STATE_EDGE || targetState === STATE_PATH) {
                // Son ulaşılan hücreyi de diziye/grid'e dâhil edip çizimi bitir
                this.x = nextX;
                this.y = nextY;

                this.completeDrawing(grid);
            }
        }
    }

    completeDrawing(grid) {
        // Generate a new edge with new points
        for (let pt of this.pathArray) {
            grid.setState(pt.x, pt.y, STATE_EDGE);
        }

        this.pathArray = [];
        this.protection = true;
    }

    draw(ctx, cellSize) {

        const offset = (this.size - cellSize) / 2;

        // Safe green, draw yellow
        ctx.fillStyle = this.protection ? "#34ef05" : "#ffff00";
        ctx.fillRect(
            this.x * cellSize - offset, 
            this.y * cellSize - offset, 
            this.size, 
            this.size
        );
    }
}