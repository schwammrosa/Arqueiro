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
        this.wasAutoPaused = false; // Para rastrear se foi pausado automaticamente
        
        // Sistema de velocidade global
        this.gameSpeed = 1; // 1x, 2x, 4x, 8x
        this.availableSpeeds = [1, 2, 4, 8];
        this.currentSpeedIndex = 0;
        
        // Cooldowns das habilidades especiais baseados em gameTime
        this.specialSkills = {
            arrowRain: {
                ready: true,
                cooldownTime: 25, // segundos
                lastUsed: 0
            },
            iceStorm: {
                ready: true,
                cooldownTime: 30, // segundos
                lastUsed: 0
            }
        };
        
        // Configurar detecção de visibilidade da página
        this.setupVisibilityDetection();
        
        // Contador para verificação periódica das habilidades especiais
        this.skillCheckFrameCounter = 0;
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
            // Erro ao carregar configurações das ondas
        }
        }
        const enemyCount = waveConfig.baseEnemies + (this.gameState.wave - 1) * waveConfig.enemiesIncrease;
        this.gameState.monstersThisWave = enemyCount;
        this.gameState.monstersDefeated = 0;
        
        // Configurar sistema de spawn baseado em tempo (que respeita pausa)
        this.gameState.enemiesSpawned = 0;
        this.gameState.lastSpawnTime = this.gameState.gameTime;
        this.gameState.spawnInterval = this.GAME_CONFIG.enemySpawnRate / 1000; // Converter para segundos
        

        this.uiSystem.updateUI();
    }

    // Game over - apenas por derrota (jogo infinito)
    gameOver() {
        if (this.gameState.isGameOver) return; // Prevenir múltiplas execuções
        
        this.gameState.isGameOver = true;
        // Calcular ondas sobrevividas
        const wavesSurvived = this.gameState.wave - 1;
        
        // Adicionar tempo final e pontuação
        const minutes = Math.floor(this.gameState.gameTime / 60);
        const seconds = Math.floor(this.gameState.gameTime % 60);
        const finalTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // Limpar conteúdo anterior e atualizar o game over
        const gameOverContent = document.querySelector('.game-over-content');
        
        // Remover apenas as mensagens dinâmicas (manter título e botão restart)
        const dynamicElements = gameOverContent.querySelectorAll('div:not(.game-over-header), p:not(.game-over-stats)');
        dynamicElements.forEach(el => el.remove());
        
        // Atualizar informações básicas
        let statsElement = gameOverContent.querySelector('.game-over-stats');
        if (!statsElement) {
            statsElement = document.createElement('p');
            statsElement.className = 'game-over-stats';
            gameOverContent.insertBefore(statsElement, gameOverContent.querySelector('button'));
        }
        
        statsElement.innerHTML = `
            Você sobreviveu a <span id="final-wave">${wavesSurvived}</span> ondas!<br>
            Tempo: ${finalTime}<br>
            Pontuação: ${this.gameState.score}
        `;
        
        document.getElementById('gameOver').style.display = 'flex';
        
        // Salvar maior onda atingida para sistema de continuar
        this.saveMaxWaveReached(this.gameState.wave);
        
        // Recompensa por sobrevivência (baseada em marcos de ondas)
        const UPGRADE_POINTS_KEY = 'arqueiroUpgradePoints';
        const LAST_REWARDED_WAVE_KEY = 'arqueiroLastRewardedWave';
        
        // Verificar qual foi a maior onda em que já ganhou pontos
        const lastRewardedWave = parseInt(localStorage.getItem(LAST_REWARDED_WAVE_KEY) || '0');
        const newProgress = Math.max(0, wavesSurvived - lastRewardedWave);
        

        
        let points = 0;
        
        // Sistema de recompensas mais equilibrado - baseado apenas no NOVO progresso
        if (newProgress >= 10) {
            points = Math.floor(newProgress / 10); // 1 ponto a cada 10 ondas novas
        } else if (newProgress >= 5) {
            points = 1; // 1 ponto por progredir 5 ondas
        }
        // Progresso < 5: 0 pontos (incentiva a melhorar)
        
        // Bônus por marcos especiais - só se atingir pela primeira vez
        if (wavesSurvived >= 25 && lastRewardedWave < 25) points += 1;
        if (wavesSurvived >= 50 && lastRewardedWave < 50) points += 2;
        if (wavesSurvived >= 100 && lastRewardedWave < 100) points += 3;
        
        if (points > 0) {
            let current = parseInt(localStorage.getItem(UPGRADE_POINTS_KEY) || '0');
            localStorage.setItem(UPGRADE_POINTS_KEY, current + points);
            
            // Atualizar maior onda recompensada
            localStorage.setItem(LAST_REWARDED_WAVE_KEY, wavesSurvived);
            
            // Exibir mensagem de recompensa detalhada
            setTimeout(() => {
                if (document.getElementById('gameOver')) {
                    const msg = document.createElement('div');
                    msg.className = 'reward-message';
                    msg.style = 'margin-top:18px;font-size:1.2em;color:#ff9800;font-weight:bold;';
                    
                    let progressText = '';
                    if (lastRewardedWave > 0) {
                        progressText = `<br><span style="font-size:0.9em;color:#ccc;">Progresso: ${lastRewardedWave} → ${wavesSurvived} ondas (+${newProgress})</span>`;
                    }
                    
                    msg.innerHTML = `Você ganhou <b>+${points} ponto${points>1?'s':''} de upgrade</b> pela sobrevivência!${progressText}`;
                    gameOverContent.appendChild(msg);
                }
            }, 300);
        } else {
            // Mensagem motivacional quando não ganha pontos
            setTimeout(() => {
                if (document.getElementById('gameOver')) {
                    const msg = document.createElement('div');
                    msg.className = 'motivational-message';
                    msg.style = 'margin-top:18px;font-size:1.0em;color:#888;';
                    
                    let motivationalText = '';
                    if (lastRewardedWave > 0) {
                        const needed = Math.max(5, 10 - (wavesSurvived - lastRewardedWave));
                        motivationalText = `Progrida mais ${needed} ondas para ganhar pontos! (Atual: ${wavesSurvived}, Última recompensa: ${lastRewardedWave})`;
                    } else {
                        motivationalText = `Sobreviva até a onda 5+ para ganhar pontos de upgrade!`;
                    }
                    
                    msg.innerHTML = motivationalText;
                    gameOverContent.appendChild(msg);
                }
            }, 300);
        }
    }

    // Restart do jogo
    restart(getInitialGameState, initializeFirstWave) {
        console.log('GameSystem.restart chamado');
        
        // Parar game loop atual se estiver rodando
        if (this.isRunning) {
            console.log('Parando game loop atual');
            this.stopGameLoop();
        }
        
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
        
        // Recarregar caminho dos inimigos se necessário
        this.reloadEnemyPath();
        
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
        
        // Verificar habilidades especiais após reiniciar
        setTimeout(() => {
            this.updateSpecialSkillsVisibility();
        }, 100);
        
        console.log('GameSystem.restart concluído');
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
        let deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        // Limitar deltaTime para evitar saltos quando a página é minimizada/reativada
        // Máximo de 100ms (equivalente a ~10fps mínimo)
        if (deltaTime > 100) {
            deltaTime = 100;
        }
        
        // Aplicar velocidade do jogo apenas aos sistemas de jogo (não à UI)
        const speedAdjustedDeltaTime = deltaTime * this.gameSpeed;
        
        if (!this.gameState.isPaused && !this.gameState.isGameOver) {
            this.gameState.gameTime += speedAdjustedDeltaTime / 1000;
            
            // Atualizar cooldowns das habilidades especiais
            this.updateSpecialSkillCooldowns(speedAdjustedDeltaTime);
            
            if (this.gameState.nextWaveTimer > 0) {
                this.gameState.nextWaveTimer -= speedAdjustedDeltaTime / 1000;
                // SÓ iniciar onda automaticamente se não há inimigos vivos E timer acabou
                if (this.gameState.nextWaveTimer <= 0 && !this.gameState.waveInProgress && this.gameState.enemies.length === 0) {
                    this.gameState.nextWaveTimer = 0;
                    this.gameState.waveInProgress = true;
                    this.spawnWave();
                    this.uiSystem.showNotification(`Onda ${this.gameState.wave} iniciada!`, 'info');
                }
            }

            // Sistema de spawn baseado em tempo (respeita pausa e velocidade)
            if (this.gameState.waveInProgress && !this.gameState.allEnemiesSpawned) {
                const timeSinceLastSpawn = this.gameState.gameTime - this.gameState.lastSpawnTime;
                
                if (timeSinceLastSpawn >= this.gameState.spawnInterval) {
                    // Spawnar próximo inimigo
                    if (this.gameState.enemiesSpawned < this.gameState.monstersThisWave) {
                        this.gameState.enemies.push(new this.Enemy(null, this.gameState, this.GAME_CONFIG, this.enemyPath, this.chooseEnemyType, this.calculateEnemyStats, this.DamageNumber, this.uiSystem.showNotification.bind(this.uiSystem)));
                        this.gameState.enemiesSpawned++;
                        this.gameState.lastSpawnTime = this.gameState.gameTime;
                        
        
                    } else {
                        // Todos os inimigos foram spawnados
                        this.gameState.allEnemiesSpawned = true;
        
                        this.uiSystem.updateUI();
                    }
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

        // Renderização (sempre usa deltaTime normal, não acelerado)
        this.renderSystem.ctx.clearRect(0, 0, this.GAME_CONFIG.canvasWidth, this.GAME_CONFIG.canvasHeight);
        this.renderSystem.drawBackground();
        this.renderSystem.drawPath();
        
        // Atualizar e desenhar entidades (com velocidade acelerada)
        this.gameState.towers.forEach(tower => {
            tower.update(speedAdjustedDeltaTime);
            tower.draw();
        });
        
        this.gameState.enemies.forEach(enemy => {
            enemy.update(speedAdjustedDeltaTime);
            enemy.draw(this.renderSystem.ctx);
        });
        
        this.gameState.projectiles.forEach(projectile => {
            projectile.update(speedAdjustedDeltaTime);
            projectile.draw(this.renderSystem.ctx);
        });
        
        this.gameState.damageNumbers = this.gameState.damageNumbers.filter(damageNumber => {
            damageNumber.update(speedAdjustedDeltaTime, this.gameState);
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
        
        // Verificar habilidades especiais periodicamente (a cada 60 frames ≈ 1 segundo)
        this.skillCheckFrameCounter++;
        if (this.skillCheckFrameCounter >= 60) {
            this.updateSpecialSkillsVisibility();
            this.skillCheckFrameCounter = 0;
        }
        
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
        
        // Se foi pausado manualmente, cancelar auto-pausa
        if (this.gameState.isPaused) {
            this.wasAutoPaused = false;
        } else {
            // Se está despausando, resetar lastTime e reinicializar torres
            this.lastTime = performance.now();
            this.reinitializeTowers();
            this.wasAutoPaused = false;
        }
        
        const pauseBtn = document.getElementById('pause');
        const pauseIcon = pauseBtn.querySelector('.btn-icon');
        const pauseText = pauseBtn.querySelector('.btn-text');
        
        if (this.gameState.isPaused) {
            if (pauseIcon) pauseIcon.textContent = '▶️';
            if (pauseText) pauseText.textContent = 'Continuar';
            pauseBtn.title = 'Continuar jogo';
        } else {
            if (pauseIcon) pauseIcon.textContent = '⏸️';
            if (pauseText) pauseText.textContent = 'Pausar';
            pauseBtn.title = 'Pausar jogo';
        }
        this.uiSystem.updateUI();
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
    
    // Recarregar caminho dos inimigos
    reloadEnemyPath() {
        // Carregar caminho do localStorage
        const savedPath = localStorage.getItem('enemyPath');
        if (savedPath) {
            try {
                const newPath = JSON.parse(savedPath);
                if (newPath && newPath.length > 0) {
                    this.enemyPath = newPath;
                    if (this.renderSystem && this.renderSystem.updateEnemyPath) {
                        this.renderSystem.updateEnemyPath(newPath);
                    }
                    console.log('GameSystem: Caminho recarregado com', newPath.length, 'pontos');
                }
            } catch (e) {
                console.error('Erro ao recarregar caminho:', e);
            }
        }
    }
    
    // Configurar detecção de visibilidade da página
    setupVisibilityDetection() {
        // Detectar quando a página é minimizada ou perde foco
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                // Página foi minimizada ou perdeu foco
                if (!this.gameState.isPaused && !this.gameState.isGameOver) {
        
                    this.gameState.isPaused = true;
                    this.wasAutoPaused = true;
                    this.uiSystem.updateUI();
                    
                    // Mostrar notificação quando a página voltar
                    this.uiSystem.showNotification('Jogo pausado automaticamente (página minimizada)', 'info');
                }
            } else {
                // Página voltou ao foco
                if (this.wasAutoPaused && this.gameState.isPaused) {
        
                    this.gameState.isPaused = false;
                    this.wasAutoPaused = false;
                    
                    // Resetar lastTime para evitar deltaTime muito grande
                    this.lastTime = performance.now();
                    
                    // Reinicializar torres para garantir estado consistente
                    this.reinitializeTowers();
                    
                    this.uiSystem.updateUI();
                    this.uiSystem.showNotification('Jogo despausado automaticamente', 'success');
                }
            }
        });
        
        // Detectar quando a janela perde/ganha foco (backup)
        window.addEventListener('blur', () => {
            if (!this.gameState.isPaused && !this.gameState.isGameOver) {
    
                this.gameState.isPaused = true;
                this.wasAutoPaused = true;
                this.uiSystem.updateUI();
            }
        });
        
        window.addEventListener('focus', () => {
            if (this.wasAutoPaused && this.gameState.isPaused) {
    
                this.gameState.isPaused = false;
                this.wasAutoPaused = false;
                
                // Resetar lastTime para evitar deltaTime muito grande
                this.lastTime = performance.now();
                
                // Reinicializar torres para garantir estado consistente
                this.reinitializeTowers();
                
                this.uiSystem.updateUI();
            }
        });
    }

    // Sistema de velocidade
    toggleGameSpeed() {
        this.currentSpeedIndex = (this.currentSpeedIndex + 1) % this.availableSpeeds.length;
        this.gameSpeed = this.availableSpeeds[this.currentSpeedIndex];
        this.updateSpeedUI();
    }
    
    setGameSpeed(speed) {
        const index = this.availableSpeeds.indexOf(speed);
        if (index !== -1) {
            this.currentSpeedIndex = index;
            this.gameSpeed = speed;
            this.updateSpeedUI();
        }
    }
    
    updateSpeedUI() {
        const speedBtn = document.getElementById('speedButton');
        if (speedBtn) {
            // Atualizar texto do botão (considerando estrutura com span)
            const speedText = speedBtn.querySelector('.btn-text');
            if (speedText) {
                speedText.textContent = `${this.gameSpeed}x`;
            } else {
                speedBtn.textContent = `${this.gameSpeed}x`;
            }
            speedBtn.title = `Alterar velocidade do jogo (${this.gameSpeed}x)`;
        }
        
        // Atualizar display na UI
        if (this.uiSystem && this.uiSystem.updateSpeedDisplay) {
            this.uiSystem.updateSpeedDisplay(this.gameSpeed);
        }
    }
    
    // Gerenciar cooldowns das habilidades especiais
    updateSpecialSkillCooldowns(deltaTime) {
        if (this.gameState.isPaused) return;
        
        const speedAdjustedDeltaTime = deltaTime * this.gameSpeed;
        
        // Atualizar cooldowns
        for (const [skillName, skill] of Object.entries(this.specialSkills)) {
            if (!skill.ready) {
                const timeSinceLastUse = this.gameState.gameTime - skill.lastUsed;
                if (timeSinceLastUse >= skill.cooldownTime) {
                    skill.ready = true;
                    this.updateSpecialSkillUI(skillName);
                } else {
                    this.updateSpecialSkillUI(skillName, skill.cooldownTime - timeSinceLastUse);
                }
            }
        }
    }
    
    updateSpecialSkillUI(skillName, remainingTime = 0) {
        if (skillName === 'arrowRain') {
            const btn = document.getElementById('btnArrowRain');
            if (btn) {
                const skill = this.specialSkills.arrowRain;
                const locked = !this.isSpecialSkillUnlocked('arrowRain');
                const cooldownText = !locked && !skill.ready ? 
                    `<span style='color:#d84315;font-weight:bold;'>${Math.ceil(remainingTime)}s</span>` : '';
                
                btn.disabled = locked || !skill.ready;
                btn.classList.toggle('locked', locked);
                btn.innerHTML = `
                    <span class="skill-icon">🏹</span>
                    <span class="skill-label">Chuva de Flechas</span>
                    <span class="skill-cooldown">${cooldownText}</span>
                    ${locked ? '<span class="skill-lock" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:1.5em;z-index:10;pointer-events:none;">🔒</span>' : ''}
                `;
            }
        } else if (skillName === 'iceStorm') {
            const btn = document.getElementById('btnIceStorm');
            if (btn) {
                const skill = this.specialSkills.iceStorm;
                const locked = !this.isSpecialSkillUnlocked('iceStorm');
                const cooldownText = !locked && !skill.ready ? 
                    `<span style='color:#d84315;font-weight:bold;'>${Math.ceil(remainingTime)}s</span>` : '';
                
                btn.disabled = locked || !skill.ready;
                btn.classList.toggle('locked', locked);
                btn.innerHTML = `
                    <span class="skill-icon">❄️</span>
                    <span class="skill-label">Tempestade de Gelo</span>
                    <span class="skill-cooldown">${cooldownText}</span>
                    ${locked ? '<span class="skill-lock" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:1.5em;z-index:10;pointer-events:none;">🔒</span>' : ''}
                `;
            }
        }
    }
    
    // Verificar se habilidades especiais estão desbloqueadas
    isSpecialSkillUnlocked(skillName = 'arrowRain') {
        try {
            // Acessar localStorage diretamente para ler a skill tree
            const saved = localStorage.getItem('arqueiroSkillTree');
            if (!saved) return false;
            
            const skillTree = JSON.parse(saved);
            
            // Chuva de Flechas: precisa do nó 'esp' desbloqueado
            if (skillName === 'arrowRain') {
                return (skillTree['esp'] || 0) > 0;
            }
            
            // Tempestade de Gelo: precisa do nó 'gelo' desbloqueado  
            if (skillName === 'iceStorm') {
                return (skillTree['gelo'] || 0) > 0;
            }
        } catch (error) {
            // Erro ao verificar habilidades especiais
            return false;
        }
        return false;
    }
    
    // Atualizar visibilidade dos botões das habilidades especiais
    updateSpecialSkillsVisibility() {
        const arrowBtn = document.getElementById('btnArrowRain');
        const iceBtn = document.getElementById('btnIceStorm');
        
        if (arrowBtn) {
            const arrowUnlocked = this.isSpecialSkillUnlocked('arrowRain');
            arrowBtn.style.display = arrowUnlocked ? 'flex' : 'none';
            
            if (arrowUnlocked) {

            } else {

            }
        }
        
        if (iceBtn) {
            const iceUnlocked = this.isSpecialSkillUnlocked('iceStorm');
            iceBtn.style.display = iceUnlocked ? 'flex' : 'none';
            
            if (iceUnlocked) {

            } else {

            }
        }
        
        // Garantir que os event listeners estejam funcionando
        setTimeout(() => {
            if (typeof window.fixEventListeners === 'function') {
                window.fixEventListeners();
            }
        }, 100);
    }
    
    // Usar habilidade especial
    useSpecialSkill(skillName) {
        const skill = this.specialSkills[skillName];
        if (!skill || !skill.ready || !this.isSpecialSkillUnlocked(skillName)) {
            return false;
        }
        
        skill.ready = false;
        skill.lastUsed = this.gameState.gameTime;
        this.updateSpecialSkillUI(skillName);
        
        return true;
    }
    
    // Salvar maior onda atingida para sistema de continuar
    saveMaxWaveReached(currentWave) {
        try {
            const key = 'maiorOndaAtingida';
            const savedMaxWave = parseInt(localStorage.getItem(key) || '1');
            
            if (currentWave > savedMaxWave) {
                localStorage.setItem(key, currentWave.toString());
            }
            
            // Salvar progresso por dificuldade
            const selectedDifficulty = localStorage.getItem('selectedDifficulty') || 'normal';
            const progressKey = `progress_${selectedDifficulty}`;
            localStorage.setItem(progressKey, currentWave.toString());
            console.log('Progresso salvo no GameSystem:', progressKey, '=', currentWave);
            
            // Atualizar botão "Continuar" imediatamente
            if (typeof window.adicionarBotaoContinuarMenu === 'function') {
                window.adicionarBotaoContinuarMenu();
            }
            
            // Adicionar botão "Continuar" na tela de game over
            if (typeof window.adicionarBotaoContinuarGameOver === 'function') {
                window.adicionarBotaoContinuarGameOver();
            }
        } catch (error) {
            console.log('Erro ao salvar progresso:', error);
        }
    }
} 