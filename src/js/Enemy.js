export class Enemy {
    constructor(gridX, gridY, radius, speed) {
        this.x = gridX;
        this.y = gridY;
        this.radius = radius;
        this.speed = speed;

        // Assign a random movement 
        this.angle = Math.random() * Math.PI * 2; // Random angle in radians
        
        // Calculate velocity components for x and y axes based on movement angle
        this.vx = Math.cos(this.angle) * this.speed;
        this.vy = Math.sin(this.angle) * this.speed;

        this.bullets = [];     // Array holding active bullets
        this.moveTimer = 30; // controls the enemy movement 
       
    }

    update(grid, player) {
    //  If there is a bullet on the screen , the enemy does not move
    if (this.bullets.length > 0) {
        
        this.handleShooting(grid, player);
        return;
    }

    // There is no bullet on the screen , the enemy can move in a time 
    if (this.moveTimer > 0) {
        this.moveTimer--; // enemy movement timer decreases by 1 each frame

        
        let nextX = this.x + (this.vx / grid.cellSize);
        let nextY = this.y + (this.vy / grid.cellSize);

        let gridX = Math.floor(nextX);
        let gridY = Math.floor(nextY);

        // Wall collision detection: If the next cell is solid (EDGE or DEACTIVE), the enemy bounces off and changes direction randomly
        if (this.isCellSolid(grid, gridX, gridY)) {
            this.angle = Math.random() * Math.PI * 2;
            this.vx = Math.cos(this.angle) * this.speed;
            this.vy = Math.sin(this.angle) * this.speed;
        } else {
            // If the next cell is not solid, the enemy moves to the next position
            this.x = nextX;
            this.y = nextY;
        }

        // Check if the enemy collides with the player's path (STATE_PATH). If so, reset the player and clear the path.
        if (this.checkPathCollision(player.pathArray)) {
            this.handlePlayerHit(grid, player);
            return;
        }
    } 
        // If the movement timer has reached 0 and there are no bullets on the screen, the enemy shoots a new bullet
        else if (this.moveTimer <= 0 && this.bullets.length === 0) {
            this.handleShooting(grid, player); // New bullet is shot
        }
    }

    isCellSolid(grid, gx, gy) {
        // Out-of-bounds map coordinates are treated as solid obstacles
        if (gx < 0 || gx >= grid.cols || gy < 0 || gy >= grid.rows) return true;
        
        let cellState = grid.getState(gx, gy);
        // Bounces off 1 (Edge) and 3 (Deactive Zone) cells
        return cellState === 1 || cellState === 3;
    }

    checkPathCollision(pathArray) {
        if (!pathArray || pathArray.length === 0) return false;

        let currentGridX = Math.floor(this.x);
        let currentGridY = Math.floor(this.y);

        // Check all cells actively being drawn by the player
        for (let p of pathArray) {
            let dx = p.x - currentGridX;
            let dy = p.y - currentGridY;
            let dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 1.5) return true; // Collision registered if enemy is close enough to the line
        }
        return false;
    }

    handleShooting(grid, player) {
        // If there are no bullets on the screen and the movement timer has expired, the enemy shoots a new bullet in a random direction
        if (this.bullets.length === 0 && this.moveTimer <= 0) {
            let bulletAngle = Math.random() *Math.PI * 2;
            this.bullets.push({
                x: this.x,
                y: this.y,
                vx: Math.cos(bulletAngle) * 0.5,
                vy: Math.sin(bulletAngle) * 0.5
            });
        }

        

        // Update the position of each bullet and check for collisions with the grid or the player
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            let b = this.bullets[i];
            b.x += b.vx;
            b.y += b.vy;

            let bx = Math.floor(b.x);
            let by = Math.floor(b.y);

            // Bullet collision with solid cells (EDGE or DEACTIVE). If it hits, the bullet is removed and the movement timer is reset.
            if (this.isCellSolid(grid, bx, by)) {
                this.bullets.splice(i, 1);
                // Reset the movement timer to allow the enemy to move again after shooting
                this.moveTimer = 30; 
                continue;
            }

        // Check if the bullet collides with the player. If it does, reset the player and clear the path.
        // Calculate the player's bounding box in grid coordinates, considering the player's size and the grid cell size
        const playerWidthInGrid = player.size / grid.cellSize; // 30 / 30 = 1 hücre
        const offset = (player.size - grid.cellSize) / (2 * grid.cellSize);

        // Calculate the player's bounding box in grid coordinates
        const pMinX = player.x - offset;
        const pMaxX = player.x + playerWidthInGrid - offset;
        const pMinY = player.y - offset;
        const pMaxY = player.y + playerWidthInGrid - offset;

        // Check if the bullet is within the player's bounding box. If it is, handle the player hit and remove the bullet.
        if (!player.protection && b.x >= pMinX && b.x <= pMaxX && b.y >= pMinY && b.y <= pMaxY) {
            this.handlePlayerHit(grid, player); // Oyuncuyu sıfırlar ve başa gönderir
            this.bullets.splice(i, 1);
            return;
        }

            // Check if the bullet collides with the player's path (STATE_PATH). If it does, reset the player and clear the path.
            if (player.pathArray) {
                for (let p of player.pathArray) {
                    if (p.x === bx && p.y === by) {
                        this.handlePlayerHit(grid, player);
                        this.bullets.splice(i, 1);
                        this.moveTimer = 30; 
                        return;
                    }
                }
            }
        }
    }

    handlePlayerHit(grid, player) {
        // Reset all drawn Path (2) cells back to Empty (0) state
        if (player.pathArray) {
            for (let p of player.pathArray) {
                grid.setState(p.x, p.y, 0);
            }
        }

        // Reset the player position , moves the player to the point where the drawing started
        let startPoint = player.pathArray && player.pathArray.length > 0 ? player.pathArray[0] : null;

        if (startPoint) {
            console.log("Başlangıç Noktası X:", startPoint.x, "Y:", startPoint.y);
        }

        player.x = startPoint ? startPoint.x : 0;
        player.y = startPoint ? startPoint.y : 0; 

        // Reset player state and return player to safe zone (Stage 1)
        player.pathArray = [];
        player.protection = true;
        
        
    }

    draw(ctx, cellSize) {
        // Draw Enemy Body (Red/Pink Circle)
        ctx.fillStyle = "#ff0055";
        ctx.beginPath();
        ctx.arc(
            (this.x * cellSize) + (cellSize / 2),
            (this.y * cellSize) + (cellSize / 2),
            this.radius,
            0,
            Math.PI * 2
        );
        ctx.fill();

        // Draw Bullets (Yellow Circles, Radius = 5px)
        ctx.fillStyle = "#ffff00";
        for (let b of this.bullets) {
            ctx.beginPath();
            ctx.arc(
                (b.x * cellSize) + (cellSize / 2),
                (b.y * cellSize) + (cellSize / 2),
                5,
                0,
                Math.PI * 2
            );
            ctx.fill();
        }
    }
}