// Sistema de Renderização
import { imageManager } from './ImageManager.js';
import { MonsterSpriteManager } from './MonsterSpriteManager.js';

export class RenderSystem {
    // Constantes para configurações visuais
    static COLORS = {
        BACKGROUND_FALLBACK: '#4a7c59',
        PATH_FALLBACK: '#6c757d',
        PATH_GUIDE: 'rgba(139, 115, 85, 0.3)',
        GRID: 'rgba(255, 255, 255, 0.1)',
        TOWER_PREVIEW: {
            archer: { color: '#4e73df', icon: '🏹' },
            cannon: { color: '#e74a3b', icon: '🚀' },
            magic: { color: '#36b9cc', icon: '🔮' },
            tesla: { color: '#7d5fff', icon: '⚡' }
        }
    };

    static EFFECTS = {
        EXPLOSION: { color: 'rgba(255, 100, 0,', borderColor: 'rgba(255, 100, 0,', fillAlpha: 0.3 },
        SLOW: { color: 'rgba(54, 185, 204,', borderColor: 'rgba(54, 185, 204,', fillAlpha: 0.6 },
        ELECTRIC: { color: 'rgba(0, 207, 255,', borderColor: 'rgba(0, 207, 255,', fillAlpha: 0.8 }
    };

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
            this.ctx.fillStyle = RenderSystem.COLORS.BACKGROUND_FALLBACK;
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
        this.ctx.strokeStyle = RenderSystem.COLORS.GRID;
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
        const pathPoints = this.enemyPath.map(point => ({
            x: point.x * this.GAME_CONFIG.gridSize + this.GAME_CONFIG.gridSize / 2,
            y: point.y * this.GAME_CONFIG.gridSize + this.GAME_CONFIG.gridSize / 2
        }));

        if (!this.imagesInitialized) {
            this._drawSimplePath(pathPoints);
        } else {
            this._drawTexturedPath(pathPoints);
        }
    }

    _drawSimplePath(pathPoints) {
        this.ctx.strokeStyle = RenderSystem.COLORS.PATH_FALLBACK;
        this.ctx.lineWidth = 3;
        this._drawPathLine(pathPoints);
    }

    _drawTexturedPath(pathPoints) {
        this.ctx.strokeStyle = RenderSystem.COLORS.PATH_GUIDE;
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);
        this._drawPathLine(pathPoints);
        this.ctx.setLineDash([]);
    }

    _drawPathLine(pathPoints) {
        this.ctx.beginPath();
        pathPoints.forEach((point, index) => {
            if (index === 0) {
                this.ctx.moveTo(point.x, point.y);
            } else {
                this.ctx.lineTo(point.x, point.y);
            }
        });
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
        const gridX = Math.floor(x / this.GAME_CONFIG.gridSize);
        const gridY = Math.floor(y / this.GAME_CONFIG.gridSize);

        // Verificar se está no caminho
        if (this.enemyPath.some(point => point.x === gridX && point.y === gridY)) {
            return false;
        }

        // Verificar se já existe uma torre
        return !gameState.towers.some(tower => tower.x === x && tower.y === y);
    }

    // Obter torre em uma posição específica
    getTowerAtPosition(x, y, gameState) {
        const padding = 2;
        const halfGrid = this.GAME_CONFIG.gridSize / 2;
        
        return gameState.towers.find(tower => {
            const towerLeft = tower.x - halfGrid - padding;
            const towerRight = tower.x + halfGrid + padding;
            const towerTop = tower.y - halfGrid - padding;
            const towerBottom = tower.y + halfGrid + padding;

            return x >= towerLeft && x <= towerRight && y >= towerTop && y <= towerBottom;
        }) || null;
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
            this._drawTowerImage(mouseX, mouseY, image);
        } else {
            this._drawTowerFallback(mouseX, mouseY, towerType);
        }
    }

    _drawTowerImage(mouseX, mouseY, image) {
        this.ctx.globalAlpha = 0.7;
        this.ctx.drawImage(
            image,
            mouseX - this.GAME_CONFIG.gridSize / 2,
            mouseY - this.GAME_CONFIG.gridSize / 2,
            this.GAME_CONFIG.gridSize,
            this.GAME_CONFIG.gridSize
        );
        this.ctx.globalAlpha = 1.0;
    }

    _drawTowerFallback(mouseX, mouseY, towerType) {
        const config = RenderSystem.COLORS.TOWER_PREVIEW[towerType] || { color: '#888', icon: '❓' };
        
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
        this.ctx.fillText(config.icon, mouseX, mouseY + 4);
        
        this.ctx.globalAlpha = 1.0;
    }
    
    // Desenhar monstros com sprites animados
    drawMonsters(gameState) {
        if (!gameState.enemies || gameState.enemies.length === 0) return;
        
        for (const enemy of gameState.enemies) {
            if (!enemy || enemy.isRemoved) continue;
            
            this._updateEnemyDirection(enemy);
            this.monsterSpriteManager.drawMonster(this.ctx, enemy, gameState.gameTime);
        }
    }

    _updateEnemyDirection(enemy) {
        if (enemy.pathIndex >= 0 && enemy.pathIndex < this.enemyPath.length - 1) {
            const from = this.enemyPath[enemy.pathIndex];
            const to = this.enemyPath[enemy.pathIndex + 1];
            const dx = to.x - from.x;
            const dy = to.y - from.y;
            enemy.direction = this.monsterSpriteManager.getDirectionFromMovement(dx, dy);
        }
    }

    // Desenhar efeitos visuais
    drawVisualEffects(gameState) {
        if (!gameState.visualEffects) return;
        
        // Desenhar preview da torre selecionada
        if (gameState.selectedTower && gameState.selectedTowerType && gameState.mouseX !== undefined && gameState.mouseY !== undefined) {
            this.drawTowerPreview(gameState.mouseX, gameState.mouseY, gameState.selectedTowerType);
        }
        
        this._processVisualEffects(gameState.visualEffects);
    }

    _processVisualEffects(visualEffects) {
        const currentTime = Date.now();
        
        for (let i = visualEffects.length - 1; i >= 0; i--) {
            const effect = visualEffects[i];
            const elapsed = currentTime - effect.startTime;
            const progress = elapsed / effect.duration;
            
            if (progress >= 1) {
                visualEffects.splice(i, 1);
                continue;
            }
            
            this._drawEffect(effect, progress);
        }
    }

    _drawEffect(effect, progress) {
        this.ctx.save();
        
        if (effect.radius) {
            this._drawExplosionEffect(effect, progress);
        } else if (effect.duration && !effect.radius) {
            this._drawSlowEffect(effect, progress);
        } else if (effect.type === 'electric') {
            this._drawElectricEffect(effect, progress);
        }
        
        this.ctx.restore();
    }

    _drawExplosionEffect(effect, progress) {
        const alpha = effect.alpha * (1 - progress);
        const effects = RenderSystem.EFFECTS.EXPLOSION;
        
        // Área de explosão
        this.ctx.fillStyle = `${effects.color}${alpha * effects.fillAlpha})`;
        this.ctx.beginPath();
        this.ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Borda da explosão
        this.ctx.strokeStyle = `${effects.borderColor}${alpha})`;
        this.ctx.lineWidth = 3 * (1 - progress * 0.5);
        this.ctx.beginPath();
        this.ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
        this.ctx.stroke();
    }

    _drawSlowEffect(effect, progress) {
        const alpha = effect.alpha * (1 - progress);
        const effects = RenderSystem.EFFECTS.SLOW;
        
        // Círculo de slow
        this.ctx.strokeStyle = `${effects.color}${alpha})`;
        this.ctx.lineWidth = 2 * (1 - progress * 0.5);
        this.ctx.setLineDash([5, 5]);
        this.ctx.beginPath();
        this.ctx.arc(effect.x, effect.y, 20 + progress * 10, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        // Partículas de gelo
        this._drawParticles(effect, progress, alpha, effects, 8, 15, 5);
    }

    _drawElectricEffect(effect, progress) {
        const alpha = effect.alpha * (1 - progress);
        const effects = RenderSystem.EFFECTS.ELECTRIC;
        
        // Círculo de choque elétrico
        this.ctx.strokeStyle = `${effects.color}${alpha})`;
        this.ctx.lineWidth = 3 * (1 - progress * 0.5);
        this.ctx.setLineDash([3, 3]);
        this.ctx.beginPath();
        this.ctx.arc(effect.x, effect.y, 15 + progress * 10, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        // Raios elétricos
        this._drawElectricRays(effect, progress, alpha, effects);
    }

    _drawParticles(effect, progress, alpha, effects, count, baseRadius, radiusIncrement) {
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const radius = baseRadius + progress * radiusIncrement;
            const particleX = effect.x + Math.cos(angle) * radius;
            const particleY = effect.y + Math.sin(angle) * radius;
            
            this.ctx.fillStyle = `${effects.color}${alpha * effects.fillAlpha})`;
            this.ctx.beginPath();
            this.ctx.arc(particleX, particleY, 2 * (1 - progress), 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    _drawElectricRays(effect, progress, alpha, effects) {
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const radius = 20 + progress * 15;
            const rayX = effect.x + Math.cos(angle) * radius;
            const rayY = effect.y + Math.sin(angle) * radius;
            
            this.ctx.strokeStyle = `${effects.color}${alpha * effects.fillAlpha})`;
            this.ctx.lineWidth = 2 * (1 - progress);
            this.ctx.beginPath();
            this.ctx.moveTo(effect.x, effect.y);
            this.ctx.lineTo(rayX, rayY);
            this.ctx.stroke();
        }
    }
} 