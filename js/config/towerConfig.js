// Constantes para valores padrão
const DEFAULT_UPGRADE_VALUES = {
    DAMAGE_MULTIPLIER: 1.3,
    RANGE_MULTIPLIER: 1.1,
    FIRE_RATE_MULTIPLIER: 0.9,
    MIN_FIRE_RATE: 15,
    UPGRADE_DAMAGE_PERCENT: 30,
    UPGRADE_RANGE_PERCENT: 10,
    UPGRADE_SPEED_PERCENT: -10
};

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
        image: 'assets/imagen/Torres/arqueiro.png',
        maxLevel: 5,
        upgradeDamage: DEFAULT_UPGRADE_VALUES.UPGRADE_DAMAGE_PERCENT,
        upgradeRange: DEFAULT_UPGRADE_VALUES.UPGRADE_RANGE_PERCENT,
        upgradeSpeed: DEFAULT_UPGRADE_VALUES.UPGRADE_SPEED_PERCENT
    },
    cannon: {
        name: 'Canhão',
        cost: 75,
        range: 100,
        damage: 25,
        fireRate: 1500,
        color: '#e74a3b',
        icon: '🚀',
        image: 'assets/imagen/Torres/canhao.png',
        maxLevel: 5,
        upgradeDamage: DEFAULT_UPGRADE_VALUES.UPGRADE_DAMAGE_PERCENT,
        upgradeRange: DEFAULT_UPGRADE_VALUES.UPGRADE_RANGE_PERCENT,
        upgradeSpeed: DEFAULT_UPGRADE_VALUES.UPGRADE_SPEED_PERCENT,
        areaRadius: 48,
        areaDamageMultiplier: 100
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
        image: 'assets/imagen/Torres/magica.png',
        maxLevel: 5,
        upgradeDamage: DEFAULT_UPGRADE_VALUES.UPGRADE_DAMAGE_PERCENT,
        upgradeRange: DEFAULT_UPGRADE_VALUES.UPGRADE_RANGE_PERCENT,
        upgradeSpeed: DEFAULT_UPGRADE_VALUES.UPGRADE_SPEED_PERCENT
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
        image: 'assets/imagen/Torres/tesla.png',
        maxLevel: 5,
        upgradeDamage: DEFAULT_UPGRADE_VALUES.UPGRADE_DAMAGE_PERCENT,
        upgradeRange: DEFAULT_UPGRADE_VALUES.UPGRADE_RANGE_PERCENT,
        upgradeSpeed: DEFAULT_UPGRADE_VALUES.UPGRADE_SPEED_PERCENT
    },
    special: {
        name: 'Especial',
        icon: '🌟',
        color: '#8e44ad',
        damage: 40,
        range: 200,
        fireRate: 500,
        cost: 300,
        effect: 'Atira em todos os inimigos a cada 0.5s',
        maxLevel: 5,
        upgradeDamage: DEFAULT_UPGRADE_VALUES.UPGRADE_DAMAGE_PERCENT,
        upgradeRange: DEFAULT_UPGRADE_VALUES.UPGRADE_RANGE_PERCENT,
        upgradeSpeed: DEFAULT_UPGRADE_VALUES.UPGRADE_SPEED_PERCENT
    }
};

// Chave para localStorage
const STORAGE_KEY = 'arqueiroConfig';

/**
 * Carrega configurações das torres do localStorage
 * @returns {Object} Configurações das torres
 */
export function loadTowerConfig() {
    try {
        const savedConfig = localStorage.getItem(STORAGE_KEY);
        if (!savedConfig) return DEFAULT_TOWER_TYPES;

        const config = JSON.parse(savedConfig);
        if (!config.towers) return DEFAULT_TOWER_TYPES;

        // Mescla configurações salvas com padrões
        return {
            archer: { ...DEFAULT_TOWER_TYPES.archer, ...config.towers.archer },
            cannon: { ...DEFAULT_TOWER_TYPES.cannon, ...config.towers.cannon },
            magic: { ...DEFAULT_TOWER_TYPES.magic, ...config.towers.magic },
            tesla: { ...DEFAULT_TOWER_TYPES.tesla, ...config.towers.tesla },
            special: { ...DEFAULT_TOWER_TYPES.special, ...config.towers.special }
        };
    } catch (error) {
        console.warn('Erro ao carregar configurações das torres:', error);
        return DEFAULT_TOWER_TYPES;
    }
}

/**
 * Salva configurações das torres no localStorage
 * @param {Object} towerConfig - Configurações das torres
 */
export function saveTowerConfig(towerConfig) {
    try {
        const currentConfig = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        currentConfig.towers = towerConfig;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(currentConfig));
    } catch (error) {
        console.error('Erro ao salvar configurações das torres:', error);
    }
}

/**
 * Obtém configuração de uma torre específica
 * @param {string} type - Tipo da torre
 * @returns {Object} Configuração da torre
 */
export function getTowerConfig(type) {
    const towerTypes = loadTowerConfig();
    return towerTypes[type] || DEFAULT_TOWER_TYPES[type];
}

/**
 * Aplica evolução a uma torre baseada no nível
 * @param {Object} baseConfig - Configuração base da torre
 * @param {number} level - Nível da torre
 * @returns {Object} Configuração atualizada da torre
 */
export function applyTowerUpgrade(baseConfig, level) {
    if (level <= 1) return baseConfig;

    return {
        ...baseConfig,
        damage: Math.floor(baseConfig.damage * Math.pow(DEFAULT_UPGRADE_VALUES.DAMAGE_MULTIPLIER, level - 1)),
        range: Math.floor(baseConfig.range * Math.pow(DEFAULT_UPGRADE_VALUES.RANGE_MULTIPLIER, level - 1)),
        fireRate: Math.max(
            DEFAULT_UPGRADE_VALUES.MIN_FIRE_RATE, 
            Math.floor(baseConfig.fireRate * Math.pow(DEFAULT_UPGRADE_VALUES.FIRE_RATE_MULTIPLIER, level - 1))
        )
    };
} 