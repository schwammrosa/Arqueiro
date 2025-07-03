// Configurações padrão das torres
export const DEFAULT_TOWER_TYPES = {
    archer: {
        name: 'Arqueiro',
        cost: 50,
        range: 120,
        damage: 15,
        fireRate: 1000,
        color: '#4e73df',
        icon: '🏹'
    },
    cannon: {
        name: 'Canhão',
        cost: 75,
        range: 100,
        damage: 25,
        fireRate: 1500,
        color: '#e74a3b',
        icon: '💣'
    },
    magic: {
        name: 'Mágica',
        cost: 100,
        range: 140,
        damage: 20,
        fireRate: 800,
        color: '#36b9cc',
        icon: '🔮'
    },
    tesla: {
        name: 'Tesla',
        cost: 120,
        range: 110,
        damage: 18,
        fireRate: 1200,
        color: '#7d5fff',
        icon: '⚡'
    },
    special: {
        name: 'Torre Especial',
        icon: '🌟',
        color: '#8e44ad',
        damage: 80,
        range: 9999,
        fireRate: 120,
        cost: 200,
        effect: 'Atira em todos os inimigos a cada 2s'
    }
};

// Carregar configurações das torres
export function loadTowerConfig() {
    const savedConfig = localStorage.getItem('arqueiroConfig');
    if (savedConfig) {
        try {
            const config = JSON.parse(savedConfig);
            if (config.towers) {
                return {
                    archer: { ...DEFAULT_TOWER_TYPES.archer, ...config.towers.archer },
                    cannon: { ...DEFAULT_TOWER_TYPES.cannon, ...config.towers.cannon },
                    magic: { ...DEFAULT_TOWER_TYPES.magic, ...config.towers.magic },
                    tesla: { ...DEFAULT_TOWER_TYPES.tesla, ...config.towers.tesla },
                    special: { ...DEFAULT_TOWER_TYPES.special, ...config.towers.special }
                };
            }
        } catch (e) {
            console.error('Erro ao carregar configurações das torres:', e);
        }
    }
    return DEFAULT_TOWER_TYPES;
}

// Salvar configurações das torres
export function saveTowerConfig(towerConfig) {
    const currentConfig = JSON.parse(localStorage.getItem('arqueiroConfig') || '{}');
    currentConfig.towers = towerConfig;
    localStorage.setItem('arqueiroConfig', JSON.stringify(currentConfig));
}

// Obter configuração de uma torre específica
export function getTowerConfig(type) {
    const towerTypes = loadTowerConfig();
    return towerTypes[type] || DEFAULT_TOWER_TYPES[type];
}

// Validar configuração de torre
export function validateTowerConfig(config) {
    const required = ['cost', 'range', 'damage', 'fireRate'];
    for (const field of required) {
        if (typeof config[field] !== 'number' || config[field] <= 0) {
            return false;
        }
    }
    return true;
}

// Aplicar evolução a uma torre
export function applyTowerUpgrade(baseConfig, level) {
    return {
        ...baseConfig,
        damage: Math.floor(baseConfig.damage * Math.pow(1.3, level - 1)),
        range: Math.floor(baseConfig.range * Math.pow(1.1, level - 1)),
        fireRate: Math.max(15, Math.floor(baseConfig.fireRate * Math.pow(0.9, level - 1)))
    };
} 