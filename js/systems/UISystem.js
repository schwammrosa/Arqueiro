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
            document.getElementById('nextWaveTimer').textContent = 'Em andamento';
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
        if (typeof window.updateTowerButtonStates === 'function') {
            window.updateTowerButtonStates();
        } else {
            // Fallback para o sistema antigo
            document.querySelectorAll('.tower-btn').forEach(btn => {
                const cost = parseInt(btn.dataset.cost);
                if (this.gameState.gold < cost) {
                    btn.classList.add('disabled');
                } else {
                    btn.classList.remove('disabled');
                }
            });
        }
    }

    showNotification(message, type = 'info') {
        // Criar elemento de notificação
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Estilos da notificação
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            z-index: 10000;
            animation: slideIn 0.3s ease;
            max-width: 300px;
        `;
        
        // Cores por tipo
        const colors = {
            success: '#28a745',
            error: '#dc3545',
            info: '#17a2b8',
            warning: '#ffc107'
        };
        
        notification.style.backgroundColor = colors[type] || colors.info;
        
        // Adicionar ao DOM
        document.body.appendChild(notification);
        
        // Remover após 3 segundos
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
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