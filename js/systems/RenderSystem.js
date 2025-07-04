// Sistema de Renderização
export class RenderSystem {
    constructor(ctx, GAME_CONFIG, enemyPath) {
        this.ctx = ctx;
        this.GAME_CONFIG = GAME_CONFIG;
        this.enemyPath = enemyPath;
    }

    // Desenhar grid do jogo
    drawGrid() {
        this.ctx.strokeStyle = '#dee2e6';
        this.ctx.lineWidth = 1;

        for (let x = 0; x <= this.GAME_CONFIG.canvasWidth; x += this.GAME_CONFIG.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.GAME_CONFIG.canvasHeight);
            this.ctx.stroke();
        }

        for (let y = 0; y <= this.GAME_CONFIG.canvasHeight; y += this.GAME_CONFIG.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.GAME_CONFIG.canvasWidth, y);
            this.ctx.stroke();
        }
    }

    // Desenhar caminho dos inimigos
    drawPath() {
        this.ctx.strokeStyle = '#6c757d';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        
        for (let i = 0; i < this.enemyPath.length; i++) {
            const x = this.enemyPath[i].x * this.GAME_CONFIG.gridSize + this.GAME_CONFIG.gridSize / 2;
            const y = this.enemyPath[i].y * this.GAME_CONFIG.gridSize + this.GAME_CONFIG.gridSize / 2;
            
            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }
        
        this.ctx.stroke();
    }

    // Obter posição do grid baseada na posição do mouse
    getGridPosition(mouseX, mouseY) {
        const gridX = Math.floor(mouseX / this.GAME_CONFIG.gridSize);
        const gridY = Math.floor(mouseY / this.GAME_CONFIG.gridSize);
        return {
            x: gridX * this.GAME_CONFIG.gridSize + this.GAME_CONFIG.gridSize / 2,
            y: gridY * this.GAME_CONFIG.gridSize + this.GAME_CONFIG.gridSize / 2,
            gridX: gridX,
            gridY: gridY
        };
    }

    // Verificar se pode colocar torre em uma posição
    canPlaceTower(x, y, gameState) {
        // Verificar se está no caminho
        for (let point of this.enemyPath) {
            if (point.x === Math.floor(x / this.GAME_CONFIG.gridSize) && 
                point.y === Math.floor(y / this.GAME_CONFIG.gridSize)) {
                return false;
            }
        }

        // Verificar se já existe uma torre
        for (let tower of gameState.towers) {
            if (tower.x === x && tower.y === y) {
                return false;
            }
        }

        return true;
    }

    // Obter torre em uma posição específica
    getTowerAtPosition(x, y, gameState) {
        const padding = 2; // Facilita o hover na borda
        for (let tower of gameState.towers) {
            const towerLeft = tower.x - this.GAME_CONFIG.gridSize / 2 - padding;
            const towerRight = tower.x + this.GAME_CONFIG.gridSize / 2 + padding;
            const towerTop = tower.y - this.GAME_CONFIG.gridSize / 2 - padding;
            const towerBottom = tower.y + this.GAME_CONFIG.gridSize / 2 + padding;

            if (x >= towerLeft && x <= towerRight && y >= towerTop && y <= towerBottom) {
                return tower;
            }
        }
        return null;
    }

    // Desenhar preview da Chuva de Flechas
    drawArrowRainPreview(x, y, radius) {
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, 2 * Math.PI);
        this.ctx.fillStyle = 'rgba(255, 152, 0, 0.18)';
        this.ctx.strokeStyle = '#ff9800';
        this.ctx.lineWidth = 2;
        this.ctx.fill();
        this.ctx.stroke();
        this.ctx.restore();
    }
    
    // Desenhar efeitos visuais
    drawVisualEffects(gameState) {
        if (!gameState.visualEffects) return;
        
        const currentTime = Date.now();
        
        for (let i = gameState.visualEffects.length - 1; i >= 0; i--) {
            const effect = gameState.visualEffects[i];
            const elapsed = currentTime - effect.startTime;
            const progress = elapsed / effect.duration;
            
            if (progress >= 1) {
                // Remover efeito expirado
                gameState.visualEffects.splice(i, 1);
                continue;
            }
            
            // Efeito de explosão do canhão
            if (effect.radius) {
                this.ctx.save();
                
                // Calcular alpha baseado no progresso
                const alpha = effect.alpha * (1 - progress);
                
                // Área de explosão com fade out
                this.ctx.fillStyle = `rgba(255, 100, 0, ${alpha * 0.3})`;
                this.ctx.beginPath();
                this.ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
                this.ctx.fill();
                
                // Borda da explosão
                this.ctx.strokeStyle = `rgba(255, 100, 0, ${alpha})`;
                this.ctx.lineWidth = 3 * (1 - progress * 0.5);
                this.ctx.beginPath();
                this.ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
                this.ctx.stroke();
                
                this.ctx.restore();
            }
            
            // Efeito de slow da torre mágica
            if (effect.duration && !effect.radius) {
                this.ctx.save();
                
                // Calcular alpha baseado no progresso
                const alpha = effect.alpha * (1 - progress);
                
                // Círculo de slow com fade out
                this.ctx.strokeStyle = `rgba(54, 185, 204, ${alpha})`;
                this.ctx.lineWidth = 2 * (1 - progress * 0.5);
                this.ctx.setLineDash([5, 5]);
                this.ctx.beginPath();
                this.ctx.arc(effect.x, effect.y, 20 + progress * 10, 0, Math.PI * 2);
                this.ctx.stroke();
                this.ctx.setLineDash([]);
                
                // Partículas de gelo
                for (let i = 0; i < 8; i++) {
                    const angle = (i / 8) * Math.PI * 2;
                    const radius = 15 + progress * 5;
                    const particleX = effect.x + Math.cos(angle) * radius;
                    const particleY = effect.y + Math.sin(angle) * radius;
                    
                    this.ctx.fillStyle = `rgba(54, 185, 204, ${alpha * 0.6})`;
                    this.ctx.beginPath();
                    this.ctx.arc(particleX, particleY, 2 * (1 - progress), 0, Math.PI * 2);
                    this.ctx.fill();
                }
                
                this.ctx.restore();
            }
            
            // Efeito de choque elétrico da Tesla
            if (effect.type === 'electric') {
                this.ctx.save();
                
                // Calcular alpha baseado no progresso
                const alpha = effect.alpha * (1 - progress);
                
                // Círculo de choque elétrico
                this.ctx.strokeStyle = `rgba(0, 207, 255, ${alpha})`;
                this.ctx.lineWidth = 3 * (1 - progress * 0.5);
                this.ctx.setLineDash([3, 3]);
                this.ctx.beginPath();
                this.ctx.arc(effect.x, effect.y, 15 + progress * 10, 0, Math.PI * 2);
                this.ctx.stroke();
                this.ctx.setLineDash([]);
                
                // Raios elétricos
                for (let i = 0; i < 6; i++) {
                    const angle = (i / 6) * Math.PI * 2;
                    const radius = 20 + progress * 15;
                    const rayX = effect.x + Math.cos(angle) * radius;
                    const rayY = effect.y + Math.sin(angle) * radius;
                    
                    this.ctx.strokeStyle = `rgba(0, 207, 255, ${alpha * 0.8})`;
                    this.ctx.lineWidth = 2 * (1 - progress);
                    this.ctx.beginPath();
                    this.ctx.moveTo(effect.x, effect.y);
                    this.ctx.lineTo(rayX, rayY);
                    this.ctx.stroke();
                }
                
                this.ctx.restore();
            }
        }
    }
} 