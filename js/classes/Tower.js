let TESLA_ID_COUNTER = 1;

// Classe Torre
export class Tower {
    constructor(x, y, type, towerTypes, gameConfig, gameState, ctx, Projectile, updateUI, showNotification, TeslaChainProjectile, CannonProjectile, imageManager) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.towerTypes = towerTypes;
        this.gameConfig = gameConfig;
        this.gameState = gameState;
        this.ctx = ctx;
        this.Projectile = Projectile;
        this.TeslaChainProjectile = TeslaChainProjectile;
        this.CannonProjectile = CannonProjectile;
        this.updateUI = updateUI;
        this.showNotification = showNotification;
        this.imageManager = imageManager;
        this.level = 1;
        this.isSelected = false;
        this.isHovered = false;
        this.totalCost = 0;
        this.activeProjectiles = [];
        this.lastShot = 0;
        
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
        const towerConfig = this.towerTypes[this.type] || {};
        
        // Calcular multiplicadores de upgrade
        const upgradeDamage = 1 + (towerConfig.upgradeDamage || 30) / 100;
        const upgradeRange = 1 + (towerConfig.upgradeRange || 10) / 100;
        const upgradeSpeed = 1 + (towerConfig.upgradeSpeed || -10) / 100;
        
        // Calcular atributos base com nível
        let damage = this.baseDamage * Math.pow(upgradeDamage, this.level - 1);
        let range = this.baseRange * Math.pow(upgradeRange, this.level - 1);
        let fireRate = this.baseFireRate * Math.pow(upgradeSpeed, this.level - 1);
        
        // Limite mínimo de fire rate
        fireRate = Math.max(fireRate, 15);
        
        // Aplicar bônus globais
        if (this.gameConfig.globalDamageBonus) {
            damage *= this.gameConfig.globalDamageBonus;
        }
        
        // Aplicar bônus específicos por tipo
        this.applyTypeSpecificBonuses(damage, fireRate);
        
        this.damage = Math.floor(damage);
        this.range = Math.floor(range);
        this.fireRate = Math.floor(fireRate);
    }

    applyTypeSpecificBonuses(damage, fireRate) {
        switch (this.type) {
            case 'archer':
                if (this.gameConfig.archerDamageBonus) damage *= this.gameConfig.archerDamageBonus;
                if (this.gameConfig.archerSpeedBonus) fireRate /= this.gameConfig.archerSpeedBonus;
                break;
            case 'cannon':
                if (this.gameConfig.cannonDamageBonus) damage *= this.gameConfig.cannonDamageBonus;
                if (this.gameConfig.cannonAreaBonus) this.areaBonus = this.gameConfig.cannonAreaBonus;
                break;
            case 'magic':
                if (this.gameConfig.mageDamageBonus) damage *= this.gameConfig.mageDamageBonus;
                this.freezeBonus = this.gameConfig.mageFreezeBonus || 1;
                break;
            case 'tesla':
                if (this.gameConfig.teslaDamageBonus) damage *= this.gameConfig.teslaDamageBonus;
                this.chainBonus = this.gameConfig.teslaChainBonus || 0;
                break;
        }
    }

    update(deltaTime) {
        if (this.gameState.isPaused) return;
        
        // Verificar se a torre ainda existe no gameState
        if (this.gameState.towers.indexOf(this) === -1) return;
        
        this.cleanupProjectiles();
        this.updateTarget();
        this.handleShooting(deltaTime);
    }
    
    cleanupProjectiles() {
        this.activeProjectiles = this.activeProjectiles.filter(projectile => 
            this.gameState.projectiles.indexOf(projectile) !== -1 && !projectile.isRemoved
        );
    }
    
    updateTarget() {
        // Limpar alvo se não existe mais
        if (this.target && this.gameState.enemies.indexOf(this.target) === -1) {
            this.target = null;
        }
        
        // Procurar novo alvo se necessário
        if (!this.target || !this.isTargetInRange(this.target)) {
            this.target = this.findTarget();
        }
    }
    
    handleShooting(deltaTime) {
        if (!this.target || this.activeProjectiles.length > 0) return;
        
        this.lastShot += deltaTime;
        if (this.lastShot >= this.fireRate) {
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
            this.shootSpecial();
            return;
        }
        
        if (!this.target || this.gameState.enemies.indexOf(this.target) === -1) {
            this.target = null;
            return;
        }
        
        const projectileCreators = {
            cannon: () => this.createCannonProjectile(),
            magic: () => this.createMagicProjectile(),
            tesla: () => this.createTeslaProjectile(),
            archer: () => this.createArcherProjectile()
        };
        
        const creator = projectileCreators[this.type];
        if (creator) {
            const projectile = creator();
            this.gameState.projectiles.push(projectile);
            this.activeProjectiles.push(projectile);
        }
    }
    
    shootSpecial() {
        for (let enemy of this.gameState.enemies) {
            enemy.takeDamage(this.damage);
        }
    }
    
    createCannonProjectile() {
        let areaRadius = this.gameConfig.gridSize * 1.2;
        let areaDamageMultiplier = 1.0;
        
        if (this.towerTypes.cannon) {
            areaRadius = this.towerTypes.cannon.areaRadius || areaRadius;
            areaDamageMultiplier = (this.towerTypes.cannon.areaDamageMultiplier || 100) / 100;
        }
        
        if (this.areaBonus) {
            areaRadius *= this.areaBonus;
        }
        
        return new this.CannonProjectile(
            this.x, this.y, this.target, this.damage, this.color,
            this.gameConfig, this.gameState, areaRadius, areaDamageMultiplier
        );
    }
    
    createMagicProjectile() {
        return new this.Projectile(
            this.x, this.y, this.target, this.damage, this.color,
            this.gameConfig, this
        );
    }
    
    createTeslaProjectile() {
        const chainRadius = this.range * (this.towerTypes.tesla?.chainRadius || this.gameConfig.teslaChainRadius || 1.2);
        let maxChain = 2 + (this.chainBonus || 0);
        
        if (this.towerTypes.tesla?.chainMax) {
            maxChain = Math.min(maxChain, this.towerTypes.tesla.chainMax);
        }
        
        const chainTargets = this.findChainTargets(chainRadius, maxChain);
        
        return new this.TeslaChainProjectile(
            this.x, this.y, chainTargets, this.damage, this.color,
            this.gameConfig, this.gameState
        );
    }
    
    createArcherProjectile() {
        return new this.Projectile(
            this.x, this.y, this.target, this.damage, this.color, this.gameConfig
        );
    }
    
    findChainTargets(chainRadius, maxChain) {
        const chainTargets = [this.target];
        const used = new Set([this.target]);
        let last = this.target;
        
        while (chainTargets.length < maxChain) {
            const next = this.findNextChainTarget(last, chainRadius, used);
            if (next) {
                chainTargets.push(next);
                used.add(next);
                last = next;
            } else {
                break;
            }
        }
        
        return chainTargets;
    }
    
    findNextChainTarget(last, chainRadius, used) {
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
        
        return next;
    }
    
    getUpgradeCost() {
        if (this.level >= this.getMaxLevel()) {
            return Infinity;
        }
        
        const savedConfig = this.getSavedConfig();
        const upgradePercentage = savedConfig.upgradePercentage || 50;
        const baseCost = this.cost;
        
        return Math.floor(baseCost * (upgradePercentage / 100) * this.level);
    }
    
    getMaxLevel() {
        const towerConfig = this.towerTypes[this.type];
        return towerConfig?.maxLevel || this.gameConfig?.towerMaxLevel || 5;
    }
    
    upgrade() {
        if (this.level >= this.getMaxLevel()) {
            this.showNotification(`Torre já está no nível máximo (${this.getMaxLevel()})!`, 'warning');
            return false;
        }
        
        const upgradeCost = this.getUpgradeCost();
        if (this.gameState.gold >= upgradeCost) {
            this.gameState.gold -= upgradeCost;
            this.level++;
            this.totalCost += upgradeCost;
            
            const savedConfig = this.getSavedConfig();
            const upgradeBonusMultiplier = savedConfig.upgradeBonusMultiplier || 25;
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
        const savedConfig = this.getSavedConfig();
        const sellPercentage = savedConfig.sellPercentage || 50;
        const refund = Math.floor(this.totalCost * (sellPercentage / 100));
        
        this.gameState.gold += refund;
        this.removeFromGameState();
        this.updateUI();
        
        return refund;
    }
    
    removeFromGameState() {
        const index = this.gameState.towers.indexOf(this);
        if (index > -1) {
            this.gameState.towers.splice(index, 1);
        }
        
        this.target = null;
        this.activeProjectiles = [];
        this.isSelected = false;
        
        this.removeProjectiles();
    }
    
    removeProjectiles() {
        if (!this.gameState.projectiles) return;
        
        this.gameState.projectiles = this.gameState.projectiles.filter(projectile => {
            return !(projectile.towerId === this.teslaId || 
                    (projectile.x === this.x && projectile.y === this.y && projectile.towerType === this.type));
        });
    }
    
    getSavedConfig() {
        const savedConfig = localStorage.getItem('arqueiroConfig');
        return savedConfig ? JSON.parse(savedConfig) : {};
    }
    
    createSlowEffect() {
        if (!this.target || !this.target.x || !this.target.y) return;
        
        const slowEffect = {
            x: this.target.x,
            y: this.target.y,
            startTime: Date.now(),
            duration: 500,
            alpha: 0.8
        };
        
        if (!this.gameState.visualEffects) {
            this.gameState.visualEffects = [];
        }
        
        this.gameState.visualEffects.push(slowEffect);
        
        setTimeout(() => {
            const index = this.gameState.visualEffects.indexOf(slowEffect);
            if (index > -1) {
                this.gameState.visualEffects.splice(index, 1);
            }
        }, slowEffect.duration);
    }

    draw() {
        this.drawTowerImage();
        this.drawLevelIndicator();
        this.drawRangeIndicator();
    }
    
    drawTowerImage() {
        const imageKey = this.type;
        const image = this.imageManager?.getImage?.(imageKey);
        
        if (image) {
            this.ctx.drawImage(
                image,
                this.x - this.gameConfig.gridSize / 2,
                this.y - this.gameConfig.gridSize / 2,
                this.gameConfig.gridSize,
                this.gameConfig.gridSize
            );
        } else {
            this.drawFallbackTower();
        }
    }
    
    drawFallbackTower() {
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
        this.ctx.fillText(this.icon, this.x, this.y + 5);
    }
    
    drawLevelIndicator() {
        if (this.level > 1) {
            this.ctx.font = '12px Arial';
            this.ctx.fillStyle = '#ffd700';
            this.ctx.fillText(
                `Lv.${this.level}`,
                this.x,
                this.y + this.gameConfig.gridSize / 2 - 5
            );
        }
    }
    
    drawRangeIndicator() {
        if (!this.isSelected && !this.isHovered) return;
        
        this.drawTowerRange();
        
        if (this.type === 'cannon') {
            this.drawCannonAreaEffect();
        }
    }
    
    drawTowerRange() {
        this.ctx.strokeStyle = this.color;
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.range, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
    }
    
    drawCannonAreaEffect() {
        let areaRadius = this.gameConfig.gridSize * 1.2;
        
        if (this.towerTypes.cannon) {
            areaRadius = this.towerTypes.cannon.areaRadius || areaRadius;
        }
        
        if (this.areaBonus) {
            areaRadius *= this.areaBonus;
        }
        
        this.ctx.fillStyle = 'rgba(255, 100, 0, 0.2)';
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, areaRadius, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.strokeStyle = '#ff6600';
        this.ctx.lineWidth = 3;
        this.ctx.setLineDash([]);
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, areaRadius, 0, Math.PI * 2);
        this.ctx.stroke();
        
        this.ctx.font = '14px Arial';
        this.ctx.fillStyle = '#ff6600';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Área de Efeito', this.x, this.y - areaRadius - 10);
    }
} 