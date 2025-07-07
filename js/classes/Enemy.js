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
        this.isRemoved = false;
        
        // Direção inicial
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

    mapEnemyTypeToSprite() {
        return ENEMY_TYPE_TO_SPRITE[this.type] || 'normal';
    }

    update(deltaTime) {
        if (this.gameState.isPaused) return;

        this.updateSlowEffect();
        this.updateMovement(deltaTime);
    }

    updateSlowEffect() {
        if (this.slowUntil && Date.now() > this.slowUntil) {
            if (this.originalSpeed) {
                this.speed = this.originalSpeed;
                this.originalSpeed = null;
            }
            this.slowUntil = null;
        }
    }

    updateMovement(deltaTime) {
        if (this.pathIndex >= this.enemyPath.length - 1) {
            this.reachEnd();
            return;
        }

        const target = this.getNextTarget();
        const distance = this.calculateDistance(target.x, target.y);

        // Calcular direção para sprites
        if (this.monsterSpriteManager) {
            const dx = target.x - this.x;
            const dy = target.y - this.y;
            this.direction = this.monsterSpriteManager.getDirectionFromMovement(dx, dy);
        }

        if (distance < 5) {
            this.pathIndex++;
        } else {
            this.moveTowardsTarget(target, deltaTime);
        }
    }

    getNextTarget() {
        const nextPathPoint = this.enemyPath[this.pathIndex + 1];
        return {
            x: nextPathPoint.x * this.GAME_CONFIG.gridSize + this.GAME_CONFIG.gridSize / 2,
            y: nextPathPoint.y * this.GAME_CONFIG.gridSize + this.GAME_CONFIG.gridSize / 2
        };
    }

    calculateDistance(targetX, targetY) {
        const dx = targetX - this.x;
        const dy = targetY - this.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    moveTowardsTarget(target, deltaTime) {
        const distance = this.calculateDistance(target.x, target.y);
        const safeDeltaTime = Math.min(deltaTime, 100);
        const moveSpeed = this.speed * (safeDeltaTime / 16.67);
        
        const moveX = ((target.x - this.x) / distance) * moveSpeed;
        const moveY = ((target.y - this.y) / distance) * moveSpeed;
        
        const movementDistance = Math.sqrt(moveX * moveX + moveY * moveY);
        
        if (movementDistance >= distance) {
            // Ir direto para o alvo se vai passar
            this.x = target.x;
            this.y = target.y;
            this.pathIndex++;
        } else {
            this.x += moveX;
            this.y += moveY;
        }
    }

    reachEnd() {
        let damage = 1;
        if (this.GAME_CONFIG?.defenseBonus) {
            damage = Math.max(1, Math.round(damage * (1 - this.GAME_CONFIG.defenseBonus)));
        }
        this.gameState.health -= damage;
        this.remove();
    }

    takeDamage(damage) {
        this.health -= damage;
        this.createDamageNumber(damage);
        
        if (this.health <= 0) {
            this.handleDeath();
        }
    }

    createDamageNumber(damage) {
        const damageColor = this.getDamageColor(damage);
        const damageNumber = new this.DamageNumber(this.x, this.y - 20, damage, damageColor);
        this.gameState.damageNumbers.push(damageNumber);
    }

    getDamageColor(damage) {
        if (damage >= 50) return '#ffcc00'; // Amarelo para dano muito alto
        if (damage >= 30) return '#ff6600'; // Laranja para dano alto
        return '#ff0000'; // Vermelho padrão
    }

    handleDeath() {
        this.addRewards();
        this.updateAchievements();
        this.showDeathNotification();
        this.remove();
    }

    addRewards() {
        const goldReward = Math.floor(this.reward * this.GAME_CONFIG.goldMultiplier);
        this.gameState.gold += goldReward;
        
        const savedConfig = localStorage.getItem('arqueiroConfig');
        const pointsPerKill = savedConfig ? JSON.parse(savedConfig).pointsPerKill || 10 : 10;
        const baseScore = this.reward * pointsPerKill;
        const finalScore = Math.floor(baseScore * this.scoreMultiplier);
        this.gameState.score += finalScore;
    }

    updateAchievements() {
        if (!this.gameState.achievements) {
            this.gameState.achievements = {
                firstEliteKilled: false,
                perfectWaves: 0,
                consecutivePerfectWaves: 0,
                towersBuilt: 0,
                elitesKilled: 0
            };
        }
        
        if (this.type === 'elite') {
            this.gameState.achievements.elitesKilled++;
            if (!this.gameState.achievements.firstEliteKilled) {
                this.gameState.achievements.firstEliteKilled = true;
                this.showNotification('Primeiro Elite derrotado! Conquista desbloqueada!', 'success');
            }
        }
    }

    showDeathNotification() {
        const goldReward = Math.floor(this.reward * this.GAME_CONFIG.goldMultiplier);
        const savedConfig = localStorage.getItem('arqueiroConfig');
        const pointsPerKill = savedConfig ? JSON.parse(savedConfig).pointsPerKill || 10 : 10;
        const baseScore = this.reward * pointsPerKill;
        const finalScore = Math.floor(baseScore * this.scoreMultiplier);

        if (this.type === 'elite') {
            this.showNotification(`Elite derrotado! +${goldReward} ouro! +${finalScore} pontos!`, 'success');
        } else if (this.type === 'tank') {
            this.showNotification(`Tanque derrotado! +${finalScore} pontos!`, 'info');
        } else if (finalScore > baseScore) {
            this.showNotification(`+${finalScore} pontos!`, 'info');
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

        if (this.shouldUseSprite()) {
            this.drawSprite(ctx);
        } else {
            this.drawFallback(ctx);
        }
    }

    shouldUseSprite() {
        return this.monsterSpriteManager && this.monsterSpriteManager.isMonsterLoaded(this.spriteType);
    }

    drawSprite(ctx) {
        try {
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
            this.drawFallback(ctx);
        }
    }

    drawFallback(ctx) {
        ctx.save();
        this.drawEnemyBody(ctx);
        ctx.restore();
        
        this.drawHealthBar(ctx);
        this.drawSlowBar(ctx);
        this.drawTypeIcon(ctx);
    }

    drawEnemyBody(ctx) {
        const { fillColor, strokeColor, lineWidth, shadowColor, shadowBlur } = this.getEnemyStyle();
        
        ctx.fillStyle = fillColor;
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = lineWidth;
        
        if (shadowColor) {
            ctx.shadowColor = shadowColor;
            ctx.shadowBlur = shadowBlur;
        }
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    }

    getEnemyStyle() {
        const isSlowed = this.slowUntil && Date.now() < this.slowUntil;
        
        return {
            fillColor: this.color,
            strokeColor: isSlowed ? '#36b9cc' : '#000000',
            lineWidth: isSlowed ? 3 : 2,
            shadowColor: isSlowed ? '#36b9cc' : null,
            shadowBlur: isSlowed ? 8 : 0
        };
    }

    drawHealthBar(ctx) {
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
    }

    drawSlowBar(ctx) {
        if (!this.slowUntil || Date.now() >= this.slowUntil) return;

        const barWidth = this.size * 2;
        const barHeight = 3;
        const barX = this.x - barWidth / 2;
        const barY = this.y - this.size - 18;
        
        const remainingProgress = this.calculateSlowProgress();
        
        // Fundo da barra de slow
        ctx.fillStyle = 'rgba(54, 185, 204, 0.3)';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // Progresso da barra de slow
        ctx.fillStyle = '#36b9cc';
        ctx.fillRect(barX, barY, barWidth * remainingProgress, barHeight);
        
        // Borda da barra de slow
        ctx.strokeStyle = '#36b9cc';
        ctx.lineWidth = 1;
        ctx.strokeRect(barX, barY, barWidth, barHeight);
    }

    calculateSlowProgress() {
        const slowStart = this.slowStartTime || (this.slowUntil - (this.freezeBonus || 1) * 1000);
        const totalSlowDuration = this.slowUntil - slowStart;
        const elapsed = Math.max(0, Math.min(totalSlowDuration, Date.now() - slowStart));
        return 1 - (elapsed / totalSlowDuration);
    }

    drawTypeIcon(ctx) {
        const icon = this.getTypeIcon();
        
        ctx.font = '16px Arial';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        
        ctx.strokeText(icon, this.x, this.y + 5);
        ctx.fillText(icon, this.x, this.y + 5);
    }

    getTypeIcon() {
        switch (this.type) {
            case 'tank': return '🛡️';
            case 'elite': return '👑';
            default: return '⚡';
        }
    }
} 