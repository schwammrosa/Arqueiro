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
        
        // Estilos da notificação - centralizada no topo
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            z-index: 10000;
            animation: slideInDown 0.4s ease;
            max-width: 400px;
            text-align: center;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        `;
        
        // Cores por tipo
        const colors = {
            success: 'linear-gradient(135deg, #28a745, #1e7e34)',
            error: 'linear-gradient(135deg, #dc3545, #c82333)',
            info: 'linear-gradient(135deg, #17a2b8, #117a8b)',
            warning: 'linear-gradient(135deg, #ffc107, #e0a800)'
        };
        
        notification.style.background = colors[type] || colors.info;
        
        // Verificar se há outras notificações e ajustar posição
        const existingNotifications = document.querySelectorAll('.notification');
        if (existingNotifications.length > 0) {
            const offset = existingNotifications.length * 80; // 80px de espaçamento
            notification.style.top = `${20 + offset}px`;
        }
        
        // Adicionar ao DOM
        document.body.appendChild(notification);
        
        // Remover após 4 segundos
        setTimeout(() => {
            notification.style.animation = 'slideOutUp 0.4s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                    // Reposicionar notificações restantes
                    this.repositionNotifications();
                }
            }, 400);
        }, 4000);
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