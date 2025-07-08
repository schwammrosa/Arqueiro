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
        this.imageManager = renderSystem.imageManager;
        
        // Controle de tempo e estado
        this.lastTime = 0;
        this.isRunning = false;
        this.lastPassiveHeal = 0;
        this.wasAutoPaused = false;
        
        // Sistema de velocidade global
        this.gameSpeed = 1;
        this.availableSpeeds = [1, 2, 4, 8];
        this.currentSpeedIndex = 0;
        
        // Habilidades especiais
        this.specialSkills = {
            arrowRain: {
                ready: true,
                cooldownTime: 25,
                lastUsed: 0
            },
            iceStorm: {
                ready: true,
                cooldownTime: 30,
                lastUsed: 0
            }
        };
        
        // Contadores para verificações periódicas
        this.skillCheckFrameCounter = 0;
        this.spriteCheckCounter = 0;
        
        // Configurar detecção de visibilidade da página
        this.setupVisibilityDetection();
    }

    // ===== INICIALIZAÇÃO E CONFIGURAÇÃO =====
    
    initializeFirstWave() {
        const waveDelaySeconds = this.getConfigValue('waveDelaySeconds', 5);
        this.gameState.nextWaveTimer = waveDelaySeconds;
        
        if (this.gameState.wave === 0) {
            this.gameState.wave = 0;
        }
        
        this.gameState.waveInProgress = false;
        this.gameState.allEnemiesSpawned = false;
    }

    spawnWave() {
        this.gameState.wave++;
        this.gameState.allEnemiesSpawned = false;
        
        // Rastrear início da onda para bônus de performance
        this.gameState.waveStartTime = this.gameState.gameTime;
        this.gameState.waveStartHealth = this.gameState.health;

        // Configurar inimigos da onda
        const waveConfig = this.getWaveConfig();
        const enemyCount = waveConfig.baseEnemies + (this.gameState.wave - 1) * waveConfig.enemiesIncrease;
        this.gameState.monstersThisWave = enemyCount;
        this.gameState.monstersDefeated = 0;
        
        // Configurar sistema de spawn
        this.gameState.enemiesSpawned = 0;
        this.gameState.lastSpawnTime = this.gameState.gameTime;
        this.gameState.spawnInterval = this.GAME_CONFIG.enemySpawnRate / 1000;

        this.uiSystem.updateUI();
    }

    // ===== GESTÃO DE ESTADO DO JOGO =====
    
    gameOver() {
        if (this.gameState.isGameOver) return;
        
        this.gameState.isGameOver = true;
        const wavesSurvived = this.gameState.wave - 1;
        const finalTime = this.formatGameTime(this.gameState.gameTime);
        
        this.updateGameOverUI(wavesSurvived, finalTime);
        this.saveMaxWaveReached(this.gameState.wave);
        this.processRewards(wavesSurvived);
    }

    restart(getInitialGameState, initializeFirstWave) {
        if (this.isRunning) {
            this.stopGameLoop();
        }
        
        this.gameState = getInitialGameState();
        this.updateGlobalReferences();
        this.reloadEnemyPath();
        
        document.getElementById('gameOver').style.display = 'none';
        this.uiSystem.updateUI();
        
        initializeFirstWave();
        this.lastTime = performance.now();
        this.startGameLoop();
        
        this.resetGlobalVariables();
        this.reinitializeTowers();
        
        setTimeout(() => {
            this.updateSpecialSkillsVisibility();
        }, 100);
    }

    // ===== GAME LOOP PRINCIPAL =====
    
    gameLoop(currentTime) {
        let deltaTime = this.calculateDeltaTime(currentTime);
        const speedAdjustedDeltaTime = deltaTime * this.gameSpeed;
        
        if (!this.gameState.isPaused && !this.gameState.isGameOver) {
            this.updateGameTime(speedAdjustedDeltaTime);
            this.updateSpecialSkillCooldowns(speedAdjustedDeltaTime);
            this.handleWaveTimer(speedAdjustedDeltaTime);
            this.handleEnemySpawning();
            this.handlePassiveHealing();
        }

        this.renderGame(speedAdjustedDeltaTime);
        this.handleWaveCompletion();
        this.checkGameOver();
        
        this.cleanupOrphanedReferences();
        this.uiSystem.updateUI();
        this.performPeriodicChecks();
        
        if (this.isRunning) {
            requestAnimationFrame((time) => this.gameLoop(time));
        }
    }

    // ===== CONTROLE DE VELOCIDADE =====
    
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

    // ===== CONTROLE DE PAUSA =====
    
    togglePause() {
        this.gameState.isPaused = !this.gameState.isPaused;
        
        if (this.gameState.isPaused) {
            this.wasAutoPaused = false;
        } else {
            this.lastTime = performance.now();
            this.reinitializeTowers();
            this.wasAutoPaused = false;
        }
        
        this.updatePauseUI();
        this.uiSystem.updateUI();
    }

    startWave() {
        if (!this.gameState.waveInProgress && !this.gameState.isGameOver && 
            this.gameState.nextWaveTimer > 0 && this.gameState.enemies.length === 0) {
            this.gameState.nextWaveTimer = 0;
            this.gameState.waveInProgress = true;
            this.spawnWave();
            this.uiSystem.showNotification(`Onda ${this.gameState.wave} iniciada!`, 'info');
            this.uiSystem.updateUI();
        }
    }

    // ===== HABILIDADES ESPECIAIS =====
    
    updateSpecialSkillCooldowns(deltaTime) {
        if (this.gameState.isPaused) return;
        
        const speedAdjustedDeltaTime = deltaTime * this.gameSpeed;
        
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
        const skillConfig = this.getSkillConfig(skillName);
        if (!skillConfig) return;
        
        const btn = document.getElementById(skillConfig.buttonId);
        if (!btn) return;
        
        const skill = this.specialSkills[skillName];
        const locked = !this.isSpecialSkillUnlocked(skillName);
        const cooldownText = !locked && !skill.ready ? 
            `<span style='color:${skillConfig.cooldownColor};font-weight:bold;'>${Math.ceil(remainingTime)}s</span>` : '';
        
        btn.disabled = locked || !skill.ready;
        btn.classList.toggle('locked', locked);
        btn.innerHTML = `
            <span class="skill-icon">${skillConfig.icon}</span>
            <span class="skill-label">${skillConfig.label}</span>
            <span class="skill-cooldown">${cooldownText}</span>
            ${locked ? '<span class="skill-lock" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:1.5em;z-index:10;pointer-events:none;">🔒</span>' : ''}
        `;
    }
    
    isSpecialSkillUnlocked(skillName) {
        try {
            const saved = localStorage.getItem('arqueiroSkillTree');
            if (!saved) return false;
            
            const skillTree = JSON.parse(saved);
            const skillConfig = this.getSkillConfig(skillName);
            
            return skillConfig && (skillTree[skillConfig.requirement] || 0) > 0;
        } catch (error) {
            return false;
        }
    }
    
    updateSpecialSkillsVisibility() {
        const skills = ['arrowRain', 'iceStorm'];
        
        skills.forEach(skillName => {
            const skillConfig = this.getSkillConfig(skillName);
            if (!skillConfig) return;
            
            const btn = document.getElementById(skillConfig.buttonId);
            if (btn) {
                const unlocked = this.isSpecialSkillUnlocked(skillName);
                btn.style.display = unlocked ? 'flex' : 'none';
            }
        });
    }
    
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

    // ===== UTILITÁRIOS =====
    
    cleanupOrphanedReferences() {
        this.gameState.towers.forEach(tower => {
            if (tower.target && this.gameState.enemies.indexOf(tower.target) === -1) {
                tower.target = null;
            }
        });
        
        this.gameState.projectiles = this.gameState.projectiles.filter(projectile => {
            return projectile.target && this.gameState.enemies.indexOf(projectile.target) !== -1;
        });
    }

    calculatePerformanceBonus(baseBonus) {
        if (!this.gameState.waveStartTime || !this.gameState.waveStartHealth) {
            return 0;
        }
        
        const waveTime = this.gameState.gameTime - this.gameState.waveStartTime;
        const healthLost = this.gameState.waveStartHealth - this.gameState.health;
        const maxHealth = this.GAME_CONFIG.initialHealth;
        
        const idealTime = 30;
        const speedMultiplier = Math.max(0, (idealTime - waveTime) / idealTime);
        const speedBonus = Math.floor(baseBonus * 0.3 * speedMultiplier);
        
        const healthRatio = Math.max(0, 1 - (healthLost / maxHealth));
        const healthBonus = Math.floor(baseBonus * 0.5 * healthRatio);
        
        const perfectionBonus = (healthLost === 0 && waveTime < idealTime) ? 
            Math.floor(baseBonus * 0.2) : 0;
        
        return speedBonus + healthBonus + perfectionBonus;
    }

    checkAchievementMultipliers() {
        let multiplier = 1.0;
        
        if (!this.gameState.achievements) {
            this.gameState.achievements = {
                firstEliteKilled: false,
                perfectWaves: 0,
                consecutivePerfectWaves: 0,
                towersBuilt: 0,
                elitesKilled: 0
            };
        }
        
        // Conquistas por ondas
        if (this.gameState.wave >= 25) multiplier += 0.5;
        if (this.gameState.wave >= 50) multiplier += 0.5;
        if (this.gameState.wave >= 100) multiplier += 1.0;
        
        // Conquistas por ondas perfeitas
        if (this.gameState.waveStartHealth === this.gameState.health) {
            this.gameState.achievements.consecutivePerfectWaves++;
            if (this.gameState.achievements.consecutivePerfectWaves >= 3) multiplier += 0.3;
            if (this.gameState.achievements.consecutivePerfectWaves >= 5) multiplier += 0.2;
        } else {
            this.gameState.achievements.consecutivePerfectWaves = 0;
        }
        
        // Conquistas por eficiência
        const towersCount = this.gameState.towers.length;
        if (towersCount <= 3 && this.gameState.wave >= 10) multiplier += 0.4;
        if (towersCount <= 5 && this.gameState.wave >= 20) multiplier += 0.2;
        
        // Conquistas por elites
        if (this.gameState.achievements.elitesKilled >= 5) multiplier += 0.25;
        if (this.gameState.achievements.elitesKilled >= 10) multiplier += 0.25;
        
        return multiplier;
    }

    // ===== MÉTODOS PRIVADOS =====
    
    getConfigValue(key, defaultValue) {
        const savedConfig = localStorage.getItem('arqueiroConfig');
        if (savedConfig) {
            try {
                const config = JSON.parse(savedConfig);
                return config[key] || defaultValue;
            } catch (e) {
                return defaultValue;
            }
        }
        return defaultValue;
    }

    getWaveConfig() {
        return {
            baseEnemies: this.getConfigValue('enemiesPerWave', 5),
            enemiesIncrease: this.getConfigValue('enemiesIncrease', 2)
        };
    }

    getSkillConfig(skillName) {
        const configs = {
            arrowRain: {
                buttonId: 'btnArrowRain',
                icon: '🏹',
                label: 'Chuva de Flechas',
                cooldownColor: '#38bdf8',
                requirement: 'esp'
            },
            iceStorm: {
                buttonId: 'btnIceStorm',
                icon: '❄️',
                label: 'Tempestade de Gelo',
                cooldownColor: '#d84315',
                requirement: 'gelo'
            }
        };
        return configs[skillName];
    }

    formatGameTime(gameTime) {
        const minutes = Math.floor(gameTime / 60);
        const seconds = Math.floor(gameTime % 60);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    updateGameOverUI(wavesSurvived, finalTime) {
        const gameOverContent = document.querySelector('.game-over-content');
        
        const dynamicElements = gameOverContent.querySelectorAll('div:not(.game-over-header), p:not(.game-over-stats)');
        dynamicElements.forEach(el => el.remove());
        
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
    }

    processRewards(wavesSurvived) {
        const UPGRADE_POINTS_KEY = 'arqueiroUpgradePoints';
        const LAST_REWARDED_WAVE_KEY = 'arqueiroLastRewardedWave';
        
        const lastRewardedWave = parseInt(localStorage.getItem(LAST_REWARDED_WAVE_KEY) || '0');
        const newProgress = Math.max(0, wavesSurvived - lastRewardedWave);
        
        let points = 0;
        
        if (newProgress >= 10) {
            points = Math.floor(newProgress / 10);
        } else if (newProgress >= 5) {
            points = 1;
        }
        
        if (wavesSurvived >= 25 && lastRewardedWave < 25) points += 1;
        if (wavesSurvived >= 50 && lastRewardedWave < 50) points += 2;
        if (wavesSurvived >= 100 && lastRewardedWave < 100) points += 3;
        
        if (points > 0) {
            let current = parseInt(localStorage.getItem(UPGRADE_POINTS_KEY) || '0');
            localStorage.setItem(UPGRADE_POINTS_KEY, current + points);
            localStorage.setItem(LAST_REWARDED_WAVE_KEY, wavesSurvived);
            
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
                    document.querySelector('.game-over-content').appendChild(msg);
                }
            }, 300);
        } else {
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
                    document.querySelector('.game-over-content').appendChild(msg);
                }
            }, 300);
        }
    }

    updateGlobalReferences() {
        if (typeof gameState !== 'undefined') {
            gameState = this.gameState;
        }
        
        if (this.uiSystem && typeof this.uiSystem.setGameState === 'function') {
            this.uiSystem.setGameState(this.gameState);
        }
        
        if (this.renderSystem) {
            this.renderSystem.gameState = this.gameState;
        }
    }

    resetGlobalVariables() {
        if (window.setArrowRainSelecting) window.setArrowRainSelecting(false);
        if (window.setArrowRainPreview) window.setArrowRainPreview(null);
        if (typeof hideInfoTooltip === 'function') hideInfoTooltip();
    }

    calculateDeltaTime(currentTime) {
        let deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        if (deltaTime > 100) {
            deltaTime = 100;
        }
        
        return deltaTime;
    }

    updateGameTime(speedAdjustedDeltaTime) {
        this.gameState.gameTime += speedAdjustedDeltaTime / 1000;
    }

    handleWaveTimer(speedAdjustedDeltaTime) {
        if (this.gameState.nextWaveTimer > 0) {
            this.gameState.nextWaveTimer -= speedAdjustedDeltaTime / 1000;
            if (this.gameState.nextWaveTimer <= 0 && !this.gameState.waveInProgress && this.gameState.enemies.length === 0) {
                this.gameState.nextWaveTimer = 0;
                this.gameState.waveInProgress = true;
                this.spawnWave();
                this.uiSystem.showNotification(`Onda ${this.gameState.wave} iniciada!`, 'info');
            }
        }
    }

    handleEnemySpawning() {
        if (this.gameState.waveInProgress && !this.gameState.allEnemiesSpawned) {
            const timeSinceLastSpawn = this.gameState.gameTime - this.gameState.lastSpawnTime;
            
            if (timeSinceLastSpawn >= this.gameState.spawnInterval) {
                if (this.gameState.enemiesSpawned < this.gameState.monstersThisWave) {
                    this.gameState.enemies.push(new this.Enemy(null, this.gameState, this.GAME_CONFIG, this.enemyPath, this.chooseEnemyType, this.calculateEnemyStats, this.DamageNumber, this.uiSystem.showNotification.bind(this.uiSystem), this.renderSystem.monsterSpriteManager));
                    this.gameState.enemiesSpawned++;
                    this.gameState.lastSpawnTime = this.gameState.gameTime;
                } else {
                    this.gameState.allEnemiesSpawned = true;
                    this.uiSystem.updateUI();
                }
            }
        }
    }

    handlePassiveHealing() {
        if (this.GAME_CONFIG.passiveHeal && !this.gameState.isGameOver) {
            if (!this.lastPassiveHeal) this.lastPassiveHeal = this.gameState.gameTime;
            const interval = 20;
            const healAmount = this.GAME_CONFIG.passiveHeal;
            if (this.gameState.gameTime - this.lastPassiveHeal >= interval) {
                this.gameState.health = Math.min(this.gameState.health + healAmount, this.GAME_CONFIG.initialHealth);
                this.lastPassiveHeal = this.gameState.gameTime;
                this.uiSystem.showNotification(`Cura passiva: +${healAmount} vida!`, 'info');
                this.uiSystem.updateUI();
            }
        }
    }

    renderGame(speedAdjustedDeltaTime) {
        this.renderSystem.ctx.clearRect(0, 0, this.GAME_CONFIG.canvasWidth, this.GAME_CONFIG.canvasHeight);
        this.renderSystem.drawBackground();
        this.renderSystem.drawPath();
        
        this.gameState.towers.forEach(tower => {
            tower.update(speedAdjustedDeltaTime);
            tower.draw();
        });
        
        this.gameState.enemies.forEach(enemy => {
            enemy.update(speedAdjustedDeltaTime);
        });
        
        if (this.renderSystem.monstersInitialized) {
            this.renderSystem.drawMonsters(this.gameState);
        } else if (this.gameState.enemies && this.gameState.enemies.length > 0) {
            this.gameState.enemies.forEach(enemy => {
                enemy.draw(this.renderSystem.ctx);
            });
        }
        
        this.gameState.projectiles.forEach(projectile => {
            projectile.update(speedAdjustedDeltaTime);
            projectile.draw(this.renderSystem.ctx);
        });
        
        this.gameState.damageNumbers = this.gameState.damageNumbers.filter(damageNumber => {
            damageNumber.update(speedAdjustedDeltaTime, this.gameState);
            damageNumber.draw(this.renderSystem.ctx);
            return !damageNumber.isDead();
        });
        
        this.renderSystem.drawVisualEffects(this.gameState);
        
        if (window.arrowRainSelecting && window.arrowRainPreview) {
            this.renderSystem.drawArrowRainPreview(
                window.arrowRainPreview.x,
                window.arrowRainPreview.y,
                window.ARROW_RAIN_RADIUS
            );
        }
    }

    handleWaveCompletion() {
        if (this.gameState.waveInProgress && this.gameState.allEnemiesSpawned && this.gameState.enemies.length === 0) {
            const waveBonusMultiplier = this.getConfigValue('waveBonusMultiplier', 50);
            
            const exponentialBonus = Math.floor(waveBonusMultiplier * Math.pow(1.1, this.gameState.wave));
            const milestoneBonus = (this.gameState.wave + 1) % 10 === 0 ? 
                Math.floor(exponentialBonus * 0.5) : 0;
            const performanceBonus = this.calculatePerformanceBonus(exponentialBonus);
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
            this.gameState.allEnemiesSpawned = false;
            const waveDelaySeconds = this.getConfigValue('waveDelaySeconds', 5);
            this.gameState.nextWaveTimer = waveDelaySeconds;
            this.uiSystem.updateUI();
        }
    }

    checkGameOver() {
        if (this.gameState.health <= 0 && !this.gameState.isGameOver) {
            this.gameOver();
        }
    }

    performPeriodicChecks() {
        this.skillCheckFrameCounter++;
        if (this.skillCheckFrameCounter >= 60) {
            this.updateSpecialSkillsVisibility();
            this.skillCheckFrameCounter = 0;
            
            this.spriteCheckCounter = (this.spriteCheckCounter || 0) + 1;
            if (this.spriteCheckCounter >= 5) {
                this.checkMonsterSprites();
                this.spriteCheckCounter = 0;
            }
        }
    }

    updateSpeedUI() {
        const speedBtn = document.getElementById('speedButton');
        if (speedBtn) {
            const speedText = speedBtn.querySelector('.btn-text');
            if (speedText) {
                speedText.textContent = `${this.gameSpeed}x`;
            } else {
                speedBtn.textContent = `${this.gameSpeed}x`;
            }
            speedBtn.title = `Alterar velocidade do jogo (${this.gameSpeed}x)`;
        }
        
        if (this.uiSystem && this.uiSystem.updateSpeedDisplay) {
            this.uiSystem.updateSpeedDisplay(this.gameSpeed);
        }
    }

    updatePauseUI() {
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
    }

    reinitializeTowers() {
        this.gameState.towers.forEach(tower => {
            tower.target = null;
            tower.activeProjectiles = [];
            tower.lastShot = 0;
            
            if (!tower.imageManager && this.imageManager) {
                tower.imageManager = this.imageManager;
            }
            
            if (tower.applyBonuses) {
                tower.applyBonuses();
            }
        });
        
        this.gameState.projectiles = [];
        this.uiSystem.updateUI();
    }

    reloadEnemyPath() {
        const savedPath = localStorage.getItem('enemyPath');
        if (savedPath) {
            try {
                const newPath = JSON.parse(savedPath);
                if (newPath && newPath.length > 0) {
                    this.enemyPath = newPath;
                    if (this.renderSystem && this.renderSystem.updateEnemyPath) {
                        this.renderSystem.updateEnemyPath(newPath);
                    }
                }
            } catch (e) {
                // Erro ao recarregar caminho
            }
        }
    }

    setupVisibilityDetection() {
        const handleVisibilityChange = (isHidden) => {
            if (isHidden) {
                if (!this.gameState.isPaused && !this.gameState.isGameOver) {
                    this.gameState.isPaused = true;
                    this.wasAutoPaused = true;
                    this.uiSystem.updateUI();
                    this.uiSystem.showNotification('Jogo pausado automaticamente (página minimizada)', 'info');
                }
            } else {
                if (this.wasAutoPaused && this.gameState.isPaused) {
                    this.gameState.isPaused = false;
                    this.wasAutoPaused = false;
                    this.lastTime = performance.now();
                    this.reinitializeTowers();
                    this.uiSystem.updateUI();
                    this.uiSystem.showNotification('Jogo despausado automaticamente', 'success');
                }
            }
        };

        document.addEventListener('visibilitychange', () => {
            handleVisibilityChange(document.hidden);
        });
        
        window.addEventListener('blur', () => {
            handleVisibilityChange(true);
        });
        
        window.addEventListener('focus', () => {
            handleVisibilityChange(false);
        });
    }

    startGameLoop() {
        this.isRunning = true;
        this.lastTime = performance.now();
        requestAnimationFrame((time) => this.gameLoop(time));
    }

    stopGameLoop() {
        this.isRunning = false;
    }

    saveMaxWaveReached(currentWave) {
        try {
            const key = 'maiorOndaAtingida';
            const savedMaxWave = parseInt(localStorage.getItem(key) || '1');
            
            if (currentWave > savedMaxWave) {
                localStorage.setItem(key, currentWave.toString());
            }
            
            const selectedDifficulty = localStorage.getItem('selectedDifficulty') || 'normal';
            const progressKey = `progress_${selectedDifficulty}`;
            localStorage.setItem(progressKey, currentWave.toString());
        } catch (error) {
            // Erro ao salvar progresso
        }
    }

    async checkMonsterSprites() {
        if (!this.renderSystem.monsterSpriteManager) return;
        
        try {
            const invisibleMonsters = this.gameState.enemies.filter(enemy => {
                if (!enemy.monsterSpriteManager) return false;
                return !enemy.monsterSpriteManager.isMonsterLoaded(enemy.spriteType);
            });
            
            if (invisibleMonsters.length > 0) {
                const repairedCount = await this.renderSystem.monsterSpriteManager.repairSprites();
                
                if (repairedCount > 0) {
                    this.uiSystem.showNotification(`Sprites reparados: ${repairedCount} tipos`, 'info');
                }
            }
        } catch (error) {
            // Erro ao verificar sprites
        }
    }
}