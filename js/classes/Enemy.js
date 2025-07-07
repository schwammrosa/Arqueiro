// Classe Inimigo
import { ENEMY_TYPE_TO_SPRITE } from '../config/monsterConfig.js';

export class Enemy {
    constructor(type = null, gameState, GAME_CONFIG, enemyPath, chooseEnemyType, calculateEnemyStats, DamageNumber, showNotification, monsterSpriteManager = null) {
        this.pathIndex = 0;
        this.x = enemyPath[0].x * GAME_CONFIG.gridSize + GAME_CONFIG.gridSize / 2;
        this.y = enemyPath[0].y * GAME_CONFIG.gridSize + GAME_CONFIG.gridSize / 2;
        
        // Escolher tipo se não especificado
        this.type = type || chooseEnemyType();
        
        // Calcular estatísticas usando a função do módulo
        const stats = calculateEnemyStats(this.type, gameState.wave, GAME_CONFIG);
        this.speed = stats.speed;
        this.health = stats.health;
        this.maxHealth = stats.maxHealth;
        this.reward = stats.reward;
        this.size = stats.size;
        this.color = stats.color;
        this.scoreMultiplier = stats.scoreMultiplier || 1;
        this.isRemoved = false; // Flag para evitar remoção duplicada
        
        // Direção inicial (será calculada durante o movimento)
        this.direction = 'down';
        
        // Dependências injetadas
        this.gameState = gameState;
        this.GAME_CONFIG = GAME_CONFIG;
        this.enemyPath = enemyPath;
        this.DamageNumber = DamageNumber;
        this.showNotification = showNotification;
        this.monsterSpriteManager = monsterSpriteManager;
        
        // Mapear tipos de inimigos para sprites de monstros
        this.spriteType = this.mapEnemyTypeToSprite();
    }

    // Mapear tipos de inimigos para sprites de monstros
    mapEnemyTypeToSprite() {
        return ENEMY_TYPE_TO_SPRITE[this.type] || 'normal';
    }

    update(deltaTime) {
        if (this.gameState.isPaused) return;

        // Remover lentidão se o tempo acabou
        if (this.slowUntil && Date.now() > this.slowUntil) {
            if (this.originalSpeed) {
                this.speed = this.originalSpeed;
                this.originalSpeed = null;
            }
            this.slowUntil = null;
        }

        // Mover pelo caminho
        if (this.pathIndex < this.enemyPath.length - 1) {
            const targetX = this.enemyPath[this.pathIndex + 1].x * this.GAME_CONFIG.gridSize + this.GAME_CONFIG.gridSize / 2;
            const targetY = this.enemyPath[this.pathIndex + 1].y * this.GAME_CONFIG.gridSize + this.GAME_CONFIG.gridSize / 2;

            const dx = targetX - this.x;
            const dy = targetY - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Calcular direção para sprites
            if (this.monsterSpriteManager) {
                this.direction = this.monsterSpriteManager.getDirectionFromMovement(dx, dy);
            }

            if (distance < 5) {
                this.pathIndex++;
            } else {
                // Ajustar velocidade para funcionar melhor com deltaTime
                // Limitar deltaTime localmente também para maior segurança
                const safeDeltaTime = Math.min(deltaTime, 100);
                const moveSpeed = this.speed * (safeDeltaTime / 16.67); // Normalizar para 60fps
                
                // Calcular movimento
                const moveX = (dx / distance) * moveSpeed;
                const moveY = (dy / distance) * moveSpeed;
                
                // Verificar se o movimento não vai passar do alvo (evitar overshoot)
                const remainingDistance = Math.sqrt(dx * dx + dy * dy);
                const movementDistance = Math.sqrt(moveX * moveX + moveY * moveY);
                
                if (movementDistance >= remainingDistance) {
                    // Se o movimento vai passar do alvo, ir direto para o alvo
                    this.x = targetX;
                    this.y = targetY;
                    this.pathIndex++; // Avançar para o próximo ponto
                } else {
                    // Movimento normal
                    this.x += moveX;
                    this.y += moveY;
                }
            }
        } else {
            // Inimigo chegou ao final
            let dmg = 1;
            if (this.GAME_CONFIG && this.GAME_CONFIG.defenseBonus) {
                dmg = Math.max(1, Math.round(dmg * (1 - this.GAME_CONFIG.defenseBonus)));
            }
            this.gameState.health -= dmg;
            this.remove();
        }
    }

    takeDamage(damage) {
        this.health -= damage;
        
        // Criar número de dano com cor baseada no dano
        let damageColor = '#ff0000'; // Vermelho padrão
        if (damage >= 30) damageColor = '#ff6600'; // Laranja para dano alto
        if (damage >= 50) damageColor = '#ffcc00'; // Amarelo para dano muito alto
        
        const damageNumber = new this.DamageNumber(this.x, this.y - 20, damage, damageColor);
        this.gameState.damageNumbers.push(damageNumber);
        
        if (this.health <= 0) {
            this.gameState.gold += Math.floor(this.reward * this.GAME_CONFIG.goldMultiplier);
            
            // Carregar configuração de pontos por inimigo
            const savedConfig = localStorage.getItem('arqueiroConfig');
            const pointsPerKill = savedConfig ? JSON.parse(savedConfig).pointsPerKill || 10 : 10;
            
            // Calcular pontos usando o multiplicador do tipo de inimigo
            const baseScore = this.reward * pointsPerKill;
            const finalScore = Math.floor(baseScore * this.scoreMultiplier);
            this.gameState.score += finalScore;
            
            // Rastrear conquistas
            if (!this.gameState.achievements) {
                this.gameState.achievements = {
                    firstEliteKilled: false,
                    perfectWaves: 0,
                    consecutivePerfectWaves: 0,
                    towersBuilt: 0,
                    elitesKilled: 0
                };
            }
            
            // Notificação especial para diferentes tipos
            if (this.type === 'elite') {
                this.gameState.achievements.elitesKilled++;
                if (!this.gameState.achievements.firstEliteKilled) {
                    this.gameState.achievements.firstEliteKilled = true;
                    this.showNotification(`Primeiro Elite derrotado! Conquista desbloqueada!`, 'success');
                }
                this.showNotification(`Elite derrotado! +${this.reward * this.GAME_CONFIG.goldMultiplier} ouro! +${finalScore} pontos!`, 'success');
            } else if (this.type === 'tank') {
                this.showNotification(`Tanque derrotado! +${finalScore} pontos!`, 'info');
            } else if (finalScore > baseScore) {
                this.showNotification(`+${finalScore} pontos!`, 'info');
            }
            
            this.remove();
        }
    }

    remove() {
        if (this.isRemoved) return;
        this.isRemoved = true;
        const index = this.gameState.enemies.indexOf(this);
        if (index > -1) {
            this.gameState.enemies.splice(index, 1);
            this.gameState.monstersDefeated = (this.gameState.monstersDefeated || 0) + 1;
        }
    }

    draw(ctx) {
        if (this.isRemoved) return;

        // Tentar usar sprite se disponível
        if (this.monsterSpriteManager && this.monsterSpriteManager.isMonsterLoaded(this.spriteType)) {
            try {
                // Usar sprite animado
                this.monsterSpriteManager.drawMonster(ctx, {
                    type: this.spriteType,
                    x: this.x,
                    y: this.y,
                    direction: this.direction,
                    health: this.health,
                    maxHealth: this.maxHealth,
                    slowUntil: this.slowUntil,
                    slowStartTime: this.slowStartTime,
                    freezeBonus: this.freezeBonus,
                    isFrozen: this.isFrozen
                }, this.gameState.gameTime);
            } catch (error) {
                console.error('❌ Erro ao desenhar sprite do monstro:', error, {
                    type: this.type,
                    spriteType: this.spriteType,
                    direction: this.direction
                });
                // Fallback para desenho simples
                this.drawFallback(ctx);
            }
        } else {
            // Fallback para desenho simples
            this.drawFallback(ctx);
        }
    }

    // Método de fallback para desenho simples
    drawFallback(ctx) {
        ctx.save();
        
        // Efeito visual de slow - inimigos lentos ficam azulados
        let fillColor = this.color;
        let strokeColor = '#000000';
        
        if (this.slowUntil && Date.now() < this.slowUntil) {
            // Aplicar efeito azulado para inimigos lentos
            fillColor = this.color;
            strokeColor = '#36b9cc';
            ctx.lineWidth = 3;
            
            // Adicionar brilho azul
            ctx.shadowColor = '#36b9cc';
            ctx.shadowBlur = 8;
        } else {
            ctx.lineWidth = 2;
        }
        
        ctx.fillStyle = fillColor;
        ctx.strokeStyle = strokeColor;
        
        // Desenhar círculo do inimigo
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        ctx.restore();
        
        // Desenhar barra de vida
        const barWidth = this.size * 2;
        const barHeight = 4;
        const barX = this.x - barWidth / 2;
        const barY = this.y - this.size - 10;
        
        // Fundo da barra
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // Vida atual
        const healthPercent = this.health / this.maxHealth;
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
        
        // Borda da barra
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.strokeRect(barX, barY, barWidth, barHeight);
        
        // Barra de status do slow (se ativo)
        if (this.slowUntil && Date.now() < this.slowUntil) {
            const slowBarY = barY - 8;
            const slowBarWidth = barWidth;
            const slowBarHeight = 3;
            
            // Calcular progresso do slow
            const slowStart = this.slowStartTime || (this.slowUntil - (this.freezeBonus || 1) * 1000);
            const totalSlowDuration = this.slowUntil - slowStart;
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
        
        // Desenhar ícone baseado no tipo
        ctx.font = '16px Arial';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        
        let icon = '⚡';
        if (this.type === 'tank') icon = '🛡️';
        if (this.type === 'elite') icon = '👑';
        ctx.strokeText(icon, this.x, this.y + 5);
        ctx.fillText(icon, this.x, this.y + 5);
    }
} 