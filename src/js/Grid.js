export const STATE_EMPTY = 0; //GAME ZONE
export const STATE_EDGE = 1; //SAFE ZONE
export const STATE_PATH = 2; // DRAWING
export const STATE_DEACTIVE = 3; // DEACTİVE

export class Grid{
    constructor(cols = 300, rows = 200, cellSize = 4){
        this.cols = cols;
        this.rows = rows;
        this.cellSize = cellSize;

        // game zone matrix (300x200)
        this.matrix = Array.from({length: this.rows}, () =>
            new Array(this.cols).fill(STATE_EMPTY)
        );

        this.initBoundary();
    }

    // safe zone
    initBoundary(){
        for(let r = 0; r < this.rows; r++ ){
            for(let c = 0; c < this.cols; c++){
                if (r === 0 || r === this.rows - 1 || c === 0 || c === this.cols - 1) {
                    this.matrix[r][c] = STATE_EDGE;
                }
            }
        }

    }

    //
    getState(x,y) {
        if( x < 0 || x >= this.cols || y < 0 || y >= this.rows) return null;
        return this.matrix[y][x];
    }

    //
    setState(x, y, state){
        if(x >= 0 && x < this.cols && y >= 0 && y < this.rows){
            this.matrix[y][x] = state;
        }
    }

    // Grid'i Canvas'a Çiz
    draw(ctx) {
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const state = this.matrix[r][c];

                if (state === STATE_EDGE) {
                    ctx.fillStyle = "#ffffff"; // EDGE
                    ctx.fillRect(c * this.cellSize, r * this.cellSize, this.cellSize, this.cellSize);
                } else if (state === STATE_PATH) {
                    ctx.fillStyle = "#ff0055"; // PATH
                    ctx.fillRect(c * this.cellSize, r * this.cellSize, this.cellSize, this.cellSize);
                } else if (state === STATE_DEACTIVE) {
                    ctx.fillStyle = "#222222"; // DEACTIVE
                    ctx.fillRect(c * this.cellSize, r * this.cellSize, this.cellSize, this.cellSize);
                }
            }
        }
    }


}