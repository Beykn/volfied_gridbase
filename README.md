# Grid-Based Area Capture and Path Logic  

 ## CELL STATES (GRID NUMBERS) 

 (0) Empty   : Active play area where enemies move and drawing takes place. 

 (1) Edge    : Safe boundary line where the player can move freely. 

 (2) Path    : Temporary line drawn by the player while moving inside (0). 

 (3) Deactive: Captured territory that is closed off; no entry allowed. 


# DATA STRUCTURES 

 **pathArray :** Stores EVERY single cell coordinate the player steps on while drawing. Used for enemy collision checks. 

 **vertexArray:** Stores ONLY the corner points where the player changes direction. Used for area capture calculations. 


# STATE 1: SAFE ZONE (MOVING ON THE EDGE) 

 Player Position: Player stays on the Edge (value 1). 

 Shield: Protection is ON (true). 
  

 Controls and Movement: 

  1. Only Arrow Key: 

     Move to Edge (1): Player moves to the new position. 

     Move to Empty (0): Player stops. Cannot go inside. 

     Move to Deactive (3): Player stops. Cannot go inside. 

  

  2. Space + Arrow Key: 

     Move to Edge (1): Player moves normally. 

     Move to Empty (0): Drawing starts! Go to State 2. 

     Move to Deactive (3): Player stops. Cannot go inside. 

 

# STATE 2: AREA ENTRY (FIRST STEP INSIDE) 

 Trigger: Player presses Space + Arrow Key and steps into Empty space (0). 

  

 Actions: 

  1. Shield turns OFF (protection = false). 

  2. Clear vertexArray and pathArray. 

  3. Save the starting Edge point to vertexArray. 

  4. Change the first Empty cell (0) to Path (2) and save it to pathArray. 

  5. Go to Stage 3 automatically. 


# STAGE 3: MOTION AND DRAWING (INSIDE THE GAME ZONE) 

 **Player Position:** Player moves inside Empty space (0). 

 **Shield:** Protection is OFF (false). 


 **Controls:** 

- If Space is NOT pressed: Player stops moving inside Empty space.  

- If Space IS pressed: Player moves with Arrow keys. 

  

 **Corner / Direction Check (Vertex Logic):**

- Same direction: Player moves straight. Update line. 

- Changing direction (turn left/right/up/down): Save new corner point (x, y) to vertexArray. 

  

**Enemy Check:** 

- Check if Enemy or Enemy Bullet hits Path (2). 

- If Enemy hits Path: 

    - Player loses 1 life. 

    - All drawn Path cells change back to Empty (0). 

    - Player resets to start position and goes back to State 1.

     

**Earned Score:**

* **Area Capture Trigger:** Area Capture Trigger and Region Detection 

    - When the player reaches a safe edge and closed areas are found via BFS 

    - If the region does not contain the enemy (if it is a closed deactive area)  

    - **Block Check :** Blocks inside the enclosed deactive area are scanned 

 

*  **Score Calculation:** Points are calculated based on bonus blocks  

    - **Score Update:** If the earned score is greater than 0, it is added to the player's score and the UI is updated 

 

# STAGE 4: RE-ENTRY TO SAFE ZONE (CAPTURING AREA) 

 **Trigger:** Player reaches another Edge (1) or hits own Path (2).  

 **Actions:**  

  1. Shield turns ON (protection = true). 

  2. Area Capture (BFS Flood Fill): 

      Find closed areas. 

      Deactivate the area WITHOUT the enemy (change cells to 3). 

  3. New Edges: 

      Turn drawn Path cells into new Edge cells (1). 

  4. Orphan Edge Cleanup: 

      Check 8 directions around edges. 

      If an Edge has no Empty cells around it, turn it into Deactive (3). 

  5. Reset pathArray and vertexArray. Go back to State 1. 
