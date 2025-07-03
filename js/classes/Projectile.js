// Classe Projétil
export class Projectile {
    constructor(x, y, target, damage, color, GAME_CONFIG) {
        this.x = x;
        this.y = y;
        this.target = target;
        this.damage = damage;
        this.color = color;
        this.speed = GAME_CONFIG.projectileSpeed;
        this.size = GAME_CONFIG.projectileSize;
        this.isRemoved = false;
    }

    update(deltaTime) {
        if (this.isRemoved || !this.target) return;

        // Calcular direção para o alvo
        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 10) {
            // Projétil atingiu o alvo
            this.target.takeDamage(this.damage);
            this.remove();
            return;
        }

        // Mover projétil
        const moveSpeed = this.speed * (deltaTime / 16.67); // Normalizar para 60fps
        this.x += (dx / distance) * moveSpeed;
        this.y += (dy / distance) * moveSpeed;
    }

    remove() {
        this.isRemoved = true;
    }

    draw(ctx) {
        if (this.isRemoved) return;

        ctx.save();
        ctx.fillStyle = this.color;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        
        // Desenhar projétil
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        ctx.restore();
    }
} 