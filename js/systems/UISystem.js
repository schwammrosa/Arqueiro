// Sistema de UI
export class UISystem {
    constructor(gameState) {
        this.gameState = gameState;
        this.cachedElements = {};
    }

    // Cache de elementos DOM para melhor performance
    getElement(id) {
        if (!this.cachedElements[id]) {
            this.cachedElements[id] = document.getElementById(id);
        }
        return this.cachedElements[id];
    }

    updateUI() {
        this.updateGameStats();
        this.updateWaveTimer();
        this.updateStartButton();
        this.updateTowerButtons();
    }

    updateGameStats() {
        const elements = {
            health: this.gameState.health,
            gold: this.gameState.gold,
            wave: this.gameState.wave,
            score: this.gameState.score,
            monsters: `${this.gameState.monstersThisWave}/${this.gameState.monstersDefeated}`,
            gameTime: this.formatGameTime()
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = this.getElement(id);
            if (element) {
                element.textContent = value;
            }
        });
    }

    formatGameTime() {
        const minutes = Math.floor(this.gameState.gameTime / 60);
        const seconds = Math.floor(this.gameState.gameTime % 60);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    updateWaveTimer() {
        const timerElement = this.getElement('nextWaveTimer');
        if (!timerElement) return;

        if (this.gameState.waveInProgress) {
            timerElement.textContent = '--';
        } else if (this.gameState.nextWaveTimer > 0) {
            const seconds = Math.ceil(this.gameState.nextWaveTimer);
            timerElement.textContent = `${seconds}s`;
        } else if (this.gameState.wave > 0) {
            timerElement.textContent = 'Pronta';
        } else {
            timerElement.textContent = '--';
        }
    }

    updateStartButton() {
        const startBtn = this.getElement('start-wave');
        if (!startBtn) return;

        const shouldDisable = this.gameState.waveInProgress || 
                            this.gameState.nextWaveTimer <= 0 || 
                            this.gameState.enemies.length > 0;
        
        startBtn.disabled = shouldDisable;
    }

    updateTowerButtons() {
        document.querySelectorAll('.tower-btn').forEach(btn => {
            const cost = parseInt(btn.dataset.cost);
            if (this.gameState.gold < cost) {
                btn.classList.add('disabled');
            } else {
                btn.classList.remove('disabled');
            }
        });
    }

    // Método mantido para compatibilidade - funcionalidade desativada
    showNotification(message, type = 'info', duration = 3000) {
        // Notificações desativadas
        return;
    }

    setGameState(newState) {
        this.gameState = newState;
    }
    
    updateSpeedDisplay(speed) {
        const speedElement = this.getElement('gameSpeed');
        if (speedElement) {
            speedElement.textContent = `${speed}x`;
        }
    }
} 