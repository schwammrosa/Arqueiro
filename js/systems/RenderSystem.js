// Sistema de Renderização
import { imageManager } from './ImageManager.js';
import { MonsterSpriteManager } from './MonsterSpriteManager.js';

export class RenderSystem {
    constructor(ctx, GAME_CONFIG, enemyPath) {
        this.ctx = ctx;
        this.GAME_CONFIG = GAME_CONFIG;
        this.enemyPath = enemyPath;
        this.imageManager = imageManager;
        this.monsterSpriteManager = new MonsterSpriteManager(imageManager);
        this.imagesInitialized = false;
        this.monstersInitialized = false;
        
        console.log('🏗️ RenderSystem inicializado');
        
        // Inicializar imagens padrão e monstros
        this.initializeImages();
        this.initializeMonsters();
    }
    
    // Atualizar caminho dos inimigos
    updateEnemyPath(newPath) {
        this.enemyPath = newPath;
    }

    // Inicializar imagens do jogo
    async initializeImages() {
        try {
            console.log('🖼️ Iniciando carregamento de imagens das torres...');
            // Carregar imagens das torres PRIMEIRO
            const towerImages = {
                archer: 'assets/imagen/Torres/arqueiro.png',
                cannon: 'assets/imagen/Torres/canhao.png',
                magic: 'assets/imagen/Torres/magica.png',
                tesla: 'assets/imagen/Torres/tesla.png'
            };
            
            console.log('📁 Caminhos das imagens das torres:', towerImages);
            const success = await this.imageManager.loadImages(towerImages);
            console.log('✅ Carregamento das imagens das torres:', success ? 'SUCESSO' : 'FALHA');
            
            // Marcar como inicializado IMEDIATAMENTE após carregar as torres
            this.imagesInitialized = true;
            console.log('🎯 Imagens das torres inicializadas!');
            
            // Verificar se cada imagem foi carregada
            Object.keys(towerImages).forEach(type => {
                const image = this.imageManager.getImage(type);
                console.log(`🔍 Imagem ${type}:`, image ? 'CARREGADA' : 'NÃO CARREGADA');
            });
            
            // Aguardar um pouco para garantir que as imagens estejam prontas
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Depois carregar as outras imagens
            await this.imageManager.initializeDefault(this.GAME_CONFIG.gridSize);
            
            console.log('🎯 Todas as imagens inicializadas com sucesso!');
        } catch (error) {
            console.error('❌ Erro ao inicializar imagens:', error);
            this.imagesInitialized = false;
        }
    }

    // Inicializar sprites de monstros
    async initializeMonsters() {
        try {
            console.log('🎮 Iniciando carregamento de sprites de monstros...');
            
            // Aguardar um pouco para garantir que o ImageManager esteja pronto
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const success = await this.monsterSpriteManager.loadAllMonsters();
            this.monstersInitialized = success;
            
            if (success) {
                console.log('✅ Sistema de sprites de monstros inicializado com sucesso!');
                
                // Verificar estatísticas
                const stats = this.monsterSpriteManager.getStats();
                console.log('📊 Estatísticas dos sprites:', stats);
            } else {
                console.warn('⚠️ Falha ao inicializar sprites de monstros - usando fallback');
                
                // Tentar reparar sprites corrompidos
                console.log('🔧 Tentando reparar sprites...');
                const repairedCount = await this.monsterSpriteManager.repairSprites();
                if (repairedCount > 0) {
                    console.log(`✅ ${repairedCount} tipos de monstros reparados`);
                    this.monstersInitialized = true;
                }
            }
        } catch (error) {
            console.error('❌ Erro ao inicializar sprites de monstros:', error);
            this.monstersInitialized = false;
        }
    }

    // Desenhar fundo do jogo com texturas
    drawBackground() {
        if (!this.imagesInitialized) {
            // Fallback para fundo simples se imagens não carregaram
            this.ctx.fillStyle = '#4a7c59';
            this.ctx.fillRect(0, 0, this.GAME_CONFIG.canvasWidth, this.GAME_CONFIG.canvasHeight);
            return;
        }

        // Desenhar fundo com texturas
        this.imageManager.createBackgroundPattern(
            this.ctx,
            this.GAME_CONFIG.canvasWidth,
            this.GAME_CONFIG.canvasHeight,
            this.GAME_CONFIG.gridSize,
            this.enemyPath
        );
    }

    // Desenhar grid do jogo (opcional, mais sutil)
    drawGrid() {
        // Grid mais sutil quando usamos texturas
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
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

    // Desenhar caminho dos inimigos (linha guia sutil)
    drawPath() {
        if (!this.imagesInitialized) {
            // Fallback para caminho simples se imagens não carregaram
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
            return;
        }

        // Desenhar uma linha guia sutil sobre o caminho texturizado
        this.ctx.strokeStyle = 'rgba(139, 115, 85, 0.3)'; // Cor mais sutil
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]); // Linha tracejada
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
        this.ctx.setLineDash([]); // Resetar linha tracejada
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
    
    // Desenhar preview da torre selecionada
    drawTowerPreview(mouseX, mouseY, towerType) {
        const image = this.imageManager.getImage(towerType);
        
        if (image) {
            this.ctx.globalAlpha = 0.7;
            this.ctx.drawImage(
                image,
                mouseX - this.GAME_CONFIG.gridSize / 2,
                mouseY - this.GAME_CONFIG.gridSize / 2,
                this.GAME_CONFIG.gridSize,
                this.GAME_CONFIG.gridSize
            );
            this.ctx.globalAlpha = 1.0;
        } else {
            // Fallback: quadrado colorido
            // Usar configurações padrão das torres
            const towerConfigs = {
                archer: { color: '#4e73df', icon: '🏹' },
                cannon: { color: '#e74a3b', icon: '🚀' },
                magic: { color: '#36b9cc', icon: '🔮' },
                tesla: { color: '#7d5fff', icon: '⚡' }
            };
            
            const config = towerConfigs[towerType] || { color: '#888', icon: '❓' };
            
            this.ctx.fillStyle = config.color;
            this.ctx.globalAlpha = 0.5;
            this.ctx.fillRect(
                mouseX - this.GAME_CONFIG.gridSize / 2,
                mouseY - this.GAME_CONFIG.gridSize / 2,
                this.GAME_CONFIG.gridSize,
                this.GAME_CONFIG.gridSize
            );
            
            // Adicionar ícone no centro
            this.ctx.font = '16px Arial';
            this.ctx.fillStyle = 'white';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(
                config.icon,
                mouseX,
                mouseY + 4
            );
            
            this.ctx.globalAlpha = 1.0;
        }
    }
    
    // Desenhar monstros com sprites animados
    drawMonsters(gameState) {
        if (!gameState.enemies || gameState.enemies.length === 0) return;
        
        for (const enemy of gameState.enemies) {
            if (!enemy || enemy.isRemoved) continue;
            
            // Calcular direção baseada no próximo segmento do caminho
            if (enemy.pathIndex >= 0 && enemy.pathIndex < this.enemyPath.length - 1) {
                const from = this.enemyPath[enemy.pathIndex];
                const to = this.enemyPath[enemy.pathIndex + 1];
                const dx = to.x - from.x;
                const dy = to.y - from.y;
                const dir = this.monsterSpriteManager.getDirectionFromMovement(dx, dy);
                // LOG DETALHADO
                // console.log('[VIRADA] id:', enemy.id || '-', 'pathIndex:', enemy.pathIndex, 'pos:', {x: enemy.x, y: enemy.y}, 'from:', from, 'to:', to, 'dx:', dx, 'dy:', dy, 'novaDirecao:', dir);
                enemy.direction = dir;
            }
            
            // Desenhar monstro com sprite
            this.monsterSpriteManager.drawMonster(this.ctx, enemy, gameState.gameTime);
        }
    }

    // Desenhar efeitos visuais
    drawVisualEffects(gameState) {
        if (!gameState.visualEffects) return;
        
        const currentTime = Date.now();
        
        // Desenhar preview da torre selecionada
        if (gameState.selectedTower && gameState.selectedTowerType && gameState.mouseX !== undefined && gameState.mouseY !== undefined) {
            // Sempre tentar desenhar o preview, mesmo se as imagens não estiverem totalmente inicializadas
            this.drawTowerPreview(gameState.mouseX, gameState.mouseY, gameState.selectedTowerType);
        }
        
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