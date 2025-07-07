// Sistema de Gerenciamento de Sprites de Monstros
import { MONSTER_SPRITE_CONFIG, ENEMY_TYPE_TO_SPRITE } from '../config/monsterConfig.js';

export class MonsterSpriteManager {
    constructor(imageManager) {
        this.imageManager = imageManager;
        this.monsterSprites = new Map();
        this.animationFrames = new Map();
        this.currentFrame = 0;
        this.frameTimer = 0;
        this.frameDuration = 200; // 200ms por frame (5 FPS)
        
        // Usar configuração externa
        this.monsterConfigs = MONSTER_SPRITE_CONFIG;
    }

    // Carregar todos os sprites de um tipo de monstro
    async loadMonsterSprites(monsterType) {
        const config = this.monsterConfigs[monsterType];
        if (!config) {
            console.warn(`Configuração não encontrada para monstro: ${monsterType}`);
            return false;
        }

        const spritePromises = [];
        const spriteKeys = [];

        // Carregar sprites para cada direção
        for (const [direction, path] of Object.entries(config.sprites)) {
            const key = `${monsterType}_${direction}`;
            spriteKeys.push(key);
            
            spritePromises.push(
                this.imageManager.loadImage(key, path)
                    .then(img => {
                        // Preparar frames de animação
                        this.prepareAnimationFrames(monsterType, direction, img, config);
                        return img;
                    })
                    .catch(err => {
                        console.warn(`Falha ao carregar sprite ${key}: ${err.message}`);
                        return null;
                    })
            );
        }

        try {
            const results = await Promise.all(spritePromises);
            const successCount = results.filter(r => r !== null).length;
            
            if (successCount === spriteKeys.length) {
                this.monsterSprites.set(monsterType, spriteKeys);
                console.log(`✅ Sprites carregados para ${monsterType}: ${successCount}/${spriteKeys.length}`);
                return true;
            } else {
                console.warn(`⚠️ Apenas ${successCount}/${spriteKeys.length} sprites carregados para ${monsterType}`);
                return false;
            }
        } catch (error) {
            console.error(`Erro ao carregar sprites de ${monsterType}:`, error);
            return false;
        }
    }

    // Preparar frames de animação de um sprite
    prepareAnimationFrames(monsterType, direction, spriteImage, config) {
        const frames = [];
        const frameWidth = config.frameWidth;
        const frameHeight = config.frameHeight;
        const totalFrames = config.animationFrames;

        // Se é apenas 1 frame, usar a imagem diretamente
        if (totalFrames === 1) {
            frames.push(spriteImage);
        } else {
            // Criar canvas para extrair cada frame
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = frameWidth;
            canvas.height = frameHeight;

            // Extrair cada frame horizontalmente
            for (let i = 0; i < totalFrames; i++) {
                ctx.clearRect(0, 0, frameWidth, frameHeight);
                ctx.drawImage(
                    spriteImage,
                    i * frameWidth, 0, frameWidth, frameHeight,
                    0, 0, frameWidth, frameHeight
                );
                
                // Criar nova imagem do frame
                const frameCanvas = document.createElement('canvas');
                frameCanvas.width = frameWidth;
                frameCanvas.height = frameHeight;
                const frameCtx = frameCanvas.getContext('2d');
                frameCtx.drawImage(canvas, 0, 0);
                
                frames.push(frameCanvas);
            }
        }

        const key = `${monsterType}_${direction}`;
        this.animationFrames.set(key, frames);
    }

    // Obter sprite atual baseado na direção e animação
    getCurrentSprite(monsterType, direction, gameTime) {
        const spriteType = ENEMY_TYPE_TO_SPRITE[monsterType] || 'normal';
        const key = `${spriteType}_${direction}`;
        const frames = this.animationFrames.get(key);
        
        if (!frames || frames.length === 0) {
            // Fallback para sprite estático
            const staticSprite = this.imageManager.getImage(key);
            if (staticSprite) {
                return staticSprite;
            }
            
            // Se não encontrou sprite estático, tentar outras direções
            const config = this.monsterConfigs[spriteType];
            if (config) {
                for (const altDirection of Object.keys(config.sprites)) {
                    const altKey = `${spriteType}_${altDirection}`;
                    const altFrames = this.animationFrames.get(altKey);
                    if (altFrames && altFrames.length > 0) {
                        return altFrames[0]; // Retornar primeiro frame da direção alternativa
                    }
                    
                    const altStaticSprite = this.imageManager.getImage(altKey);
                    if (altStaticSprite) {
                        return altStaticSprite;
                    }
                }
            }
            
            // Se ainda não encontrou nada, retornar null para usar fallback geométrico
            return null;
        }

        // Se é apenas 1 frame, retornar diretamente (evita piscamento)
        if (frames.length === 1) {
            return frames[0];
        }

        // Calcular frame atual baseado no tempo (apenas para múltiplos frames)
        const frameIndex = Math.floor((gameTime % (this.frameDuration * frames.length)) / this.frameDuration);
        return frames[frameIndex % frames.length];
    }

    // Obter direção baseada no movimento
    getDirectionFromMovement(dx, dy) {
        if (Math.abs(dx) > Math.abs(dy)) {
            return dx > 0 ? 'right' : 'left';
        } else {
            return dy > 0 ? 'down' : 'up';
        }
    }

    // Desenhar monstro com sprite animado
    drawMonster(ctx, monster, gameTime) {
        const spriteType = ENEMY_TYPE_TO_SPRITE[monster.type] || 'normal';
        const config = this.monsterConfigs[spriteType];
        if (!config) {
            console.warn('⚠️ Config não encontrada para:', monster.type, 'usando fallback');
            // Fallback: desenhar círculo simples
            ctx.fillStyle = '#ff0000';
            ctx.beginPath();
            ctx.arc(monster.x, monster.y, 15, 0, Math.PI * 2);
            ctx.fill();
            return;
        }

        // Calcular direção baseada no movimento
        const direction = monster.direction || 'down';
        
        // Obter sprite atual
        const sprite = this.getCurrentSprite(monster.type, direction, gameTime);
        if (!sprite) {
            // Log detalhado para debug
            const debugInfo = this.getSpriteDebugInfo(monster.type, direction);
            console.warn('⚠️ Sprite não encontrado para:', debugInfo);
            
            // Fallback: desenhar círculo simples
            ctx.fillStyle = '#ff0000';
            ctx.beginPath();
            ctx.arc(monster.x, monster.y, 15, 0, Math.PI * 2);
            ctx.fill();
            return;
        }

        // Desenhar sprite centralizado na posição do monstro
        const drawX = monster.x - config.size.width / 2;
        const drawY = monster.y - config.size.height / 2;
        
        try {
            ctx.drawImage(sprite, drawX, drawY, config.size.width, config.size.height);
        } catch (error) {
            console.error('❌ Erro ao desenhar sprite:', error, {
                sprite: sprite,
                drawX: drawX,
                drawY: drawY,
                width: config.size.width,
                height: config.size.height,
                debugInfo: this.getSpriteDebugInfo(monster.type, direction)
            });
            
            // Fallback: desenhar círculo simples
            ctx.fillStyle = '#ff0000';
            ctx.beginPath();
            ctx.arc(monster.x, monster.y, 15, 0, Math.PI * 2);
            ctx.fill();
            return;
        }

        // --- Barra de vida ---
        if (monster.maxHealth && monster.health !== undefined) {
            const barWidth = config.size.width;
            const barHeight = 5;
            const barX = monster.x - barWidth / 2;
            const barY = drawY - 10;

            // Fundo da barra
            ctx.fillStyle = '#222';
            ctx.fillRect(barX, barY, barWidth, barHeight);

            // Vida atual
            const healthPercent = Math.max(0, monster.health / monster.maxHealth);
            ctx.fillStyle = '#4caf50';
            ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);

            // Borda
            ctx.strokeStyle = '#000';
            ctx.strokeRect(barX, barY, barWidth, barHeight);

            // --- Barra de status de slow/congelamento ---
            if (monster.slowUntil && Date.now() < monster.slowUntil) {
                const slowBarY = barY - 8;
                const slowBarWidth = barWidth;
                const slowBarHeight = 3;
                // Calcular início do efeito
                const slowStart = monster.slowStartTime || (monster.slowUntil - (monster.freezeBonus || 1) * 1000);
                const totalSlowDuration = monster.slowUntil - slowStart;
                const elapsed = Math.max(0, Math.min(totalSlowDuration, Date.now() - slowStart));
                const remainingProgress = 1 - (elapsed / totalSlowDuration);

                // Fundo da barra de slow
                ctx.fillStyle = 'rgba(54, 185, 204, 0.3)';
                ctx.fillRect(barX, slowBarY, slowBarWidth, slowBarHeight);

                // Progresso da barra de slow
                ctx.fillStyle = '#36b9cc';
                ctx.fillRect(barX, slowBarY, slowBarWidth * remainingProgress, slowBarHeight);

                // Borda da barra de slow
                ctx.strokeStyle = '#36b9cc';
                ctx.lineWidth = 1;
                ctx.strokeRect(barX, slowBarY, slowBarWidth, slowBarHeight);
            }
        }

        // --- Efeito visual de slow/congelamento (brilho azulado) ---
        if (monster.slowUntil && Date.now() < monster.slowUntil) {
            ctx.save();
            ctx.globalAlpha = 0.5;
            ctx.beginPath();
            ctx.arc(monster.x, monster.y, config.size.width / 2 + 4, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(54, 185, 204, 0.25)';
            ctx.shadowColor = '#36b9cc';
            ctx.shadowBlur = 12;
            ctx.fill();
            ctx.restore();
        }

        // --- Efeito de congelamento ---
        if (monster.isFrozen) {
            ctx.save();
            ctx.globalAlpha = 0.4;
            ctx.fillStyle = '#00d0ff';
            ctx.beginPath();
            ctx.arc(monster.x, monster.y, config.size.width / 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    // Verificar se um tipo de monstro está carregado
    isMonsterLoaded(monsterType) {
        // Verificar se o tipo de monstro está na lista de monstros carregados
        if (this.monsterSprites.has(monsterType)) {
            return true;
        }
        
        // Verificar se pelo menos uma direção do sprite está carregada
        const config = this.monsterConfigs[monsterType];
        if (config) {
            for (const direction of Object.keys(config.sprites)) {
                const key = `${monsterType}_${direction}`;
                if (this.imageManager.isImageLoaded(key) || this.animationFrames.has(key)) {
                    return true;
                }
            }
        }
        
        return false;
    }

    // Verificar se um sprite específico está disponível
    isSpriteAvailable(monsterType, direction) {
        const key = `${monsterType}_${direction}`;
        return this.imageManager.isImageLoaded(key) || this.animationFrames.has(key);
    }

    // Verificar se um sprite é único (não sprite sheet)
    isSingleFrameSprite(monsterType) {
        const config = this.monsterConfigs[monsterType];
        return config ? config.animationFrames === 1 : true;
    }

    // Obter informações de debug sobre um sprite
    getSpriteDebugInfo(monsterType, direction) {
        const spriteType = ENEMY_TYPE_TO_SPRITE[monsterType] || 'normal';
        const key = `${spriteType}_${direction}`;
        const config = this.monsterConfigs[spriteType];
        const frames = this.animationFrames.get(key);
        const staticSprite = this.imageManager.getImage(key);
        
        return {
            monsterType,
            spriteType,
            direction,
            key,
            hasConfig: !!config,
            animationFrames: config ? config.animationFrames : 0,
            isSingleFrame: this.isSingleFrameSprite(spriteType),
            hasFrames: !!frames,
            framesCount: frames ? frames.length : 0,
            hasStaticSprite: !!staticSprite,
            availableDirections: config ? Object.keys(config.sprites) : []
        };
    }

    // Obter lista de tipos de monstros disponíveis
    getAvailableMonsters() {
        return Object.keys(this.monsterConfigs);
    }

    // Carregar todos os monstros disponíveis
    async loadAllMonsters() {
        const monsters = this.getAvailableMonsters();
        
        if (monsters.length === 0) {
            console.warn('⚠️ Nenhum monstro configurado!');
            return false;
        }
        
        const results = await Promise.all(
            monsters.map(monsterType => this.loadMonsterSprites(monsterType))
        );
        
        const successCount = results.filter(r => r).length;
        console.log(`🎮 Monstros carregados: ${successCount}/${monsters.length}`);
        
        return successCount === monsters.length;
    }

    // Atualizar configuração de animação
    updateAnimationConfig(frameDuration) {
        this.frameDuration = frameDuration;
    }

    // Obter estatísticas de carregamento
    getStats() {
        const stats = {
            loadedMonsters: this.monsterSprites.size,
            totalMonsters: this.getAvailableMonsters().length,
            totalFrames: 0,
            memoryUsage: 0
        };

        // Calcular frames totais
        for (const frames of this.animationFrames.values()) {
            stats.totalFrames += frames.length;
        }

        return stats;
    }

    // Limpar cache de sprites
    clearCache() {
        this.animationFrames.clear();
        this.monsterSprites.clear();
    }

    // Recarregar sprites de um tipo específico
    async reloadMonsterSprites(monsterType) {
        console.log(`🔄 Recarregando sprites para ${monsterType}...`);
        
        // Limpar sprites existentes deste tipo
        const config = this.monsterConfigs[monsterType];
        if (config) {
            for (const direction of Object.keys(config.sprites)) {
                const key = `${monsterType}_${direction}`;
                this.animationFrames.delete(key);
            }
        }
        this.monsterSprites.delete(monsterType);
        
        // Recarregar
        return await this.loadMonsterSprites(monsterType);
    }

    // Verificar e reparar sprites corrompidos
    async repairSprites() {
        console.log('🔧 Verificando e reparando sprites...');
        const monsters = this.getAvailableMonsters();
        let repairedCount = 0;
        
        for (const monsterType of monsters) {
            const config = this.monsterConfigs[monsterType];
            if (!config) continue;
            
            let needsRepair = false;
            for (const direction of Object.keys(config.sprites)) {
                const key = `${monsterType}_${direction}`;
                if (!this.imageManager.isImageLoaded(key) && !this.animationFrames.has(key)) {
                    needsRepair = true;
                    break;
                }
            }
            
            if (needsRepair) {
                console.log(`🔧 Reparando sprites para ${monsterType}...`);
                const success = await this.reloadMonsterSprites(monsterType);
                if (success) {
                    repairedCount++;
                }
            }
        }
        
        console.log(`✅ Reparação concluída: ${repairedCount} tipos de monstros reparados`);
        return repairedCount;
    }
} 