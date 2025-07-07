// Classe para números de dano
import { loadGameConfig } from '../config/gameConfig.js';

export class DamageNumber {
    constructor(x, y, damage, color = '#ff0000') {
        this.x = x;
        this.y = y;
        this.damage = damage;
        this.color = color;
        
        // Carregar configurações usando o sistema centralizado
        const config = loadGameConfig();
        const lifetime = config.damageNumberLifetime || 60;
        const speed = config.damageNumberSpeed || 1;
        
        this.life = lifetime;
        this.maxLife = lifetime;
        this.velocityY = -speed;
        this.velocityX = (Math.random() - 0.5) * 2 * speed;
    }

    update(deltaTime, gameState) {
        if (gameState.isPaused) return;

        this.life--;
        this.y += this.velocityY;
        this.x += this.velocityX;
        
        // Desacelerar movimento
        this.velocityY *= 0.98;
        this.velocityX *= 0.98;
    }

    draw(ctx) {
        if (this.isDead()) return;

        const alpha = this.life / this.maxLife;
        const fontSize = 16 + (this.maxLife - this.life) * 0.5;

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.font = `bold ${fontSize}px Arial`;
        ctx.fillStyle = this.color;
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.textAlign = 'center';
        
        const damageText = `-${this.damage}`;
        ctx.strokeText(damageText, this.x, this.y);
        ctx.fillText(damageText, this.x, this.y);
        
        ctx.restore();
    }

    isDead() {
        return this.life <= 0;
    }
} 