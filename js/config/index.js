// Arquivo central de configurações
export * from './gameConfig.js';
export * from './towerConfig.js';
export * from './enemyConfig.js';

// Função para carregar todas as configurações
export function loadAllConfigs() {
    return {
        game: loadGameConfig(),
        towers: loadTowerConfig(),
        enemies: loadEnemyConfig()
    };
}

// Função para salvar todas as configurações
export function saveAllConfigs(configs) {
    const allConfigs = {
        ...configs.game,
        towers: configs.towers,
        enemyTypes: configs.enemies.enemyTypes,
        ...configs.enemies
    };
    
    return saveGameConfig(allConfigs);
}

// Função para validar todas as configurações
export function validateAllConfigs(configs) {
    const gameValid = configs.game && typeof configs.game === 'object';
    const towersValid = configs.towers && Object.keys(configs.towers).length > 0;
    const enemiesValid = configs.enemies && configs.enemies.enemyTypes;
    
    return gameValid && towersValid && enemiesValid;
} 