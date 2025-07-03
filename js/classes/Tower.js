let TESLA_ID_COUNTER = 1;

// Classe Torre
export class Tower {
    constructor(x, y, type, towerTypes, gameConfig, gameState, ctx, Projectile, updateUI, showNotification) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.towerTypes = towerTypes;
        this.gameConfig = gameConfig;
        this.gameState = gameState;
        this.ctx = ctx;
        this.Projectile = Projectile;
        this.updateUI = updateUI;
        this.showNotification = showNotification;
        this.level = 1;
        this.isSelected = false;
        this.totalCost = 0;
        this.setBaseStats();
        this.applyBonuses();
        if (this.type === 'tesla') {
            this.teslaId = TESLA_ID_COUNTER++;
        }
    }

    setBaseStats() {
        const base = this.towerTypes[this.type];
        this.name = base.name;
        this.color = base.color;
        this.icon = base.icon;
        this.baseDamage = base.damage;
        this.baseRange = base.range;
        this.baseFireRate = base.fireRate;
        this.cost = base.cost;
        this.totalCost = this.cost;
    }

    applyBonuses() {
        // Recalcula os atributos com base no nível e nos bônus globais
        // Dano
        let upgradeDamage = 1.3, upgradeRange = 1.1, upgradeSpeed = 0.9;
        if (this.type === 'archer' && this.towerTypes.archer) {
            const cfg = this.towerTypes.archer;
            upgradeDamage = 1 + (cfg.upgradeDamage || 30) / 100;
            upgradeRange = 1 + (cfg.upgradeRange || 10) / 100;
            upgradeSpeed = 1 + (cfg.upgradeSpeed || -10) / 100;
        }
        if (this.type === 'cannon' && this.towerTypes.cannon) {
            const cfg = this.towerTypes.cannon;
            upgradeDamage = 1 + (cfg.upgradeDamage || 30) / 100;
            upgradeRange = 1 + (cfg.upgradeRange || 10) / 100;
            upgradeSpeed = 1 + (cfg.upgradeSpeed || -10) / 100;
        }
        if (this.type === 'magic' && this.towerTypes.magic) {
            const cfg = this.towerTypes.magic;
            upgradeDamage = 1 + (cfg.upgradeDamage || 30) / 100;
            upgradeRange = 1 + (cfg.upgradeRange || 10) / 100;
            upgradeSpeed = 1 + (cfg.upgradeSpeed || -10) / 100;
        }
        if (this.type === 'tesla' && this.towerTypes.tesla) {
            const cfg = this.towerTypes.tesla;
            upgradeDamage = 1 + (cfg.upgradeDamage || 30) / 100;
            upgradeRange = 1 + (cfg.upgradeRange || 10) / 100;
            upgradeSpeed = 1 + (cfg.upgradeSpeed || -10) / 100;
        }
        let damage = this.baseDamage * Math.pow(upgradeDamage, this.level - 1);
        let range = this.baseRange * Math.pow(upgradeRange, this.level - 1);
        let fireRate = this.baseFireRate * Math.pow(upgradeSpeed, this.level - 1);
        if (fireRate < 15) fireRate = 15;
        // Bônus globais
        if (this.gameConfig.globalDamageBonus) damage *= this.gameConfig.globalDamageBonus;
        if (this.type === 'archer') {
            if (this.gameConfig.archerDamageBonus) damage *= this.gameConfig.archerDamageBonus;
            if (this.gameConfig.archerSpeedBonus) fireRate /= this.gameConfig.archerSpeedBonus;
        }
        if (this.type === 'cannon') {
            if (this.gameConfig.cannonDamageBonus) damage *= this.gameConfig.cannonDamageBonus;
            if (this.gameConfig.cannonRangeBonus) range *= this.gameConfig.cannonRangeBonus;
        }
        if (this.type === 'magic') {
            if (this.gameConfig.mageDamageBonus) damage *= this.gameConfig.mageDamageBonus;
            this.freezeBonus = this.gameConfig.mageFreezeBonus || 0;
        }
        if (this.type === 'tesla') {
            if (this.gameConfig.teslaDamageBonus) damage *= this.gameConfig.teslaDamageBonus;
            this.chainBonus = this.gameConfig.teslaChainBonus || 0;
        }
        this.damage = Math.floor(damage);
        this.range = Math.floor(range);
        this.fireRate = Math.floor(fireRate);
    }

    update(deltaTime) {
        if (this.gameState.isPaused) return;
        if (this.target && this.gameState.enemies.indexOf(this.target) === -1) {
            this.target = null;
        }
        if (!this.target || !this.isTargetInRange(this.target)) {
            this.target = this.findTarget();
        }
        this.lastShot = (this.lastShot || 0) + deltaTime;
        if (this.target && this.lastShot >= this.fireRate) {
            this.shoot();
            this.lastShot = 0;
        }
    }
    
    findTarget() {
        let closest = null;
        let closestDistance = Infinity;
        for (let enemy of this.gameState.enemies) {
            if (!enemy || this.gameState.enemies.indexOf(enemy) === -1) continue;
            const distance = this.getDistance(enemy);
            if (distance <= this.range && distance < closestDistance) {
                closest = enemy;
                closestDistance = distance;
            }
        }
        return closest;
    }
    
    isTargetInRange(target) {
        return this.getDistance(target) <= this.range;
    }
    
    getDistance(target) {
        const dx = this.x - target.x;
        const dy = this.y - target.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    shoot() {
        if (this.type === 'special') {
            for (let enemy of this.gameState.enemies) {
                enemy.takeDamage(this.damage);
            }
            return;
        }
        if (!this.target || this.gameState.enemies.indexOf(this.target) === -1) {
            this.target = null;
            return;
        }
        if (this.type === 'cannon') {
            // Ataque em área
            let areaRadius = this.gameConfig.gridSize * 1.2;
            let areaDamageMultiplier = 1.0;
            if (this.towerTypes.cannon) {
                areaRadius = this.towerTypes.cannon.areaRadius || areaRadius;
                areaDamageMultiplier = (this.towerTypes.cannon.areaDamageMultiplier || 100) / 100;
            }
            for (let enemy of this.gameState.enemies) {
                if (this.getDistance(enemy) <= areaRadius) {
                    enemy.takeDamage(Math.floor(this.damage * areaDamageMultiplier));
                }
            }
            const projectile = new this.Projectile(
                this.x,
                this.y,
                this.target,
                this.damage,
                this.color,
                this.gameConfig
            );
            this.gameState.projectiles.push(projectile);
        } else if (this.type === 'magic') {
            // Ataque single target com slow
            this.target.takeDamage(this.damage);
            // Aplicar lentidão
            let slowEffect = 0.5; // 50% padrão
            if (this.towerTypes.magic) {
                slowEffect = 1 - ((this.towerTypes.magic.slowEffect || 50) / 100);
            }
            if (!this.target.slowUntil || this.target.slowUntil < Date.now()) {
                this.target.slowUntil = Date.now() + this.freezeBonus * 1000;
                this.target.originalSpeed = this.target.originalSpeed || this.target.speed;
                this.target.speed *= slowEffect;
            } else {
                this.target.slowUntil += this.freezeBonus * 1000;
            }
            const projectile = new this.Projectile(
                this.x,
                this.y,
                this.target,
                this.damage,
                this.color,
                this.gameConfig
            );
            this.gameState.projectiles.push(projectile);
        } else if (this.type === 'tesla') {
            // LOG extra: mostrar o valor de gameConfig.teslaChainBonus
            console.log('[TESLA] gameConfig.teslaChainBonus:', this.gameConfig.teslaChainBonus, '| this.chainBonus:', this.chainBonus);
            // Usar chainRadius configurável
            let chainRadius = this.range * (this.gameConfig.teslaChainRadius || 1.2);
            let maxChain = 1 + (this.chainBonus || 0);
            if (this.towerTypes.tesla && this.towerTypes.tesla.chainMax) {
                maxChain = Math.min(maxChain, this.towerTypes.tesla.chainMax);
            }
            // Ataque em cadeia: até maxChain inimigos diferentes
            let chainTargets = [this.target];
            let used = new Set([this.target]);
            let last = this.target;
            while (chainTargets.length < maxChain) {
                let next = null;
                let minDist = Infinity;
                for (let enemy of this.gameState.enemies) {
                    if (!enemy || used.has(enemy)) continue;
                    const dist = Math.sqrt((enemy.x - last.x) ** 2 + (enemy.y - last.y) ** 2);
                    if (dist <= chainRadius && dist < minDist) {
                        next = enemy;
                        minDist = dist;
                    }
                }
                if (next && !used.has(next)) {
                    chainTargets.push(next);
                    used.add(next);
                    last = next;
                } else {
                    break;
                }
            }
            // LOG para depuração
            console.log('[TESLA] chainBonus:', this.chainBonus, '| maxChain:', maxChain, '| chainTargets:', chainTargets.map(e => e && e.id ? e.id : e));
            // Dano decrescente para a quantidade real de alvos
            const base = this.damage;
            const chainDamages = chainTargets.map((_, idx) => idx === 0 ? base : idx === 1 ? Math.floor(base * 0.7) : Math.floor(base * 0.5));
            chainTargets.forEach((enemy, idx) => {
                enemy.takeDamage(chainDamages[idx]);
            });
            // Efeito visual: projétil azul para cada alvo
            chainTargets.forEach((enemy, idx) => {
                const projColor = idx === 0 ? this.color : '#00cfff';
                const projectile = new this.Projectile(
                    this.x,
                    this.y,
                    enemy,
                    chainDamages[idx],
                    projColor,
                    this.gameConfig
                );
                this.gameState.projectiles.push(projectile);
            });
            return;
        } else {
            // Arqueiro: ataque simples
            const projectile = new this.Projectile(
                this.x,
                this.y,
                this.target,
                this.damage,
                this.color,
                this.gameConfig
            );
            this.gameState.projectiles.push(projectile);
        }
    }
    
    getUpgradeCost() {
        const savedConfig = localStorage.getItem('arqueiroConfig');
        const baseCost = savedConfig ? JSON.parse(savedConfig).upgradeBaseCost || 50 : 50;
        return baseCost * this.level;
    }
    
    upgrade() {
        const upgradeCost = this.getUpgradeCost();
        if (this.gameState.gold >= upgradeCost) {
            this.gameState.gold -= upgradeCost;
            this.level++;
            this.totalCost += upgradeCost;
            const savedConfig = localStorage.getItem('arqueiroConfig');
            const upgradeBonusMultiplier = savedConfig ? JSON.parse(savedConfig).upgradeBonusMultiplier || 25 : 25;
            const upgradeBonus = this.level * upgradeBonusMultiplier;
            this.gameState.score += upgradeBonus;
            this.applyBonuses();
            this.updateUI();
            this.showNotification(`Torre evoluída! +${upgradeBonus} pontos!`, 'success');
            return true;
        }
        return false;
    }
    
    sell() {
        const savedConfig = localStorage.getItem('arqueiroConfig');
        const sellPercentage = savedConfig ? JSON.parse(savedConfig).sellPercentage || 50 : 50;
        const refund = Math.floor(this.totalCost * (sellPercentage / 100));
        this.gameState.gold += refund;
        const index = this.gameState.towers.indexOf(this);
        if (index > -1) {
            this.gameState.towers.splice(index, 1);
        }
        this.updateUI();
        return refund;
    }
    
    draw() {
        this.ctx.fillStyle = this.color;
        this.ctx.fillRect(
            this.x - this.gameConfig.gridSize / 2,
            this.y - this.gameConfig.gridSize / 2,
            this.gameConfig.gridSize,
            this.gameConfig.gridSize
        );
        this.ctx.font = '20px Arial';
        this.ctx.fillStyle = 'white';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(
            this.icon,
            this.x,
            this.y + 5
        );
        if (this.level > 1) {
            this.ctx.font = '12px Arial';
            this.ctx.fillStyle = '#ffd700';
            this.ctx.fillText(
                `Lv.${this.level}`,
                this.x,
                this.y + this.gameConfig.gridSize / 2 - 5
            );
        }
        if (this.isSelected) {
            this.ctx.strokeStyle = this.color;
            this.ctx.lineWidth = 2;
            this.ctx.setLineDash([5, 5]);
            this.ctx.beginPath();
            this.ctx.arc(this.x, this.y, this.range, 0, Math.PI * 2);
            this.ctx.stroke();
            this.ctx.setLineDash([]);
        }
    }
} 