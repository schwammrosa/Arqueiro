// Configurações padrão das torres
export const DEFAULT_TOWER_TYPES = {
    archer: {
        name: 'Arqueiro',
        cost: 50,
        range: 120,
        damage: 15,
        fireRate: 1000,
        color: '#4e73df',
        icon: '🏹',
        image: 'assets/imagen/Torres/arqueiro.png'
    },
    cannon: {
        name: 'Canhão',
        cost: 75,
        range: 100,
        damage: 25,
        fireRate: 1500,
        color: '#e74a3b',
        icon: '🚀',
        image: 'assets/imagen/Torres/canhao.png'
    },
    magic: {
        name: 'Mágica',
        cost: 95,
        range: 140,
        damage: 20,
        fireRate: 1000,
        color: '#36b9cc',
        icon: '🔮',
        slowEffect: 40, // 40% da velocidade original (60% de redução)
        freezeDuration: 1, // 1 segundo de duração
        image: 'assets/imagen/Torres/magica.png'
    },
    tesla: {
        name: 'Tesla',
        cost: 95,
        range: 120,
        damage: 20,
        fireRate: 1000,
        color: '#7d5fff',
        icon: '⚡',
        chainMax: 5,        // Máximo de alvos encadeados
        chainRadius: 1.2,   // Multiplicador do alcance para encadeamento
        image: 'assets/imagen/Torres/tesla.png'
    },
    special: {
        name: 'Especial',
        icon: '🌟',
        color: '#8e44ad',
        damage: 40,
        range: 200,
        fireRate: 500,
        cost: 300,
        effect: 'Atira em todos os inimigos a cada 0.5s'
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
            // Erro ao carregar configurações das torres
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