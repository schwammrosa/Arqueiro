// Sistema principal do jogo
export class GameSystem {
    constructor(gameState, GAME_CONFIG, enemyPath, Enemy, chooseEnemyType, calculateEnemyStats, DamageNumber, uiSystem, renderSystem) {
        this.gameState = gameState;
        this.GAME_CONFIG = GAME_CONFIG;
        this.enemyPath = enemyPath;
        this.Enemy = Enemy;
        this.chooseEnemyType = chooseEnemyType;
        this.calculateEnemyStats = calculateEnemyStats;
        this.DamageNumber = DamageNumber;
        this.uiSystem = uiSystem;
        this.renderSystem = renderSystem;
        this.lastTime = 0;
        this.isRunning = false;
        this.lastPassiveHeal = 0;
    }

    // Inicializar primeira onda
    initializeFirstWave() {
        const savedConfig = localStorage.getItem('arqueiroConfig');
        const waveDelaySeconds = savedConfig ? JSON.parse(savedConfig).waveDelaySeconds || 5 : 5;
        this.gameState.nextWaveTimer = waveDelaySeconds;
        
        // NÃO resetar wave para 0 se estiver no modo continuar
        // Só resetar se for uma nova partida (wave = 0)
        if (this.gameState.wave === 0) {
            this.gameState.wave = 0;
        }
        
        this.gameState.waveInProgress = false;
        this.gameState.allEnemiesSpawned = false;
    }

    // Spawn de onda
    spawnWave() {
        this.gameState.wave++;
        this.gameState.allEnemiesSpawned = false; // Reset no início de cada onda
        
        // Rastrear início da onda para bônus de performance
        this.gameState.waveStartTime = this.gameState.gameTime;
        this.gameState.waveStartHealth = this.gameState.health;

        // Carregar configurações das ondas
        const savedConfig = localStorage.getItem('arqueiroConfig');
        let waveConfig = {
            baseEnemies: 5,
            enemiesIncrease: 2
        };
        if (savedConfig) {
            try {
                const config = JSON.parse(savedConfig);
                waveConfig = {
                    baseEnemies: config.enemiesPerWave || 5,
                    enemiesIncrease: config.enemiesIncrease || 2
                };
            } catch (e) {
                console.error('Erro ao carregar configurações das ondas:', e);
            }
        }
        const enemyCount = waveConfig.baseEnemies + (this.gameState.wave - 1) * waveConfig.enemiesIncrease;
        this.gameState.monstersThisWave = enemyCount;
        this.gameState.monstersDefeated = 0;
        let spawned = 0;
        
        // Usar spawn rate configurável
        const spawnInterval = setInterval(() => {
            if (spawned >= enemyCount) {
                clearInterval(spawnInterval);
                // Marcar que todos os inimigos foram spawnados (mas ainda não derrotados)
                this.gameState.allEnemiesSpawned = true;
                this.uiSystem.updateUI();
                return;
            }
            this.gameState.enemies.push(new this.Enemy(null, this.gameState, this.GAME_CONFIG, this.enemyPath, this.chooseEnemyType, this.calculateEnemyStats, this.DamageNumber, this.uiSystem.showNotification.bind(this.uiSystem)));
            spawned++;
        }, this.GAME_CONFIG.enemySpawnRate);
        this.uiSystem.updateUI();
    }

    // Game over - apenas por derrota (jogo infinito)
    gameOver() {
        this.gameState.isGameOver = true;
        // Calcular ondas sobrevividas
        const wavesSurvived = this.gameState.wave - 1;
        document.getElementById('final-wave').textContent = wavesSurvived;
        
        // Adicionar tempo final e pontuação
        const minutes = Math.floor(this.gameState.gameTime / 60);
        const seconds = Math.floor(this.gameState.gameTime % 60);
        const finalTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // Atualizar o conteúdo do game over
        const gameOverContent = document.querySelector('.game-over-content p');
        gameOverContent.innerHTML = `
            Você sobreviveu a <span id="final-wave">${wavesSurvived}</span> ondas!<br>
            Tempo: ${finalTime}<br>
            Pontuação: ${this.gameState.score}
        `;
        document.getElementById('gameOver').style.display = 'flex';
        
        // Recompensa por sobrevivência (sempre dar pontos)
        const UPGRADE_POINTS_KEY = 'arqueiroUpgradePoints';
        let points = Math.max(1, Math.floor(wavesSurvived / 10)); // 1 ponto a cada 10 ondas
        let current = parseInt(localStorage.getItem(UPGRADE_POINTS_KEY) || '0');
        localStorage.setItem(UPGRADE_POINTS_KEY, current + points);
        
        // Exibir mensagem de recompensa
        setTimeout(() => {
            if (document.getElementById('gameOver')) {
                const msg = document.createElement('div');
                msg.style = 'margin-top:18px;font-size:1.2em;color:#ff9800;font-weight:bold;';
                msg.innerHTML = `Você ganhou <b>+${points} ponto${points>1?'s':''} de upgrade</b> pela sobrevivência!`;
                document.querySelector('.game-over-content').appendChild(msg);
            }
        }, 300);
    }

    // Restart do jogo
    restart(getInitialGameState, initializeFirstWave) {
        this.gameState = getInitialGameState();
        
        // ATUALIZAR VARIÁVEL GLOBAL gameState
        if (typeof gameState !== 'undefined') {
            gameState = this.gameState;
        }
        
        if (this.uiSystem && typeof this.uiSystem.setGameState === 'function') {
            this.uiSystem.setGameState(this.gameState);
        }
        
        // Atualizar referência no renderSystem
        if (this.renderSystem) {
            this.renderSystem.gameState = this.gameState;
        }
        
        document.getElementById('gameOver').style.display = 'none';
        this.uiSystem.updateUI();
        
        initializeFirstWave();
        
        this.lastTime = performance.now();
        this.startGameLoop();
        
        // Resetar variáveis globais e tooltips
        if (window.setArrowRainSelecting) window.setArrowRainSelecting(false);
        if (window.setArrowRainPreview) window.setArrowRainPreview(null);
        if (typeof hideInfoTooltip === 'function') hideInfoTooltip();
        
        // Garantir que as torres estejam funcionando
        this.reinitializeTowers();
        
        // Resetar outros cooldowns/habilidades especiais aqui se necessário
        this.uiSystem.updateUI();
    }

    // Limpar referências órfãs
    cleanupOrphanedReferences() {
        // Limpar alvos de torres que não existem mais
        this.gameState.towers.forEach(tower => {
            if (tower.target && this.gameState.enemies.indexOf(tower.target) === -1) {
                tower.target = null;
            }
        });
        
        // Remover projéteis com alvos inválidos
        this.gameState.projectiles = this.gameState.projectiles.filter(projectile => {
            if (!projectile.target || this.gameState.enemies.indexOf(projectile.target) === -1) {
                return false;
            }
            return true;
        });
    }

    // Calcular bônus por performance
    calculatePerformanceBonus(baseBonus) {
        if (!this.gameState.waveStartTime || !this.gameState.waveStartHealth) {
            return 0;
        }
        
        const waveTime = this.gameState.gameTime - this.gameState.waveStartTime;
        const healthLost = this.gameState.waveStartHealth - this.gameState.health;
        const maxHealth = this.GAME_CONFIG.initialHealth;
        
        // Bônus por velocidade (tempo ideal: 30 segundos)
        const idealTime = 30; // segundos
        const speedMultiplier = Math.max(0, (idealTime - waveTime) / idealTime);
        const speedBonus = Math.floor(baseBonus * 0.3 * speedMultiplier);
        
        // Bônus por preservação de vida (0 dano = 50% bônus extra)
        const healthRatio = Math.max(0, 1 - (healthLost / maxHealth));
        const healthBonus = Math.floor(baseBonus * 0.5 * healthRatio);
        
        // Bônus por perfeição (sem dano E rápido)
        const perfectionBonus = (healthLost === 0 && waveTime < idealTime) ? 
            Math.floor(baseBonus * 0.2) : 0;
        
        return speedBonus + healthBonus + perfectionBonus;
    }

    // Verificar multiplicadores por conquistas
    checkAchievementMultipliers() {
        let multiplier = 1.0;
        
        // Inicializar rastreamento de conquistas se não existir
        if (!this.gameState.achievements) {
            this.gameState.achievements = {
                firstEliteKilled: false,
                perfectWaves: 0,
                consecutivePerfectWaves: 0,
                towersBuilt: 0,
                elitesKilled: 0
            };
        }
        
        // Conquista: Sobrevivência a ondas específicas
        if (this.gameState.wave >= 25) {
            multiplier += 0.5; // +50% para onda 25+
        }
        if (this.gameState.wave >= 50) {
            multiplier += 0.5; // +50% adicional para onda 50+
        }
        if (this.gameState.wave >= 100) {
            multiplier += 1.0; // +100% adicional para onda 100+
        }
        
        // Conquista: Ondas consecutivas sem dano
        if (this.gameState.waveStartHealth === this.gameState.health) {
            this.gameState.achievements.consecutivePerfectWaves++;
            if (this.gameState.achievements.consecutivePerfectWaves >= 3) {
                multiplier += 0.3; // +30% para 3+ ondas consecutivas sem dano
            }
            if (this.gameState.achievements.consecutivePerfectWaves >= 5) {
                multiplier += 0.2; // +20% adicional para 5+ ondas consecutivas
            }
        } else {
            this.gameState.achievements.consecutivePerfectWaves = 0;
        }
        
        // Conquista: Eficiência de torres (poucas torres, alta pontuação)
        const towersCount = this.gameState.towers.length;
        if (towersCount <= 3 && this.gameState.wave >= 10) {
            multiplier += 0.4; // +40% para minimalista (≤3 torres onda 10+)
        }
        if (towersCount <= 5 && this.gameState.wave >= 20) {
            multiplier += 0.2; // +20% para eficiência moderada
        }
        
        // Conquista: Especialista em Elites
        if (this.gameState.achievements.elitesKilled >= 5) {
            multiplier += 0.25; // +25% para 5+ elites mortos
        }
        if (this.gameState.achievements.elitesKilled >= 10) {
            multiplier += 0.25; // +25% adicional para 10+ elites mortos
        }
        
        return multiplier;
    }

    // Game loop principal
    gameLoop(currentTime) {
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        if (!this.gameState.isPaused && !this.gameState.isGameOver) {
            this.gameState.gameTime += deltaTime / 1000;
            if (this.gameState.nextWaveTimer > 0) {
                this.gameState.nextWaveTimer -= deltaTime / 1000;
                // SÓ iniciar onda automaticamente se não há inimigos vivos E timer acabou
                if (this.gameState.nextWaveTimer <= 0 && !this.gameState.waveInProgress && this.gameState.enemies.length === 0) {
                    this.gameState.nextWaveTimer = 0;
                    this.gameState.waveInProgress = true;
                    this.spawnWave();
                    this.uiSystem.showNotification(`Onda ${this.gameState.wave} iniciada!`, 'info');
                }
            }

            if (this.GAME_CONFIG.passiveHeal && !this.gameState.isGameOver) {
                if (!this.lastPassiveHeal) this.lastPassiveHeal = this.gameState.gameTime;
                const interval = 20; // segundos
                const healAmount = this.GAME_CONFIG.passiveHeal;
                if (this.gameState.gameTime - this.lastPassiveHeal >= interval) {
                    this.gameState.health = Math.min(this.gameState.health + healAmount, this.GAME_CONFIG.initialHealth);
                    this.lastPassiveHeal = this.gameState.gameTime;
                    this.uiSystem.showNotification(`Cura passiva: +${healAmount} vida!`, 'info');
                    this.uiSystem.updateUI();
                }
            }
        }

        // Renderização
        this.renderSystem.ctx.clearRect(0, 0, this.GAME_CONFIG.canvasWidth, this.GAME_CONFIG.canvasHeight);
        this.renderSystem.drawGrid();
        this.renderSystem.drawPath();
        
        // Atualizar e desenhar entidades
        this.gameState.towers.forEach(tower => {
            tower.update(deltaTime);
            tower.draw();
        });
        this.gameState.enemies.forEach(enemy => {
            enemy.update(deltaTime);
            enemy.draw(this.renderSystem.ctx);
        });
        this.gameState.projectiles.forEach(projectile => {
            projectile.update(deltaTime);
            projectile.draw(this.renderSystem.ctx);
        });
        this.gameState.damageNumbers = this.gameState.damageNumbers.filter(damageNumber => {
            damageNumber.update(deltaTime, this.gameState);
            damageNumber.draw(this.renderSystem.ctx);
            return !damageNumber.isDead();
        });

        // Verificar fim da onda - SÓ quando todos os inimigos foram spawnados E derrotados
        if (this.gameState.waveInProgress && this.gameState.allEnemiesSpawned && this.gameState.enemies.length === 0) {
            // JOGO INFINITO - Removida verificação de vitória por limite de ondas
            const savedConfig = localStorage.getItem('arqueiroConfig');
            const waveBonusMultiplier = savedConfig ? JSON.parse(savedConfig).waveBonusMultiplier || 50 : 50;
            
            // Bônus exponencial: Base * (1 + 0.1)^onda - progride mais rápido
            const exponentialBonus = Math.floor(waveBonusMultiplier * Math.pow(1.1, this.gameState.wave));
            
            // Bônus adicional para ondas de marco (10, 20, 30, etc.)
            const milestoneBonus = (this.gameState.wave + 1) % 10 === 0 ? 
                Math.floor(exponentialBonus * 0.5) : 0;
            
            // Bônus por performance
            const performanceBonus = this.calculatePerformanceBonus(exponentialBonus);
            
            // Multiplicador por conquistas
            const achievementMultiplier = this.checkAchievementMultipliers();
            
            const waveBonus = Math.floor((exponentialBonus + milestoneBonus + performanceBonus) * achievementMultiplier);
            this.gameState.score += waveBonus;
            
            let message = `Onda ${this.gameState.wave + 1} completada! +${waveBonus} pontos!`;
            if (milestoneBonus > 0) {
                message += ` (Marco: +${milestoneBonus})`;
            }
            if (performanceBonus > 0) {
                message += ` (Performance: +${performanceBonus})`;
            }
            if (achievementMultiplier > 1) {
                message += ` (Conquista: x${achievementMultiplier.toFixed(1)})`;
            }
            
            this.uiSystem.showNotification(message, 'success');
            this.gameState.waveInProgress = false;
            this.gameState.allEnemiesSpawned = false; // Reset para próxima onda
            const waveDelaySeconds = savedConfig ? JSON.parse(savedConfig).waveDelaySeconds || 5 : 5;
            this.gameState.nextWaveTimer = waveDelaySeconds;
            this.uiSystem.updateUI();
        }

        if (this.gameState.health <= 0 && !this.gameState.isGameOver) {
            this.gameOver();
        }

        this.cleanupOrphanedReferences();
        this.uiSystem.updateUI();
        
        // Desenhar efeitos visuais
        this.renderSystem.drawVisualEffects(this.gameState);
        
        // Desenhar preview da Chuva de Flechas, se necessário
        if (window.arrowRainSelecting && window.arrowRainPreview) {
            this.renderSystem.drawArrowRainPreview(
                window.arrowRainPreview.x,
                window.arrowRainPreview.y,
                window.ARROW_RAIN_RADIUS
            );
        }
        
        if (this.isRunning) {
            requestAnimationFrame((time) => this.gameLoop(time));
        }
    }

    // Iniciar game loop
    startGameLoop() {
        this.isRunning = true;
        this.lastTime = performance.now();
        requestAnimationFrame((time) => this.gameLoop(time));
    }

    // Parar game loop
    stopGameLoop() {
        this.isRunning = false;
    }

    // Iniciar onda manualmente
    startWave() {
        if (!this.gameState.waveInProgress && !this.gameState.isGameOver && this.gameState.nextWaveTimer > 0 && this.gameState.enemies.length === 0) {
            this.gameState.nextWaveTimer = 0;
            this.gameState.waveInProgress = true;
            this.spawnWave();
            this.uiSystem.showNotification(`Onda ${this.gameState.wave} iniciada!`, 'info');
            this.uiSystem.updateUI();
        }
    }

    // Pausar/continuar jogo
    togglePause() {
        this.gameState.isPaused = !this.gameState.isPaused;
        document.getElementById('pause').textContent = this.gameState.isPaused ? 'Continuar' : 'Pausar';
        
        // Se está continuando o jogo, reinicializar as torres
        if (!this.gameState.isPaused) {
            this.reinitializeTowers();
        }
    }
    
    // Reinicializar torres após pausa
    reinitializeTowers() {
        this.gameState.towers.forEach(tower => {
            // Limpar alvos e projéteis ativos
            tower.target = null;
            tower.activeProjectiles = [];
            tower.lastShot = 0;
            
            // Reaplicar bônus e configurações
            if (tower.applyBonuses) {
                tower.applyBonuses();
            }
        });
        
        // Limpar projéteis órfãos
        this.gameState.projectiles = [];
        
        // Atualizar UI
        this.uiSystem.updateUI();
    }
} 