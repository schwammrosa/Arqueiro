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
        this.gameState.wave = 0;
        this.gameState.waveInProgress = false;
        this.gameState.allEnemiesSpawned = false;
    }

    // Spawn de onda
    spawnWave() {
        this.gameState.wave++;
        this.gameState.allEnemiesSpawned = false; // Reset no início de cada onda

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

    // Game over
    gameOver(victory = false) {
        this.gameState.isGameOver = true;
        // Corrigir número de ondas exibidas
        const wavesSurvived = victory ? this.gameState.wave : this.gameState.wave - 1;
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

        if (victory) {
            // Recompensa por vitória
            const UPGRADE_POINTS_KEY = 'arqueiroUpgradePoints';
            let points = 2; // Pode ajustar o valor
            let current = parseInt(localStorage.getItem(UPGRADE_POINTS_KEY) || '0');
            localStorage.setItem(UPGRADE_POINTS_KEY, current + points);
            // Exibir mensagem de recompensa
            setTimeout(() => {
                if (document.getElementById('gameOver')) {
                    const msg = document.createElement('div');
                    msg.style = 'margin-top:18px;font-size:1.2em;color:#ff9800;font-weight:bold;';
                    msg.innerHTML = `Parabéns! Você ganhou <b>+${points} ponto${points>1?'s':''} de upgrade</b>!`;
                    document.querySelector('.game-over-content').appendChild(msg);
                }
            }, 300);
        }
    }

    // Restart do jogo
    restart(getInitialGameState, initializeFirstWave) {
        this.gameState = getInitialGameState();
        if (typeof gameState !== 'undefined') gameState = this.gameState;
        if (this.uiSystem && typeof this.uiSystem.setGameState === 'function') this.uiSystem.setGameState(this.gameState);
        document.getElementById('gameOver').style.display = 'none';
        this.uiSystem.updateUI();
        initializeFirstWave();
        this.lastTime = performance.now();
        this.startGameLoop();
        // Resetar variáveis globais e tooltips
        if (window.setArrowRainSelecting) window.setArrowRainSelecting(false);
        if (window.setArrowRainPreview) window.setArrowRainPreview(null);
        if (typeof hideInfoTooltip === 'function') hideInfoTooltip();
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
            // Verificar vitória
            if (this.gameState.wave >= this.GAME_CONFIG.maxWaves) {
                this.uiSystem.showNotification('Vitória! Você completou todas as ondas!', 'success');
                this.gameOver(true); // true = vitória
                return;
            }
            const savedConfig = localStorage.getItem('arqueiroConfig');
            const waveBonusMultiplier = savedConfig ? JSON.parse(savedConfig).waveBonusMultiplier || 50 : 50;
            const waveBonus = (this.gameState.wave + 1) * waveBonusMultiplier;
            this.gameState.score += waveBonus;
            this.uiSystem.showNotification(`Onda ${this.gameState.wave + 1} completada! +${waveBonus} pontos!`, 'success');
            this.gameState.waveInProgress = false;
            this.gameState.allEnemiesSpawned = false; // Reset para próxima onda
            const waveDelaySeconds = savedConfig ? JSON.parse(savedConfig).waveDelaySeconds || 5 : 5;
            this.gameState.nextWaveTimer = waveDelaySeconds;
            this.uiSystem.updateUI();
        }

        if (this.gameState.health <= 0 && !this.gameState.isGameOver) {
            this.gameOver(false); // false = derrota
        }

        this.cleanupOrphanedReferences();
        this.uiSystem.updateUI();
        
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
    }
} 