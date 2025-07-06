// Sistema de UI
export class UISystem {
    constructor(gameState) {
        this.gameState = gameState;
    }

    updateUI() {
        document.getElementById('health').textContent = this.gameState.health;
        document.getElementById('gold').textContent = this.gameState.gold;
        document.getElementById('wave').textContent = this.gameState.wave;
        document.getElementById('score').textContent = this.gameState.score;
        // Exibir monstros total/eliminados
        document.getElementById('monsters').textContent = `${this.gameState.monstersThisWave}/${this.gameState.monstersDefeated}`;
        const minutes = Math.floor(this.gameState.gameTime / 60);
        const seconds = Math.floor(this.gameState.gameTime % 60);
        document.getElementById('gameTime').textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        if (this.gameState.waveInProgress) {
            document.getElementById('nextWaveTimer').textContent = '--';
        } else if (this.gameState.nextWaveTimer > 0) {
            const seconds = Math.ceil(this.gameState.nextWaveTimer);
            document.getElementById('nextWaveTimer').textContent = `${seconds}s`;
        } else if (this.gameState.wave > 0) {
            document.getElementById('nextWaveTimer').textContent = 'Pronta';
        } else {
            document.getElementById('nextWaveTimer').textContent = '--';
        }
        const startBtn = document.getElementById('start-wave');
        if (this.gameState.waveInProgress || this.gameState.nextWaveTimer <= 0 || this.gameState.enemies.length > 0) {
            startBtn.disabled = true;
        } else {
            startBtn.disabled = false;
        }
        // Atualizar estados dos botões de torre baseado no ouro
        document.querySelectorAll('.tower-btn').forEach(btn => {
            const cost = parseInt(btn.dataset.cost);
            if (this.gameState.gold < cost) {
                btn.classList.add('disabled');
            } else {
                btn.classList.remove('disabled');
            }
        });
    }

    showNotification(message, type = 'info', duration = 3000) {
        // Notificações desativadas
        // console.log(`[NOTIFICAÇÃO DESATIVADA] (${type}): ${message}`);
        return;
    }

    repositionNotifications() {
        const notifications = document.querySelectorAll('.notification');
        notifications.forEach((notification, index) => {
            notification.style.top = `${20 + (index * 80)}px`;
        });
    }

    setGameState(newState) {
        this.gameState = newState;
    }
    
    updateSpeedDisplay(speed) {
        const speedElement = document.getElementById('gameSpeed');
        if (speedElement) {
            speedElement.textContent = `${speed}x`;
        }
    }
} 