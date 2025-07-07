// Arquivo central de configurações
export * from './gameConfig.js';
export * from './towerConfig.js';
export * from './enemyConfig.js';

/**
 * Carrega todas as configurações do jogo
 * @returns {Object} Objeto com todas as configurações
 */
export function loadAllConfigs() {
    return {
        game: loadGameConfig(),
        towers: loadTowerConfig(),
        enemies: loadEnemyConfig()
    };
}

/**
 * Salva todas as configurações no localStorage
 * @param {Object} configs - Objeto com as configurações a serem salvas
 * @returns {boolean} True se salvou com sucesso
 */
export function saveAllConfigs(configs) {
    try {
        // Salva configurações do jogo
        if (configs.game) {
            saveGameConfig(configs.game);
        }
        
        // Salva configurações das torres
        if (configs.towers) {
            saveTowerConfig(configs.towers);
        }
        
        // Salva configurações dos inimigos
        if (configs.enemies) {
            saveEnemyConfig(configs.enemies);
        }
        
        return true;
    } catch (error) {
        console.error('Erro ao salvar configurações:', error);
        return false;
    }
}

/**
 * Valida todas as configurações
 * @param {Object} configs - Configurações a serem validadas
 * @returns {Object} Resultado da validação {valid: boolean, errors: string[]}
 */
export function validateAllConfigs(configs) {
    const errors = [];
    
    // Valida configurações do jogo
    if (!configs.game || typeof configs.game !== 'object') {
        errors.push('Configurações do jogo inválidas');
    } else {
        const requiredGameFields = ['initialHealth', 'initialGold', 'gridSize'];
        for (const field of requiredGameFields) {
            if (typeof configs.game[field] !== 'number' || configs.game[field] <= 0) {
                errors.push(`Campo obrigatório do jogo inválido: ${field}`);
            }
        }
    }
    
    // Valida configurações das torres
    if (!configs.towers || typeof configs.towers !== 'object') {
        errors.push('Configurações das torres inválidas');
    } else {
        const requiredTowerFields = ['cost', 'range', 'damage', 'fireRate'];
        for (const [towerType, towerConfig] of Object.entries(configs.towers)) {
            for (const field of requiredTowerFields) {
                if (typeof towerConfig[field] !== 'number' || towerConfig[field] <= 0) {
                    errors.push(`Campo obrigatório da torre ${towerType} inválido: ${field}`);
                }
            }
        }
    }
    
    // Valida configurações dos inimigos
    if (!configs.enemies || typeof configs.enemies !== 'object') {
        errors.push('Configurações dos inimigos inválidas');
    } else {
        if (!configs.enemies.enemyTypes || typeof configs.enemies.enemyTypes !== 'object') {
            errors.push('Tipos de inimigos inválidos');
        } else {
            const requiredEnemyFields = ['healthMultiplier', 'speedMultiplier', 'rewardMultiplier', 'spawnChance'];
            for (const [enemyType, enemyConfig] of Object.entries(configs.enemies.enemyTypes)) {
                for (const field of requiredEnemyFields) {
                    if (typeof enemyConfig[field] !== 'number' || enemyConfig[field] < 0) {
                        errors.push(`Campo obrigatório do inimigo ${enemyType} inválido: ${field}`);
                    }
                }
            }
        }
    }
    
    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Reseta todas as configurações para os valores padrão
 * @returns {Object} Configurações padrão
 */
export function resetAllConfigs() {
    // Remove todas as configurações salvas
    localStorage.removeItem('arqueiroConfig');
    
    // Retorna configurações padrão
    return {
        game: loadGameConfig(),
        towers: loadTowerConfig(),
        enemies: loadEnemyConfig()
    };
} 