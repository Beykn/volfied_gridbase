// src/js/UIManager.js

export class UIManager {
    constructor() {
        this.scoreElement = document.getElementById("scoreVal");
        this.livesElement = document.getElementById("livesVal");
        this.timerElement = document.getElementById("timerVal");
    }

    updateScore(scoreValue) {
        this.scoreElement.textContent = Math.floor(scoreValue); 
    }

    updateLives(livesCount) {
        const hearts = "❤️ ".repeat(Math.max(0, livesCount)).trim();
        this.livesElement.textContent = hearts || "💀 GAMEOVER";
    }

    updateTimer(seconds) {
        this.timerElement.textContent = seconds;
    }
}