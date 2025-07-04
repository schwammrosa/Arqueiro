// Configurações padrão dos inimigos
export const DEFAULT_ENEMY_CONFIG = {
    // Configurações básicas
    enemyBaseHealth: 50,
    enemyHealthIncrease: 15,
    enemySpeed: 0.5,
    enemyReward: 8,
    enemiesPerWave: 8,
    enemiesIncrease: 3,
    
    // Configurações de tipos especiais de inimigos
    enemyTypes: {
        normal: {
            name: 'Normal',
            healthMultiplier: 1,
            speedMultiplier: 1,
            rewardMultiplier: 1,
            scoreMultiplier: 1,      // Pontuação base
            spawnChance: 70, // 70% de chance
            color: '#dc3545'
        },
        fast: {
            name: 'Rápido',
            healthMultiplier: 0.7,
            speedMultiplier: 1.8,
            rewardMultiplier: 1.2,
            scoreMultiplier: 0.8,    // Menos pontos (mais fácil de matar)
            spawnChance: 20, // 20% de chance
            color: '#ffc107'
        },
        tank: {
            name: 'Tanque',
            healthMultiplier: 2.5,
            speedMultiplier: 0.6,
            rewardMultiplier: 1.8,
            scoreMultiplier: 2.5,    // Mais pontos (mais difícil de matar)
            spawnChance: 8, // 8% de chance
            color: '#6c757d'
        },
        elite: {
            name: 'Elite',
            healthMultiplier: 5,
            speedMultiplier: 0.8,
            rewardMultiplier: 3,
            scoreMultiplier: 5,      // Muito mais pontos (chefe)
            spawnChance: 2, // 2% de chance
            color: '#dc3545'
        }
    }
};

// Carregar configurações dos inimigos
export function loadEnemyConfig() {
    const savedConfig = localStorage.getItem('arqueiroConfig');
    if (savedConfig) {
        try {
            const config = JSON.parse(savedConfig);
            return {
                ...DEFAULT_ENEMY_CONFIG,
                ...config,
                enemyTypes: {
                    ...DEFAULT_ENEMY_CONFIG.enemyTypes,
                    ...(config.enemyTypes || {})
                }
            };
        } catch (e) {
            console.error('Erro ao carregar configurações dos inimigos:', e);
        }
    }
    return DEFAULT_ENEMY_CONFIG;
}

// Salvar configurações dos inimigos
export function saveEnemyConfig(enemyConfig) {
    const currentConfig = JSON.parse(localStorage.getItem('arqueiroConfig') || '{}');
    Object.assign(currentConfig, enemyConfig);
    localStorage.setItem('arqueiroConfig', JSON.stringify(currentConfig));
}

// Obter configuração de um tipo específico de inimigo
export function getEnemyTypeConfig(type) {
    const enemyConfig = loadEnemyConfig();
    return enemyConfig.enemyTypes[type] || enemyConfig.enemyTypes.normal;
}

// Escolher tipo de inimigo baseado nas chances
export function chooseEnemyType() {
    const enemyConfig = loadEnemyConfig();
    const rand = Math.random() * 100;
    let cumulative = 0;
    
    for (const [type, config] of Object.entries(enemyConfig.enemyTypes)) {
        cumulative += config.spawnChance;
        if (rand <= cumulative) {
            return type;
        }
    }
    
    return 'normal'; // Fallback
}

// Calcular estatísticas do inimigo baseado no tipo e onda
export function calculateEnemyStats(type, wave, gameConfig) {
    const enemyConfig = loadEnemyConfig();
    const typeConfig = enemyConfig.enemyTypes[type];
    
    // Aplicar multiplicadores do tipo e progressão por onda
    const waveSpeedMultiplier = Math.pow(gameConfig.enemySpeedMultiplier, wave - 1);
    const speed = enemyConfig.enemySpeed * typeConfig.speedMultiplier * waveSpeedMultiplier;
    
    const waveHealthMultiplier = Math.pow(gameConfig.enemyHealthMultiplier, wave - 1);
    const health = Math.floor(
        enemyConfig.enemyBaseHealth * 
        typeConfig.healthMultiplier * 
        waveHealthMultiplier + 
        (wave - 1) * enemyConfig.enemyHealthIncrease
    );
    
    const reward = Math.floor(enemyConfig.enemyReward * typeConfig.rewardMultiplier);
    const size = type === 'elite' ? 30 : type === 'tank' ? 25 : 20;
    
    return {
        speed,
        health,
        maxHealth: health,
        reward,
        size,
        color: typeConfig.color,
        type,
        scoreMultiplier: typeConfig.scoreMultiplier || 1
    };
}

// Validar configuração de inimigo
export function validateEnemyConfig(config) {
    const required = ['enemyBaseHealth', 'enemySpeed', 'enemyReward'];
    for (const field of required) {
        if (typeof config[field] !== 'number' || config[field] <= 0) {
            return false;
        }
    }
    return true;
}

// Obter configuração de onda
export function getWaveConfig() {
    const enemyConfig = loadEnemyConfig();
    return {
        baseEnemies: enemyConfig.enemiesPerWave,
        enemiesIncrease: enemyConfig.enemiesIncrease
    };
} 