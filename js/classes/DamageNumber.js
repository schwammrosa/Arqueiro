// Classe para números de dano
export class DamageNumber {
    constructor(x, y, damage, color = '#ff0000') {
        this.x = x;
        this.y = y;
        this.damage = damage;
        this.color = color;
        
        // Carregar configurações dos números de dano
        const savedConfig = localStorage.getItem('arqueiroConfig');
        const lifetime = savedConfig ? JSON.parse(savedConfig).damageNumberLifetime || 60 : 60;
        const speed = savedConfig ? JSON.parse(savedConfig).damageNumberSpeed || 1 : 1;
        
        this.life = lifetime; // Frames de vida
        this.maxLife = lifetime;
        this.velocityY = -speed; // Movimento para cima
        this.velocityX = (Math.random() - 0.5) * 2 * speed; // Movimento lateral aleatório
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
        if (this.life <= 0) return;

        const alpha = this.life / this.maxLife;
        const fontSize = 16 + (this.maxLife - this.life) * 0.5; // Aumentar tamanho gradualmente

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.font = `bold ${fontSize}px Arial`;
        ctx.fillStyle = this.color;
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.textAlign = 'center';
        
        // Desenhar contorno
        ctx.strokeText(`-${this.damage}`, this.x, this.y);
        // Desenhar texto
        ctx.fillText(`-${this.damage}`, this.x, this.y);
        
        ctx.restore();
    }

    isDead() {
        return this.life <= 0;
    }
} 