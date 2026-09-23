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
    /*
        * when the drawing completed empty places in grid sort with BFS
        * make it deactive the small area (STATE_DEACTIVE = 3 )
        * make the path player drawing (STATE_PATH = 2) the edge (STATE_EDGE = 1)
    */

    completeAreaCapture(){
        const visited = Array.from({ length: this.rows }, () => new Array(this.cols).fill(false));
        const regions = []; //captured area

        //search all grid and find independent STATE_EMPTY 
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                if(this.matrix[r][c] === STATE_EMPTY && !visited[r][c]){
                    const currentRegion = [];
                    const queue = [{ x: c, y: r}];
                    visited[r][c] = true;

                    while(queue.length > 0){
                        const { x, y } = queue .shift();
                        currentRegion.push({ x, y });

                        const neighbors = [
                            { x: x + 1, y },
                            { x: x - 1, y },
                            { x, y: y + 1 },
                            { x, y: y - 1 }
                        ];

                        for (let n of neighbors){
                            if(n.x >= 0 && n.x < this.cols && n.y >=0 && n.y < this.rows){
                                if(!visited[n.y][n.x] && this.matrix[n.y][n.x] === STATE_EMPTY){
                                    visited[n.y][n.x] = true;
                                    queue.push(n);
                                }
                            }
                        }
                    }
                    regions.push(currentRegion);
                }
            }
        }
        // if there are lots of area make it deactive small one 
        
        if (regions.length > 1 ){
            //small area
            regions.sort((a,b) => a.length -b.length);

            //deactivate small area
            const smallestRegion = regions[0];
            for ( let cell of smallestRegion){
                this.matrix[cell.y][cell.x] = STATE_DEACTIVE;
            }
        }

        //generate new edge
        for (let r = 0; r < this.rows ; r++){
            for (let c = 0; c < this.cols ; c++){
                if(this.matrix[r][c] === STATE_PATH){
                    this.matrix[r][c] = STATE_EDGE;
                }
            }
        }

        this.cleanOrphanEdges();

    }

    /*
        * detect the STATE_EMPTY and STATE_EDGE
        * make other areas and edges deactive and clean up
    */
    cleanOrphanEdges() {
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                if (this.matrix[r][c] === STATE_EDGE) {
                    let hasEmptyNeighbor = false;
                    const neighbors = [
                        { r: r + 1, c }, { r: r - 1, c },
                        { r, c: c + 1 }, { r, c: c - 1 }
                    ];

                    for (let n of neighbors) {
                        if (this.getState(n.c, n.r) === STATE_EMPTY) {
                            hasEmptyNeighbor = true;
                            break;
                        }
                    }

                    if (!hasEmptyNeighbor) {
                        this.matrix[r][c] = STATE_DEACTIVE;
                    }
                }
            }
        }
    }

    // 
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