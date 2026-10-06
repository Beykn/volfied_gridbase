import { STATE_EMPTY, STATE_EDGE, STATE_PATH, STATE_DEACTIVE } from "./Grid.js";

export class Player {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
        this.protection = true; // safe or not 
        this.pathArray = [];    // path array

        this.winGame = false; // win game or not

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

        //if no keys
        if (dx === 0 && dy === 0) return;

        const nextX = this.x + dx;
        const nextY = this.y + dy;

        const targetState = grid.getState(nextX, nextY);

        // RULE: Player cannot go out of the grid and deactive place 
        if (targetState === null || targetState === STATE_DEACTIVE) {
            return;
        }

        //RULE: If player go to game zone(STATE_EMPTY) player should the use space 
        if (targetState === STATE_EMPTY && !keys.Space) {
            return; 
        }
        
    
        // STAGE 1: Protection on (SAFE ZONE)
        if (this.protection) {
            if (targetState === STATE_EDGE) {
                this.x = nextX;
                this.y = nextY;
            }
            else if (targetState === STATE_EMPTY) {

                if (targetState === STATE_EMPTY && !keys.Space) {
                    return; // It does not move unless the "space"  is held down
                }

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
            //If player go back the drawing path 
            if(this.pathArray.length > 1){
                const prevPoint = this.pathArray[this.pathArray.length - 2];

                if (nextX === prevPoint.x && nextY === prevPoint.y) {
                    // Remove the last point from the path array and set the grid state back to STATE_EMPTY
                    grid.setState(this.x, this.y, STATE_EMPTY);
                    this.pathArray.pop();

                    // Move the player back to the previous point 
                    this.x = nextX;
                    this.y = nextY;
                    return;
                }
            }
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
        
        grid.completeAreaCapture();

        this.pathArray = [];
        this.protection = true;
    }

    draw(ctx, cellSize) {

        const offset = (this.size - cellSize) / 2;

        // Safe green, draw yellow, if win game draw blue
        if (this.winGame) {
            ctx.fillStyle = "#00ffee"; 
        } else {
            ctx.fillStyle = this.protection ? "#34ef05" : "#ffff00";
        }
        
        ctx.fillRect(
            this.x * cellSize - offset, 
            this.y * cellSize - offset, 
            this.size, 
            this.size
        );
        
    }
}