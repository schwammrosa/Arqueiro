// Configurações padrão dos inimigos
export const DEFAULT_ENEMY_CONFIG = {
    // Configurações básicas
    enemyBaseHealth: 50,
    enemyHealthIncrease: 15,
    enemySpeed: 1.8,
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
            scoreMultiplier: 1,
            spawnChance: 70,
            color: '#dc3545',
            size: 20
        },
        fast: {
            name: 'Rápido',
            healthMultiplier: 0.7,
            speedMultiplier: 1.8,
            rewardMultiplier: 1.2,
            scoreMultiplier: 0.8,
            spawnChance: 20,
            color: '#ffc107',
            size: 20
        },
        tank: {
            name: 'Tanque',
            healthMultiplier: 2.5,
            speedMultiplier: 0.6,
            rewardMultiplier: 1.8,
            scoreMultiplier: 2.5,
            spawnChance: 8,
            color: '#6c757d',
            size: 25
        },
        elite: {
            name: 'Elite',
            healthMultiplier: 5,
            speedMultiplier: 0.8,
            rewardMultiplier: 3,
            scoreMultiplier: 5,
            spawnChance: 2,
            color: '#dc3545',
            size: 30
        }
    }
};

// Constantes para valores mágicos
const STORAGE_KEY = 'arqueiroConfig';
const TOTAL_SPAWN_CHANCE = 100;
const DEFAULT_ENEMY_TYPE = 'normal';

/**
 * Carrega configurações dos inimigos do localStorage
 * @returns {Object} Configuração dos inimigos
 */
export function loadEnemyConfig() {
    const savedConfig = localStorage.getItem(STORAGE_KEY);
    if (!savedConfig) {
        return DEFAULT_ENEMY_CONFIG;
    }

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
    } catch (error) {
        console.warn('Erro ao carregar configurações dos inimigos:', error);
        return DEFAULT_ENEMY_CONFIG;
    }
}

/**
 * Salva configurações dos inimigos no localStorage
 * @param {Object} enemyConfig - Configuração a ser salva
 */
export function saveEnemyConfig(enemyConfig) {
    try {
        const currentConfig = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        const updatedConfig = { ...currentConfig, ...enemyConfig };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedConfig));
    } catch (error) {
        console.error('Erro ao salvar configurações dos inimigos:', error);
    }
}

/**
 * Escolhe tipo de inimigo baseado nas chances de spawn
 * @returns {string} Tipo do inimigo escolhido
 */
export function chooseEnemyType() {
    const enemyConfig = loadEnemyConfig();
    const randomValue = Math.random() * TOTAL_SPAWN_CHANCE;
    let cumulativeChance = 0;
    
    for (const [type, config] of Object.entries(enemyConfig.enemyTypes)) {
        cumulativeChance += config.spawnChance;
        if (randomValue <= cumulativeChance) {
            return type;
        }
    }
    
    return DEFAULT_ENEMY_TYPE;
}

/**
 * Calcula estatísticas do inimigo baseado no tipo e onda
 * @param {string} type - Tipo do inimigo
 * @param {number} wave - Número da onda
 * @param {Object} gameConfig - Configuração do jogo
 * @returns {Object} Estatísticas calculadas do inimigo
 */
export function calculateEnemyStats(type, wave, gameConfig) {
    const enemyConfig = loadEnemyConfig();
    const typeConfig = enemyConfig.enemyTypes[type] || enemyConfig.enemyTypes[DEFAULT_ENEMY_TYPE];
    
    // Calcula multiplicadores baseados na onda
    const waveSpeedMultiplier = Math.pow(gameConfig.enemySpeedMultiplier, wave - 1);
    const waveHealthMultiplier = Math.pow(gameConfig.enemyHealthMultiplier, wave - 1);
    
    // Calcula estatísticas finais
    const speed = enemyConfig.enemySpeed * typeConfig.speedMultiplier * waveSpeedMultiplier;
    const health = Math.floor(
        enemyConfig.enemyBaseHealth * 
        typeConfig.healthMultiplier * 
        waveHealthMultiplier + 
        (wave - 1) * enemyConfig.enemyHealthIncrease
    );
    const reward = Math.floor(enemyConfig.enemyReward * typeConfig.rewardMultiplier);
    
    return {
        speed,
        health,
        maxHealth: health,
        reward,
        size: typeConfig.size,
        color: typeConfig.color,
        type,
        scoreMultiplier: typeConfig.scoreMultiplier
    };
} 