// Classe Projétil
export class Projectile {
    constructor(x, y, target, damage, color, GAME_CONFIG, tower = null) {
        this.x = x;
        this.y = y;
        this.target = target;
        this.damage = damage;
        this.color = color;
        this.speed = GAME_CONFIG.projectileSpeed;
        this.size = GAME_CONFIG.projectileSize;
        this.isRemoved = false;
        this.tower = tower; // Referência para a torre (usado para slow da torre mágica)
    }

    update(deltaTime) {
        if (this.isRemoved || !this.target || this.target.isRemoved) return;

        // Calcular direção para o alvo
        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 10) {
            // Projétil atingiu o alvo
            if (!this.target.isRemoved) {
                this.target.takeDamage(this.damage);
                
                // Aplicar slow se for projétil da torre mágica
                if (this.tower && this.tower.type === 'magic') {
                    this.applySlowEffect();
                }
            }
            
            this.remove();
            return;
        }

        // Mover projétil
        const moveSpeed = this.speed * (deltaTime / 16.67); // Normalizar para 60fps
        this.x += (dx / distance) * moveSpeed;
        this.y += (dy / distance) * moveSpeed;
    }

    applySlowEffect() {
        if (!this.tower || this.tower.type !== 'magic') return;
        if (!this.target || this.target.isRemoved) return;
        
        // Aplicar lentidão
        let slowEffect = 0.4; // 40% padrão (60% de redução)
        if (this.tower.towerTypes && this.tower.towerTypes.magic) {
            slowEffect = (this.tower.towerTypes.magic.slowEffect || 40) / 100;
        }
        
        if (!this.target.slowUntil || this.target.slowUntil < Date.now()) {
            this.target.slowUntil = Date.now() + this.tower.freezeBonus * 1000;
            this.target.originalSpeed = this.target.originalSpeed || this.target.speed;
            this.target.speed *= slowEffect;
            
            // Efeito visual de slow aplicado
            if (this.tower.createSlowEffect) {
                this.tower.createSlowEffect();
            }
        } else {
            this.target.slowUntil += this.tower.freezeBonus * 1000;
            
            // Efeito visual de slow renovado
            if (this.tower.createSlowEffect) {
                this.tower.createSlowEffect();
            }
        }
    }

    remove() {
        this.isRemoved = true;
    }

    draw(ctx) {
        if (this.isRemoved) return;

        ctx.save();
        
        // Efeito especial para projéteis mágicos (azul ciano)
        if (this.color === '#36b9cc') {
            // Efeito de brilho mágico
            ctx.shadowColor = '#36b9cc';
            ctx.shadowBlur = 10;
            
            // Projétil principal com brilho
            ctx.fillStyle = this.color;
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            
            // Tamanho pulsante para efeito mágico
            const pulseSize = this.size + Math.sin(Date.now() * 0.01) * 1;
            
            ctx.beginPath();
            ctx.arc(this.x, this.y, pulseSize, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            
            // Resetar sombra
            ctx.shadowBlur = 0;
        } else {
            // Projétil normal
            ctx.fillStyle = this.color;
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        }
        
        ctx.restore();
    }
}

// Classe Projétil Tesla com Ricochete
export class TeslaChainProjectile {
    constructor(x, y, targets, baseDamage, color, GAME_CONFIG, gameState) {
        this.x = x;
        this.y = y;
        this.targets = targets; // Array de alvos
        this.currentTargetIndex = 0;
        this.target = targets[0]; // Alvo atual
        this.baseDamage = baseDamage;
        this.color = color;
        this.speed = GAME_CONFIG.projectileSpeed * 1.2; // Tesla é mais rápida
        this.size = GAME_CONFIG.projectileSize * 1.5; // Tesla é maior
        this.isRemoved = false;
        this.gameState = gameState;
        this.chainDelay = 100; // Delay entre ricochetes (ms)
        this.lastChainTime = 0;
        this.electricTrail = []; // Rastro elétrico
    }

    update(deltaTime) {
        if (this.isRemoved) return;

        // Adicionar posição atual ao rastro
        this.electricTrail.push({ x: this.x, y: this.y, time: Date.now() });
        // Manter apenas os últimos 10 pontos do rastro
        if (this.electricTrail.length > 10) {
            this.electricTrail.shift();
        }

        // Verificar se o alvo atual ainda existe
        if (!this.target || this.gameState.enemies.indexOf(this.target) === -1) {
            this.moveToNextTarget();
            return;
        }

        // Calcular direção para o alvo atual
        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 15) {
            // Projétil atingiu o alvo
            this.hitTarget();
            return;
        }

        // Mover projétil
        const moveSpeed = this.speed * (deltaTime / 16.67);
        this.x += (dx / distance) * moveSpeed;
        this.y += (dy / distance) * moveSpeed;
    }

    hitTarget() {
        // Calcular dano baseado na posição na cadeia
        const damageMultiplier = this.currentTargetIndex === 0 ? 1.0 : 
                                this.currentTargetIndex === 1 ? 0.7 : 0.5;
        const damage = Math.floor(this.baseDamage * damageMultiplier);
        
        // Causar dano
        this.target.takeDamage(damage);
        
        // Efeito visual de choque elétrico
        this.createElectricEffect();
        
        // Mover para o próximo alvo ou remover
        this.moveToNextTarget();
    }

    moveToNextTarget() {
        this.currentTargetIndex++;
        
        if (this.currentTargetIndex < this.targets.length) {
            // Mover para o próximo alvo
            this.target = this.targets[this.currentTargetIndex];
            // Verificar se o alvo ainda existe
            if (!this.target || this.gameState.enemies.indexOf(this.target) === -1) {
                this.moveToNextTarget(); // Tentar o próximo
                return;
            }
            // Delay antes de começar a mover para o próximo alvo
            this.lastChainTime = Date.now();
        } else {
            // Fim da cadeia
            this.remove();
        }
    }

    createElectricEffect() {
        // Criar efeito visual de choque elétrico no alvo
        const effect = {
            x: this.target.x,
            y: this.target.y,
            time: Date.now(),
            duration: 300,
            type: 'electric'
        };
        
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

    remove() {
        this.isRemoved = true;
    }

    draw(ctx) {
        if (this.isRemoved) return;

        ctx.save();
        
        // Desenhar rastro elétrico
        if (this.electricTrail.length > 1) {
            ctx.strokeStyle = '#00cfff';
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
        
        // Desenhar projétil principal
        ctx.fillStyle = this.color;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.globalAlpha = 1;
        
        // Efeito de brilho elétrico
        const glowSize = this.size + Math.sin(Date.now() * 0.01) * 2;
        ctx.shadowColor = '#00cfff';
        ctx.shadowBlur = 10;
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, glowSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Resetar sombra
        ctx.shadowBlur = 0;
        
        ctx.restore();
    }
}

// Classe Projétil do Canhão com Dano em Área
export class CannonProjectile {
    constructor(x, y, target, damage, color, GAME_CONFIG, gameState, areaRadius, areaDamageMultiplier) {
        this.x = x;
        this.y = y;
        this.target = target;
        this.damage = damage;
        this.color = color;
        this.speed = GAME_CONFIG.projectileSpeed * 0.8; // Canhão é mais lento
        this.size = GAME_CONFIG.projectileSize * 2; // Canhão é maior
        this.isRemoved = false;
        this.gameState = gameState;
        this.areaRadius = areaRadius;
        this.areaDamageMultiplier = areaDamageMultiplier;
        
        // Debug: mostrar informações do projétil
        console.log(`CannonProjectile criado: área=${this.areaRadius.toFixed(1)}px, dano=${this.damage}`);
    }

    update(deltaTime) {
        if (this.isRemoved || !this.target) return;

        // Verificar se o alvo ainda existe
        if (!this.target || this.gameState.enemies.indexOf(this.target) === -1) {
            // Alvo foi removido, explodir na posição atual
            console.log('Alvo removido, explodindo na posição atual');
            this.explode();
            return;
        }

        // Calcular direção para o alvo
        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 15) {
            // Projétil atingiu o alvo - causar dano em área
            console.log(`Projétil do canhão atingiu alvo a ${distance.toFixed(1)}px de distância`);
            this.explode();
            return;
        }

        // Mover projétil
        const moveSpeed = this.speed * (deltaTime / 16.67);
        this.x += (dx / distance) * moveSpeed;
        this.y += (dy / distance) * moveSpeed;
    }

    explode() {
        // Causar dano em área ao redor do ponto de impacto
        let hitCount = 0;
        const enemiesHit = [];
        
        // Criar uma cópia do array para evitar problemas de modificação durante iteração
        const enemies = [...this.gameState.enemies];
        
        console.log(`Explosão iniciada em (${this.x.toFixed(1)}, ${this.y.toFixed(1)}) com área de ${this.areaRadius.toFixed(1)}px`);
        console.log(`Total de inimigos no jogo: ${enemies.length}`);
        
        for (let enemy of enemies) {
            // Verificar se o inimigo ainda existe e está vivo
            if (!enemy || !enemy.health || enemy.health <= 0 || enemy.isRemoved) {
                console.log('Inimigo ignorado: morto ou removido');
                continue;
            }
            
            const dx = enemy.x - this.x;
            const dy = enemy.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            console.log(`Inimigo em (${enemy.x.toFixed(1)}, ${enemy.y.toFixed(1)}) - distância: ${distance.toFixed(1)}px`);
            
            if (distance <= this.areaRadius) {
                const damage = Math.floor(this.damage * this.areaDamageMultiplier);
                enemy.takeDamage(damage);
                hitCount++;
                enemiesHit.push({
                    enemy: enemy,
                    distance: distance,
                    damage: damage
                });
                
                // Debug: mostrar informações da explosão
                console.log(`✅ Explosão atingiu inimigo a ${distance.toFixed(1)}px de distância. Dano: ${damage}`);
            } else {
                console.log(`❌ Inimigo fora da área (${distance.toFixed(1)}px > ${this.areaRadius.toFixed(1)}px)`);
            }
        }
        
        console.log(`🎯 Explosão do canhão atingiu ${hitCount} inimigos em uma área de ${this.areaRadius.toFixed(1)}px`);
        
        // Criar efeito visual de explosão
        this.createExplosionEffect();
        
        this.remove();
    }

    createExplosionEffect() {
        const explosion = {
            x: this.x,
            y: this.y,
            radius: this.areaRadius,
            startTime: Date.now(),
            duration: 300,
            alpha: 0.8
        };
        
        if (!this.gameState.visualEffects) {
            this.gameState.visualEffects = [];
        }
        this.gameState.visualEffects.push(explosion);
        
        setTimeout(() => {
            const index = this.gameState.visualEffects.indexOf(explosion);
            if (index > -1) {
                this.gameState.visualEffects.splice(index, 1);
            }
        }, explosion.duration);
    }

    remove() {
        this.isRemoved = true;
    }

    draw(ctx) {
        if (this.isRemoved) return;

        ctx.save();
        
        // Efeito de brilho do projétil
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 8;
        
        // Projétil principal
        ctx.fillStyle = this.color;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Resetar sombra
        ctx.shadowBlur = 0;
        
        // Debug: mostrar área de explosão (opcional - remover depois)
        if (window.debugMode) {
            ctx.strokeStyle = 'rgba(255, 100, 0, 0.5)';
            ctx.lineWidth = 1;
            ctx.setLineDash([3, 3]);
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.areaRadius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
        }
        
        ctx.restore();
    }
} 