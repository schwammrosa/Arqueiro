// Constantes para configuração de projéteis
const PROJECTILE_CONFIG = {
    HIT_DISTANCE: 20,
    TESLA_HIT_DISTANCE: 25,
    CANNON_HIT_DISTANCE: 25,
    FRAME_RATE: 60,
    FRAME_TIME: 16.67,
    MAGIC_COLOR: '#36b9cc',
    TESLA_COLOR: '#00cfff',
    TRAIL_MAX_POINTS: 10,
    EFFECT_DURATION: 300,
    CHAIN_DELAY: 100,
    MAX_LIFETIME: 5000,
    MAX_DISTANCE: 200
};

// Classe base para projéteis
class BaseProjectile {
    constructor(x, y, target, damage, color, GAME_CONFIG, gameState = null) {
        this.x = x;
        this.y = y;
        this.target = target;
        this.damage = damage;
        this.color = color;
        this.speed = GAME_CONFIG.projectileSpeed;
        this.size = GAME_CONFIG.projectileSize;
        this.isRemoved = false;
        this.gameState = gameState;
        this.createdAt = Date.now();
        this.startX = x;
        this.startY = y;
    }

    update(deltaTime) {
        if (this.isRemoved || !this.target) return false;

        // Verificar tempo de vida máximo
        if (Date.now() - this.createdAt > PROJECTILE_CONFIG.MAX_LIFETIME) {
            this.remove();
            return false;
        }

        // Verificar se passou muito longe do ponto inicial
        const distanceFromStart = Math.sqrt(
            Math.pow(this.x - this.startX, 2) + Math.pow(this.y - this.startY, 2)
        );
        if (distanceFromStart > PROJECTILE_CONFIG.MAX_DISTANCE) {
            this.remove();
            return false;
        }

        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.getHitDistance()) {
            this.hitTarget();
            return true;
        }

        this.moveTowardsTarget(dx, dy, distance, deltaTime);
        return false;
    }

    getHitDistance() {
        return PROJECTILE_CONFIG.HIT_DISTANCE;
    }

    moveTowardsTarget(dx, dy, distance, deltaTime) {
        const moveSpeed = this.speed * (deltaTime / PROJECTILE_CONFIG.FRAME_TIME);
        this.x += (dx / distance) * moveSpeed;
        this.y += (dy / distance) * moveSpeed;
    }

    hitTarget() {
        if (!this.target || this.target.isRemoved) return;
        this.target.takeDamage(this.damage);
        this.remove();
    }

    remove() {
        this.isRemoved = true;
    }

    draw(ctx) {
        if (this.isRemoved) return;
        
        ctx.save();
        this.drawProjectile(ctx);
        ctx.restore();
    }

    drawProjectile(ctx) {
        ctx.fillStyle = this.color;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    }

    addVisualEffect(effect) {
        if (!this.gameState.visualEffects) {
            this.gameState.visualEffects = [];
        }
        this.gameState.visualEffects.push(effect);
        
        setTimeout(() => {
            const index = this.gameState.visualEffects.indexOf(effect);
            if (index > -1) {
                this.gameState.visualEffects.splice(index, 1);
            }
        }, effect.duration);
    }
}

// Classe Projétil básico
export class Projectile extends BaseProjectile {
    constructor(x, y, target, damage, color, GAME_CONFIG, tower = null) {
        super(x, y, target, damage, color, GAME_CONFIG);
        this.tower = tower;
    }

    hitTarget() {
        if (!this.target || this.target.isRemoved) return;
        
        this.target.takeDamage(this.damage);
        
        if (this.tower && this.tower.type === 'magic') {
            this.applySlowEffect();
        }
        
        this.remove();
    }

    applySlowEffect() {
        if (!this.tower || this.tower.type !== 'magic' || !this.target || this.target.isRemoved) return;
        
        const slowEffect = this.getSlowEffectValue();
        const slowDuration = this.tower.freezeBonus * 1000;
        
        if (!this.target.slowUntil || this.target.slowUntil < Date.now()) {
            this.target.slowUntil = Date.now() + slowDuration;
            this.target.originalSpeed = this.target.originalSpeed || this.target.speed;
            this.target.speed *= slowEffect;
        } else {
            this.target.slowUntil += slowDuration;
        }
        
        if (this.tower.createSlowEffect) {
            this.tower.createSlowEffect();
        }
    }

    getSlowEffectValue() {
        if (this.tower.towerTypes && this.tower.towerTypes.magic) {
            return (this.tower.towerTypes.magic.slowEffect || 40) / 100;
        }
        return 0.4; // 40% padrão (60% de redução)
    }

    drawProjectile(ctx) {
        if (this.color === PROJECTILE_CONFIG.MAGIC_COLOR) {
            this.drawMagicProjectile(ctx);
        } else {
            super.drawProjectile(ctx);
        }
    }

    drawMagicProjectile(ctx) {
        ctx.shadowColor = PROJECTILE_CONFIG.MAGIC_COLOR;
        ctx.shadowBlur = 10;
        
        ctx.fillStyle = this.color;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        
        const pulseSize = this.size + Math.sin(Date.now() * 0.01) * 1;
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, pulseSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        ctx.shadowBlur = 0;
    }
}

// Classe Projétil Tesla com Ricochete
export class TeslaChainProjectile extends BaseProjectile {
    constructor(x, y, targets, baseDamage, color, GAME_CONFIG, gameState) {
        super(x, y, targets[0], baseDamage, color, GAME_CONFIG, gameState);
        this.targets = targets;
        this.currentTargetIndex = 0;
        this.baseDamage = baseDamage;
        this.speed = GAME_CONFIG.projectileSpeed * 1.2;
        this.size = GAME_CONFIG.projectileSize * 1.5;
        this.electricTrail = [];
    }

    getHitDistance() {
        return PROJECTILE_CONFIG.TESLA_HIT_DISTANCE;
    }

    update(deltaTime) {
        if (this.isRemoved) return;

        this.updateTrail();
        
        if (!this.target || this.gameState.enemies.indexOf(this.target) === -1) {
            this.moveToNextTarget();
            return;
        }

        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.getHitDistance()) {
            this.hitTarget();
            return;
        }

        this.moveTowardsTarget(dx, dy, distance, deltaTime);
    }

    updateTrail() {
        this.electricTrail.push({ x: this.x, y: this.y, time: Date.now() });
        if (this.electricTrail.length > PROJECTILE_CONFIG.TRAIL_MAX_POINTS) {
            this.electricTrail.shift();
        }
    }

    hitTarget() {
        const damageMultiplier = this.getDamageMultiplier();
        const damage = Math.floor(this.baseDamage * damageMultiplier);
        
        this.target.takeDamage(damage);
        this.createElectricEffect();
        this.moveToNextTarget();
    }

    getDamageMultiplier() {
        switch (this.currentTargetIndex) {
            case 0: return 1.0;
            case 1: return 0.7;
            default: return 0.5;
        }
    }

    moveToNextTarget() {
        this.currentTargetIndex++;
        
        if (this.currentTargetIndex < this.targets.length) {
            this.target = this.targets[this.currentTargetIndex];
            
            if (!this.target || this.gameState.enemies.indexOf(this.target) === -1) {
                this.moveToNextTarget();
                return;
            }
        } else {
            this.remove();
        }
    }

    createElectricEffect() {
        const effect = {
            x: this.target.x,
            y: this.target.y,
            time: Date.now(),
            duration: PROJECTILE_CONFIG.EFFECT_DURATION,
            type: 'electric'
        };
        
        this.addVisualEffect(effect);
    }

    draw(ctx) {
        if (this.isRemoved) return;

        ctx.save();
        this.drawElectricTrail(ctx);
        this.drawTeslaProjectile(ctx);
        ctx.restore();
    }

    drawElectricTrail(ctx) {
        if (this.electricTrail.length <= 1) return;
        
        ctx.strokeStyle = PROJECTILE_CONFIG.TESLA_COLOR;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.globalAlpha = 0.6;
        
        ctx.beginPath();
        ctx.moveTo(this.electricTrail[0].x, this.electricTrail[0].y);
        for (let i = 1; i < this.electricTrail.length; i++) {
            ctx.lineTo(this.electricTrail[i].x, this.electricTrail[i].y);
        }
        ctx.stroke();
    }

    drawTeslaProjectile(ctx) {
        ctx.fillStyle = this.color;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.globalAlpha = 1;
        
        const glowSize = this.size + Math.sin(Date.now() * 0.01) * 2;
        ctx.shadowColor = PROJECTILE_CONFIG.TESLA_COLOR;
        ctx.shadowBlur = 10;
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, glowSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        ctx.shadowBlur = 0;
    }
}

// Classe Projétil do Canhão com Dano em Área
export class CannonProjectile extends BaseProjectile {
    constructor(x, y, target, damage, color, GAME_CONFIG, gameState, areaRadius, areaDamageMultiplier) {
        super(x, y, target, damage, color, GAME_CONFIG, gameState);
        this.speed = GAME_CONFIG.projectileSpeed * 0.8;
        this.size = GAME_CONFIG.projectileSize * 2;
        this.areaRadius = areaRadius;
        this.areaDamageMultiplier = areaDamageMultiplier;
    }

    getHitDistance() {
        return PROJECTILE_CONFIG.CANNON_HIT_DISTANCE;
    }

    update(deltaTime) {
        if (this.isRemoved || !this.target) return;

        if (!this.target || this.gameState.enemies.indexOf(this.target) === -1) {
            this.explode();
            return;
        }

        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.getHitDistance()) {
            this.explode();
            return;
        }

        this.moveTowardsTarget(dx, dy, distance, deltaTime);
    }

    explode() {
        const enemies = [...this.gameState.enemies];
        const enemiesHit = [];

        for (let enemy of enemies) {
            if (!this.isValidEnemy(enemy)) continue;
            
            const distance = this.getDistanceToEnemy(enemy);
            
            if (distance <= this.areaRadius) {
                const damage = Math.floor(this.damage * this.areaDamageMultiplier);
                enemy.takeDamage(damage);
                enemiesHit.push({ enemy, distance, damage });
            }
        }

        this.createExplosionEffect();
        this.remove();
    }

    isValidEnemy(enemy) {
        return enemy && enemy.health && enemy.health > 0 && !enemy.isRemoved;
    }

    getDistanceToEnemy(enemy) {
        const dx = enemy.x - this.x;
        const dy = enemy.y - this.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    createExplosionEffect() {
        const explosion = {
            x: this.x,
            y: this.y,
            radius: this.areaRadius,
            startTime: Date.now(),
            duration: PROJECTILE_CONFIG.EFFECT_DURATION,
            alpha: 0.8
        };
        
        this.addVisualEffect(explosion);
    }

    drawProjectile(ctx) {
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 8;
        
        ctx.fillStyle = this.color;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        ctx.shadowBlur = 0;
    }
} 