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
} 