// Importar configurações dos módulos
import { 
    DEFAULT_GAME_CONFIG, 
    loadGameConfig, 
    saveGameConfig, 
    resetGameConfig, 
    exportGameConfig, 
    importGameConfig,
    notifyConfigChanged
} from './js/config/gameConfig.js';

import { 
    DEFAULT_TOWER_TYPES, 
    loadTowerConfig, 
    saveTowerConfig 
} from './js/config/towerConfig.js';

import { 
    DEFAULT_ENEMY_CONFIG, 
    loadEnemyConfig, 
    saveEnemyConfig 
} from './js/config/enemyConfig.js';

// Configurações padrão do jogo
const DEFAULT_CONFIG = {
    // Configurações gerais
    initialHealth: 20,
    initialGold: 100,
    gridSize: 40,
    waveDelay: 3000,
    upgradeBaseCost: 50,
    sellPercentage: 50,
    pointsPerKill: 8,           // Reduzido de 10 para 8 (compensar multiplicadores)
    waveBonusMultiplier: 40,    // Reduzido de 50 para 40 (temos bônus exponencial)
    upgradeBonusMultiplier: 20, // Reduzido de 25 para 20 (mais equilibrado)
    waveDelaySeconds: 5,
    goldMultiplier: 1,
    enemyHealthMultiplier: 1.1,
    enemySpeedMultiplier: 1.05,
    enemySpawnRate: 1000,
    
    // Configurações das torres
    towers: {
        archer: {
            cost: 50,
            range: 120,
            damage: 15,
            fireRate: 1000
        },
        cannon: {
            cost: 75,
            range: 100,
            damage: 25,
            fireRate: 1500
        },
        magic: {
            cost: 100,
            range: 140,
            damage: 20,
            fireRate: 800
        },
        tesla: {
            cost: 120,
            range: 150,
            damage: 30,
            fireRate: 1000
        }
    },
    
    // Configurações dos inimigos
    enemyBaseHealth: 50,
    enemyHealthIncrease: 10,
    enemySpeed: 0.5,
    enemyReward: 10,
    enemiesPerWave: 5,
    enemiesIncrease: 2,
    
    // Configurações visuais
    canvasWidth: 800,
    canvasHeight: 600,
    projectileSpeed: 5,
    projectileSize: 4,
    damageNumberLifetime: 60,
    damageNumberSpeed: 1,
    
    // Configurações de tipos especiais de inimigos
    enemyTypes: {
        normal: {
            name: 'Normal',
            healthMultiplier: 1,
            speedMultiplier: 1,
            rewardMultiplier: 1,
            spawnChance: 70, // 70% de chance
            color: '#dc3545'
        },
        fast: {
            name: 'Rápido',
            healthMultiplier: 0.7,
            speedMultiplier: 1.8,
            rewardMultiplier: 1.2,
            spawnChance: 20, // 20% de chance
            color: '#ffc107'
        },
        tank: {
            name: 'Tanque',
            healthMultiplier: 2.5,
            speedMultiplier: 0.6,
            rewardMultiplier: 1.8,
            spawnChance: 8, // 8% de chance
            color: '#6c757d'
        },
        elite: {
            name: 'Elite',
            healthMultiplier: 5,
            speedMultiplier: 0.8,
            rewardMultiplier: 3,
            spawnChance: 2, // 2% de chance
            color: '#dc3545'
        }
    },
    
    // Caminho padrão
    enemyPath: [
        {x: 0, y: 3}, {x: 1, y: 3}, {x: 2, y: 3}, {x: 3, y: 3}, {x: 4, y: 3},
        {x: 5, y: 3}, {x: 6, y: 3}, {x: 7, y: 3}, {x: 8, y: 3}, {x: 9, y: 3},
        {x: 10, y: 3}, {x: 11, y: 3}, {x: 12, y: 3}, {x: 13, y: 3}, {x: 14, y: 3},
        {x: 15, y: 3}, {x: 16, y: 3}, {x: 17, y: 3}, {x: 18, y: 3}, {x: 19, y: 3}
    ]
};

// Templates de caminhos pré-definidos
const PATH_TEMPLATES = {
    linear: {
        name: 'Linha Reta',
        description: 'Caminho simples em linha reta',
        path: [
            {x: 0, y: 7}, {x: 1, y: 7}, {x: 2, y: 7}, {x: 3, y: 7}, {x: 4, y: 7},
            {x: 5, y: 7}, {x: 6, y: 7}, {x: 7, y: 7}, {x: 8, y: 7}, {x: 9, y: 7},
            {x: 10, y: 7}, {x: 11, y: 7}, {x: 12, y: 7}, {x: 13, y: 7}, {x: 14, y: 7},
            {x: 15, y: 7}, {x: 16, y: 7}, {x: 17, y: 7}, {x: 18, y: 7}, {x: 19, y: 7}
        ]
    },
    zigzag: {
        name: 'Zigzag',
        description: 'Caminho em ziguezague',
        path: [
            {x: 0, y: 3}, {x: 1, y: 3}, {x: 2, y: 3}, {x: 3, y: 3}, {x: 4, y: 3},
            {x: 5, y: 5}, {x: 6, y: 5}, {x: 7, y: 5}, {x: 8, y: 5}, {x: 9, y: 5},
            {x: 10, y: 7}, {x: 11, y: 7}, {x: 12, y: 7}, {x: 13, y: 7}, {x: 14, y: 7},
            {x: 15, y: 9}, {x: 16, y: 9}, {x: 17, y: 9}, {x: 18, y: 9}, {x: 19, y: 9}
        ]
    },
    spiral: {
        name: 'Espiral',
        description: 'Caminho em espiral',
        path: [
            {x: 0, y: 7}, {x: 1, y: 7}, {x: 2, y: 7}, {x: 3, y: 7}, {x: 4, y: 7},
            {x: 5, y: 7}, {x: 6, y: 7}, {x: 7, y: 7}, {x: 8, y: 7}, {x: 9, y: 7},
            {x: 10, y: 7}, {x: 11, y: 7}, {x: 12, y: 7}, {x: 13, y: 7}, {x: 14, y: 7},
            {x: 15, y: 7}, {x: 16, y: 7}, {x: 17, y: 7}, {x: 18, y: 7}, {x: 19, y: 7}
        ]
    },
    maze: {
        name: 'Labirinto',
        description: 'Caminho complexo tipo labirinto',
        path: [
            {x: 0, y: 3}, {x: 1, y: 3}, {x: 2, y: 3}, {x: 3, y: 3}, {x: 4, y: 3},
            {x: 5, y: 3}, {x: 6, y: 3}, {x: 7, y: 3}, {x: 8, y: 3}, {x: 9, y: 3},
            {x: 10, y: 3}, {x: 11, y: 3}, {x: 12, y: 3}, {x: 13, y: 3}, {x: 14, y: 3},
            {x: 15, y: 3}, {x: 16, y: 3}, {x: 17, y: 3}, {x: 18, y: 3}, {x: 19, y: 3}
        ]
    }
};

// Estado atual das configurações
let currentConfig = { ...DEFAULT_GAME_CONFIG };

// Sistema de presets
const PRESETS = {
    easy: {
        name: 'Fácil',
        config: {
            initialHealth: 50,
            initialGold: 150,
            waveDelaySeconds: 8,
            upgradeBaseCost: 50,
            sellPercentage: 75,
            enemyBaseHealth: 30,
            enemyHealthIncrease: 8,
            enemySpeed: 0.3,
            enemyHealthMultiplier: 1.1,
            enemySpeedMultiplier: 1.05,
            enemiesPerWave: 5,
            enemiesIncrease: 2,
            goldMultiplier: 1.5
        }
    },
    medium: {
        name: 'Médio',
        config: {
            initialHealth: 20,
            initialGold: 100,
            waveDelaySeconds: 5,
            upgradeBaseCost: 75,
            sellPercentage: 50,
            enemyBaseHealth: 50,
            enemyHealthIncrease: 15,
            enemySpeed: 0.5,
            enemyHealthMultiplier: 1.25,
            enemySpeedMultiplier: 1.15,
            enemiesPerWave: 8,
            enemiesIncrease: 3,
            goldMultiplier: 1
        }
    },
    hard: {
        name: 'Difícil',
        config: {
            initialHealth: 10,
            initialGold: 75,
            waveDelaySeconds: 3,
            upgradeBaseCost: 100,
            sellPercentage: 25,
            enemyBaseHealth: 80,
            enemyHealthIncrease: 25,
            enemySpeed: 0.8,
            enemyHealthMultiplier: 1.4,
            enemySpeedMultiplier: 1.25,
            enemiesPerWave: 12,
            enemiesIncrease: 4,
            goldMultiplier: 0.8
        }
    }
};

let currentPreset = 'medium';

// Grid do caminho
let pathGrid = [];
const GRID_WIDTH = 20;
const GRID_HEIGHT = 15;

// Estado do editor de caminho
let pathEditorState = {
    isDrawing: false,
    drawMode: 'add', // 'add' ou 'remove'
    isDragging: false,
    lastCell: null,
    zoom: 1
};

// --- HABILIDADES GLOBAIS ---
const SKILL_POINTS_KEY = 'arqueiroUpgradePoints';
const SKILL_TREE_KEY = 'arqueiroSkillTree';

function updateGlobalSkillPointsConfig() {
    const points = parseInt(localStorage.getItem(SKILL_POINTS_KEY) || '0');
    // Atualiza tanto o input quanto o texto, se existirem
    const input = document.getElementById('globalSkillPointsInput');
    if (input) input.value = points;
    const span = document.getElementById('globalSkillPoints');
    if (span) span.textContent = points;
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    loadConfig();
    createPathGrid();
    setupPathEditor(); // Mover para antes de updatePathDisplay
    setupEventListeners();
    updatePathDisplay(); // Mover para depois de setupPathEditor
    updateGlobalSkillPointsConfig();
    // Salvamento automático dos pontos de upgrade globais
    const skillPointsInput = document.getElementById('globalSkillPointsInput');
    if (skillPointsInput) {
        skillPointsInput.value = localStorage.getItem(SKILL_POINTS_KEY) || '0';
        skillPointsInput.addEventListener('change', () => {
            let val = parseInt(skillPointsInput.value) || 0;
            if (val < 0) val = 0;
            if (val > 999) val = 999;
            skillPointsInput.value = val;
            localStorage.setItem(SKILL_POINTS_KEY, val);
            updateGlobalSkillPointsConfig();
            // Se quiser, pode disparar um evento customizado para atualizar a árvore em tempo real
            document.dispatchEvent(new CustomEvent('skillPointsChanged', { detail: { value: val } }));
        });
    }
    // Resetar árvore e pontos
    const resetBtn = document.getElementById('resetSkillTree');
    if (resetBtn) {
        resetBtn.onclick = () => {
            if (confirm('Tem certeza que deseja resetar todos os upgrades globais e pontos?')) {
                localStorage.setItem(SKILL_POINTS_KEY, '0');
                localStorage.setItem(SKILL_TREE_KEY, '{}');
                localStorage.setItem('arqueiroLastRewardedWave', '0'); // Resetar progresso de recompensas
                updateGlobalSkillPointsConfig();
                alert('Árvore de habilidades, pontos e progresso de recompensas resetados!');
            }
        };
    }
    // Carregar e salvar configs das habilidades especiais
    const arrowRainCooldownInput = document.getElementById('arrowRainCooldownConfig');
    const arrowRainDamageInput = document.getElementById('arrowRainDamageConfig');
    const arrowRainRadiusInput = document.getElementById('arrowRainRadiusConfig');
    const iceStormCooldownInput = document.getElementById('iceStormCooldownConfig');
    const iceStormDurationInput = document.getElementById('iceStormDurationConfig');
    const iceStormDamageInput = document.getElementById('iceStormDamageConfig');
    // Carregar valores salvos
    if (arrowRainCooldownInput) arrowRainCooldownInput.value = localStorage.getItem('arrowRainCooldown') || '15';
    if (arrowRainDamageInput) arrowRainDamageInput.value = localStorage.getItem('arrowRainDamage') || '60';
    if (arrowRainRadiusInput) arrowRainRadiusInput.value = localStorage.getItem('arrowRainRadius') || '90';
    if (iceStormCooldownInput) iceStormCooldownInput.value = localStorage.getItem('iceStormCooldown') || '30';
    if (iceStormDurationInput) iceStormDurationInput.value = localStorage.getItem('iceStormDuration') || '4';
    if (iceStormDamageInput) iceStormDamageInput.value = localStorage.getItem('iceStormDamage') || '100';
    // Salvar ao alterar
    if (arrowRainCooldownInput) arrowRainCooldownInput.onchange = () => localStorage.setItem('arrowRainCooldown', arrowRainCooldownInput.value);
    if (arrowRainDamageInput) arrowRainDamageInput.onchange = () => localStorage.setItem('arrowRainDamage', arrowRainDamageInput.value);
    if (arrowRainRadiusInput) arrowRainRadiusInput.onchange = () => localStorage.setItem('arrowRainRadius', arrowRainRadiusInput.value);
    if (iceStormCooldownInput) iceStormCooldownInput.onchange = () => localStorage.setItem('iceStormCooldown', iceStormCooldownInput.value);
    if (iceStormDurationInput) iceStormDurationInput.onchange = () => localStorage.setItem('iceStormDuration', iceStormDurationInput.value);
    if (iceStormDamageInput) iceStormDamageInput.onchange = () => localStorage.setItem('iceStormDamage', iceStormDamageInput.value);
});

// Carregar configurações salvas
function loadConfig() {
    currentConfig = loadGameConfig();
    applyConfigToFields();
}

// Aplicar configurações aos campos do formulário
function applyConfigToFields() {
    // Configurações gerais
    let el;
    el = document.getElementById('initialHealth'); if (el) el.value = currentConfig.initialHealth;
    el = document.getElementById('initialGold'); if (el) el.value = currentConfig.initialGold;
    el = document.getElementById('gridSize'); if (el) el.value = currentConfig.gridSize;
    el = document.getElementById('waveDelay'); if (el) el.value = currentConfig.waveDelay;
    el = document.getElementById('upgradeBaseCost'); if (el) el.value = currentConfig.upgradeBaseCost || 50;
    el = document.getElementById('sellPercentage'); if (el) el.value = currentConfig.sellPercentage || 50;
    el = document.getElementById('pointsPerKill'); if (el) el.value = currentConfig.pointsPerKill || 8;
    el = document.getElementById('waveBonusMultiplier'); if (el) el.value = currentConfig.waveBonusMultiplier || 40;
    el = document.getElementById('upgradeBonusMultiplier'); if (el) el.value = currentConfig.upgradeBonusMultiplier || 20;
    el = document.getElementById('waveDelaySeconds'); if (el) el.value = currentConfig.waveDelaySeconds || 5;

    el = document.getElementById('goldMultiplier'); if (el) el.value = currentConfig.goldMultiplier;
    el = document.getElementById('enemyHealthMultiplier'); if (el) el.value = currentConfig.enemyHealthMultiplier;
    el = document.getElementById('enemySpeedMultiplier'); if (el) el.value = currentConfig.enemySpeedMultiplier;
    el = document.getElementById('enemySpawnRate'); if (el) el.value = currentConfig.enemySpawnRate;
    
    // Configurações das torres
    const towerConfig = loadTowerConfig();
    el = document.getElementById('archerCost'); if (el) el.value = towerConfig.archer.cost;
    el = document.getElementById('archerRange'); if (el) el.value = towerConfig.archer.range;
    el = document.getElementById('archerDamage'); if (el) el.value = towerConfig.archer.damage;
    el = document.getElementById('archerFireRate'); if (el) el.value = towerConfig.archer.fireRate;
    el = document.getElementById('archerUpgradeDamage'); if (el) el.value = towerConfig.archer.upgradeDamage || 30;
    el = document.getElementById('archerUpgradeRange'); if (el) el.value = towerConfig.archer.upgradeRange || 10;
    el = document.getElementById('archerUpgradeSpeed'); if (el) el.value = towerConfig.archer.upgradeSpeed || -10;
    
    el = document.getElementById('cannonCost'); if (el) el.value = towerConfig.cannon.cost;
    el = document.getElementById('cannonRange'); if (el) el.value = towerConfig.cannon.range;
    el = document.getElementById('cannonDamage'); if (el) el.value = towerConfig.cannon.damage;
    el = document.getElementById('cannonFireRate'); if (el) el.value = towerConfig.cannon.fireRate;
    el = document.getElementById('cannonUpgradeDamage'); if (el) el.value = towerConfig.cannon.upgradeDamage || 30;
    el = document.getElementById('cannonUpgradeRange'); if (el) el.value = towerConfig.cannon.upgradeRange || 10;
    el = document.getElementById('cannonUpgradeSpeed'); if (el) el.value = towerConfig.cannon.upgradeSpeed || -10;
    
    el = document.getElementById('magicCost'); if (el) el.value = towerConfig.magic.cost;
    el = document.getElementById('magicRange'); if (el) el.value = towerConfig.magic.range;
    el = document.getElementById('magicDamage'); if (el) el.value = towerConfig.magic.damage;
    el = document.getElementById('magicFireRate'); if (el) el.value = towerConfig.magic.fireRate;
    el = document.getElementById('magicUpgradeDamage'); if (el) el.value = towerConfig.magic.upgradeDamage || 30;
    el = document.getElementById('magicUpgradeRange'); if (el) el.value = towerConfig.magic.upgradeRange || 10;
    el = document.getElementById('magicUpgradeSpeed'); if (el) el.value = towerConfig.magic.upgradeSpeed || -10;
    
    // Tesla
    if (towerConfig.tesla) {
        el = document.getElementById('teslaCost'); if (el) el.value = towerConfig.tesla.cost;
        el = document.getElementById('teslaRange'); if (el) el.value = towerConfig.tesla.range;
        el = document.getElementById('teslaDamage'); if (el) el.value = towerConfig.tesla.damage;
        el = document.getElementById('teslaFireRate'); if (el) el.value = towerConfig.tesla.fireRate;
        el = document.getElementById('teslaUpgradeDamage'); if (el) el.value = towerConfig.tesla.upgradeDamage || 30;
        el = document.getElementById('teslaUpgradeRange'); if (el) el.value = towerConfig.tesla.upgradeRange || 10;
        el = document.getElementById('teslaUpgradeSpeed'); if (el) el.value = towerConfig.tesla.upgradeSpeed || -10;
    }
    
    // Configurações dos inimigos
    const enemyConfig = loadEnemyConfig();
    el = document.getElementById('enemyBaseHealth'); if (el) el.value = enemyConfig.enemyBaseHealth;
    el = document.getElementById('enemyHealthIncrease'); if (el) el.value = enemyConfig.enemyHealthIncrease;
    el = document.getElementById('enemySpeed'); if (el) el.value = enemyConfig.enemySpeed;
    el = document.getElementById('enemyReward'); if (el) el.value = enemyConfig.enemyReward;
    el = document.getElementById('enemiesPerWave'); if (el) el.value = enemyConfig.enemiesPerWave;
    el = document.getElementById('enemiesIncrease'); if (el) el.value = enemyConfig.enemiesIncrease;
    
    // Configurações visuais
    el = document.getElementById('canvasWidth'); if (el) el.value = currentConfig.canvasWidth;
    el = document.getElementById('canvasHeight'); if (el) el.value = currentConfig.canvasHeight;
    el = document.getElementById('projectileSpeed'); if (el) el.value = currentConfig.projectileSpeed;
    el = document.getElementById('projectileSize'); if (el) el.value = currentConfig.projectileSize;
    el = document.getElementById('damageNumberLifetime'); if (el) el.value = currentConfig.damageNumberLifetime || 60;
    el = document.getElementById('damageNumberSpeed'); if (el) el.value = currentConfig.damageNumberSpeed || 1;
    
    // Configurações de tipos especiais de inimigos
    const enemyTypes = currentConfig.enemyTypes || DEFAULT_CONFIG.enemyTypes;
    
    // Normal
    el = document.getElementById('normalHealthMultiplier'); if (el) el.value = enemyTypes.normal.healthMultiplier;
    el = document.getElementById('normalSpeedMultiplier'); if (el) el.value = enemyTypes.normal.speedMultiplier;
    el = document.getElementById('normalRewardMultiplier'); if (el) el.value = enemyTypes.normal.rewardMultiplier;
    el = document.getElementById('normalSpawnChance'); if (el) el.value = enemyTypes.normal.spawnChance;
    el = document.getElementById('normalScoreMultiplier'); if (el) el.value = enemyTypes.normal.scoreMultiplier || 1;
    
    // Rápido
    el = document.getElementById('fastHealthMultiplier'); if (el) el.value = enemyTypes.fast.healthMultiplier;
    el = document.getElementById('fastSpeedMultiplier'); if (el) el.value = enemyTypes.fast.speedMultiplier;
    el = document.getElementById('fastRewardMultiplier'); if (el) el.value = enemyTypes.fast.rewardMultiplier;
    el = document.getElementById('fastSpawnChance'); if (el) el.value = enemyTypes.fast.spawnChance;
    el = document.getElementById('fastScoreMultiplier'); if (el) el.value = enemyTypes.fast.scoreMultiplier || 0.8;
    
    // Tanque
    el = document.getElementById('tankHealthMultiplier'); if (el) el.value = enemyTypes.tank.healthMultiplier;
    el = document.getElementById('tankSpeedMultiplier'); if (el) el.value = enemyTypes.tank.speedMultiplier;
    el = document.getElementById('tankRewardMultiplier'); if (el) el.value = enemyTypes.tank.rewardMultiplier;
    el = document.getElementById('tankSpawnChance'); if (el) el.value = enemyTypes.tank.spawnChance;
    el = document.getElementById('tankScoreMultiplier'); if (el) el.value = enemyTypes.tank.scoreMultiplier || 2.5;
    
    // Elite
    el = document.getElementById('eliteHealthMultiplier'); if (el) el.value = enemyTypes.elite.healthMultiplier;
    el = document.getElementById('eliteSpeedMultiplier'); if (el) el.value = enemyTypes.elite.speedMultiplier;
    el = document.getElementById('eliteRewardMultiplier'); if (el) el.value = enemyTypes.elite.rewardMultiplier;
    el = document.getElementById('eliteSpawnChance'); if (el) el.value = enemyTypes.elite.spawnChance;
    el = document.getElementById('eliteScoreMultiplier'); if (el) el.value = enemyTypes.elite.scoreMultiplier || 5;

    // Canhão - parâmetros especiais
    if (towerConfig.cannon) {
        el = document.getElementById('cannonAreaRadius'); if (el) el.value = towerConfig.cannon.areaRadius || 48;
        el = document.getElementById('cannonAreaDamageMultiplier'); if (el) el.value = towerConfig.cannon.areaDamageMultiplier || 100;
    }
    // Mágica - parâmetro especial
    if (towerConfig.magic) {
        el = document.getElementById('magicSlowEffect'); if (el) el.value = towerConfig.magic.slowEffect || 50;
        el = document.getElementById('magicFreezeDuration'); if (el) el.value = towerConfig.magic.freezeDuration || 1;
    }
    // Tesla - parâmetros especiais
    if (towerConfig.tesla) {
        el = document.getElementById('teslaChainMax'); if (el) el.value = towerConfig.tesla.chainMax || 5;
        el = document.getElementById('teslaChainRadius'); if (el) el.value = towerConfig.tesla.chainRadius || 1.2;
    }

    // Torre Especial
    if (towerConfig.special) {
        el = document.getElementById('specialCost'); if (el) el.value = towerConfig.special.cost;
        el = document.getElementById('specialRange'); if (el) el.value = towerConfig.special.range;
        el = document.getElementById('specialDamage'); if (el) el.value = towerConfig.special.damage;
        el = document.getElementById('specialFireRate'); if (el) el.value = towerConfig.special.fireRate;
        el = document.getElementById('specialColor'); if (el) el.value = towerConfig.special.color || '#8e44ad';
        el = document.getElementById('specialEffect'); if (el) el.value = towerConfig.special.effect || '';
    }
    
    // Configurações de habilidades especiais
    el = document.getElementById('arrowRainCooldownConfig'); if (el) el.value = currentConfig.arrowRainCooldown || 25;
    el = document.getElementById('arrowRainDamageConfig'); if (el) el.value = currentConfig.arrowRainDamage || 40;
    el = document.getElementById('arrowRainRadiusConfig'); if (el) el.value = currentConfig.arrowRainRadius || 90;
    el = document.getElementById('iceStormCooldownConfig'); if (el) el.value = currentConfig.iceStormCooldown || 30;
    el = document.getElementById('iceStormDurationConfig'); if (el) el.value = currentConfig.iceStormDuration || 2;
    el = document.getElementById('iceStormDamageConfig'); if (el) el.value = currentConfig.iceStormDamage || 0;
}

// Coletar configurações dos campos do formulário
function collectConfigFromFields() {
    const config = {
        // Configurações gerais
        initialHealth: parseInt(document.getElementById('initialHealth').value),
        initialGold: parseInt(document.getElementById('initialGold').value),
        gridSize: parseInt(document.getElementById('gridSize').value),
        waveDelay: parseInt(document.getElementById('waveDelay').value),
        upgradeBaseCost: parseInt(document.getElementById('upgradeBaseCost').value),
        sellPercentage: parseInt(document.getElementById('sellPercentage').value),
        pointsPerKill: parseInt(document.getElementById('pointsPerKill').value),
        waveBonusMultiplier: parseInt(document.getElementById('waveBonusMultiplier').value),
        upgradeBonusMultiplier: parseInt(document.getElementById('upgradeBonusMultiplier').value),
        waveDelaySeconds: parseInt(document.getElementById('waveDelaySeconds').value),
    
        goldMultiplier: parseFloat(document.getElementById('goldMultiplier').value),
        enemyHealthMultiplier: parseFloat(document.getElementById('enemyHealthMultiplier').value),
        enemySpeedMultiplier: parseFloat(document.getElementById('enemySpeedMultiplier').value),
        enemySpawnRate: parseInt(document.getElementById('enemySpawnRate').value),
        
        // Configurações visuais
        canvasWidth: parseInt(document.getElementById('canvasWidth').value),
        canvasHeight: parseInt(document.getElementById('canvasHeight').value),
        projectileSpeed: parseFloat(document.getElementById('projectileSpeed').value),
        projectileSize: parseInt(document.getElementById('projectileSize').value),
        damageNumberLifetime: parseInt(document.getElementById('damageNumberLifetime').value),
        damageNumberSpeed: parseFloat(document.getElementById('damageNumberSpeed').value),
        
        // Configurações de tipos especiais de inimigos
        enemyTypes: {
            normal: {
                name: 'Normal',
                healthMultiplier: parseFloat(document.getElementById('normalHealthMultiplier').value),
                speedMultiplier: parseFloat(document.getElementById('normalSpeedMultiplier').value),
                rewardMultiplier: parseFloat(document.getElementById('normalRewardMultiplier').value),
                spawnChance: parseInt(document.getElementById('normalSpawnChance').value),
                scoreMultiplier: parseFloat(document.getElementById('normalScoreMultiplier').value),
                color: '#dc3545'
            },
            fast: {
                name: 'Rápido',
                healthMultiplier: parseFloat(document.getElementById('fastHealthMultiplier').value),
                speedMultiplier: parseFloat(document.getElementById('fastSpeedMultiplier').value),
                rewardMultiplier: parseFloat(document.getElementById('fastRewardMultiplier').value),
                spawnChance: parseInt(document.getElementById('fastSpawnChance').value),
                scoreMultiplier: parseFloat(document.getElementById('fastScoreMultiplier').value),
                color: '#ffc107'
            },
            tank: {
                name: 'Tanque',
                healthMultiplier: parseFloat(document.getElementById('tankHealthMultiplier').value),
                speedMultiplier: parseFloat(document.getElementById('tankSpeedMultiplier').value),
                rewardMultiplier: parseFloat(document.getElementById('tankRewardMultiplier').value),
                spawnChance: parseInt(document.getElementById('tankSpawnChance').value),
                scoreMultiplier: parseFloat(document.getElementById('tankScoreMultiplier').value),
                color: '#6c757d'
            },
            elite: {
                name: 'Elite',
                healthMultiplier: parseFloat(document.getElementById('eliteHealthMultiplier').value),
                speedMultiplier: parseFloat(document.getElementById('eliteSpeedMultiplier').value),
                rewardMultiplier: parseFloat(document.getElementById('eliteRewardMultiplier').value),
                spawnChance: parseInt(document.getElementById('eliteSpawnChance').value),
                scoreMultiplier: parseFloat(document.getElementById('eliteScoreMultiplier').value),
                color: '#dc3545'
            }
        },
        
        // Configurações das torres
        towers: {
            archer: {
                cost: parseInt(document.getElementById('archerCost').value),
                range: parseInt(document.getElementById('archerRange').value),
                damage: parseInt(document.getElementById('archerDamage').value),
                fireRate: parseInt(document.getElementById('archerFireRate').value),
                upgradeDamage: parseFloat(document.getElementById('archerUpgradeDamage').value),
                upgradeRange: parseFloat(document.getElementById('archerUpgradeRange').value),
                upgradeSpeed: parseFloat(document.getElementById('archerUpgradeSpeed').value)
            },
            cannon: {
                cost: parseInt(document.getElementById('cannonCost').value),
                range: parseInt(document.getElementById('cannonRange').value),
                damage: parseInt(document.getElementById('cannonDamage').value),
                fireRate: parseInt(document.getElementById('cannonFireRate').value),
                upgradeDamage: parseFloat(document.getElementById('cannonUpgradeDamage').value),
                upgradeRange: parseFloat(document.getElementById('cannonUpgradeRange').value),
                upgradeSpeed: parseFloat(document.getElementById('cannonUpgradeSpeed').value),
                areaRadius: parseInt(document.getElementById('cannonAreaRadius').value),
                areaDamageMultiplier: parseInt(document.getElementById('cannonAreaDamageMultiplier').value)
            },
            magic: {
                cost: parseInt(document.getElementById('magicCost').value),
                range: parseInt(document.getElementById('magicRange').value),
                damage: parseInt(document.getElementById('magicDamage').value),
                fireRate: parseInt(document.getElementById('magicFireRate').value),
                upgradeDamage: parseFloat(document.getElementById('magicUpgradeDamage').value),
                upgradeRange: parseFloat(document.getElementById('magicUpgradeRange').value),
                upgradeSpeed: parseFloat(document.getElementById('magicUpgradeSpeed').value),
                slowEffect: parseInt(document.getElementById('magicSlowEffect').value),
                freezeDuration: parseFloat(document.getElementById('magicFreezeDuration').value)
            },
            tesla: {
                cost: parseInt(document.getElementById('teslaCost').value),
                range: parseInt(document.getElementById('teslaRange').value),
                damage: parseInt(document.getElementById('teslaDamage').value),
                fireRate: parseInt(document.getElementById('teslaFireRate').value),
                upgradeDamage: parseFloat(document.getElementById('teslaUpgradeDamage').value),
                upgradeRange: parseFloat(document.getElementById('teslaUpgradeRange').value),
                upgradeSpeed: parseFloat(document.getElementById('teslaUpgradeSpeed').value),
                chainMax: parseInt(document.getElementById('teslaChainMax').value),
                chainRadius: parseFloat(document.getElementById('teslaChainRadius').value)
            },
            special: {
                cost: parseInt(document.getElementById('specialCost').value),
                range: parseInt(document.getElementById('specialRange').value),
                damage: parseInt(document.getElementById('specialDamage').value),
                fireRate: parseInt(document.getElementById('specialFireRate').value),
                color: document.getElementById('specialColor').value,
                effect: document.getElementById('specialEffect').value
            }
        },
        
        // Caminho dos inimigos
        enemyPath: getPathFromGrid(),
        
        // Configurações de habilidades especiais
        arrowRainCooldown: parseInt(document.getElementById('arrowRainCooldownConfig').value),
        arrowRainDamage: parseInt(document.getElementById('arrowRainDamageConfig').value),
        arrowRainRadius: parseInt(document.getElementById('arrowRainRadiusConfig').value),
        iceStormCooldown: parseInt(document.getElementById('iceStormCooldownConfig').value),
        iceStormDuration: parseFloat(document.getElementById('iceStormDurationConfig').value),
        iceStormDamage: parseInt(document.getElementById('iceStormDamageConfig').value)
    };
    
    return config;
}

// Criar grid do caminho
function createPathGrid() {
    const pathGridElement = document.getElementById('pathGrid');
    if (!pathGridElement) return;
    
    // Verificar se o grid já foi criado
    if (pathGridElement.children.length > 0) {
        return; // Já existe, não criar novamente
    }
    
    pathGridElement.innerHTML = '';
    
    for (let y = 0; y < GRID_HEIGHT; y++) {
        for (let x = 0; x < GRID_WIDTH; x++) {
            const cell = document.createElement('div');
            cell.className = 'path-cell';
            cell.dataset.x = x;
            cell.dataset.y = y;
            
            // Event listeners para o editor de caminho
            cell.addEventListener('mousedown', (e) => handleCellMouseDown(e, x, y));
            cell.addEventListener('mouseenter', (e) => handleCellMouseEnter(e, x, y));
            cell.addEventListener('mouseup', handleCellMouseUp);
            
            pathGridElement.appendChild(cell);
        }
    }
    
    // Inicializar grid
    pathGrid = Array(GRID_HEIGHT).fill().map(() => Array(GRID_WIDTH).fill(false));
}

// Criar seção de templates de caminho
function createPathTemplates() {
    const pathSection = document.querySelector('.path-config');
    if (!pathSection) return;
    
    // Verificar se os templates já existem
    if (pathSection.querySelector('.path-templates')) {
        return; // Já existem, não criar novamente
    }
    
    const templatesDiv = document.createElement('div');
    templatesDiv.className = 'path-templates';
    templatesDiv.innerHTML = `
        <h4>📋 Templates Pré-definidos</h4>
        <div class="template-grid">
            <button class="template-btn" data-template="linear">
                <span class="template-name">Linha Reta</span>
                <span class="template-desc">Caminho simples</span>
            </button>
            <button class="template-btn" data-template="zigzag">
                <span class="template-name">Zigzag</span>
                <span class="template-desc">Caminho em ziguezague</span>
            </button>
            <button class="template-btn" data-template="spiral">
                <span class="template-name">Espiral</span>
                <span class="template-desc">Caminho em espiral</span>
            </button>
            <button class="template-btn" data-template="maze">
                <span class="template-name">Labirinto</span>
                <span class="template-desc">Caminho complexo</span>
            </button>
        </div>
    `;
    
    // Inserir antes dos controles
    const controls = pathSection.querySelector('.path-controls');
    pathSection.insertBefore(templatesDiv, controls);
    
    // Adicionar event listeners para templates
    document.querySelectorAll('.template-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const template = btn.dataset.template;
            applyPathTemplate(template);
        });
    });
}

// Configurar editor de caminho
function setupPathEditor() {
    const pathSection = document.querySelector('.path-config');
    if (!pathSection) return;
    
    // Verificar se os controles já existem
    if (pathSection.querySelector('.path-editor-controls')) {
        return; // Já existem, não criar novamente
    }
    
    // Adicionar controles do editor
    const editorControls = document.createElement('div');
    editorControls.className = 'path-editor-controls';
    editorControls.innerHTML = `
        <div class="editor-tools">
            <button class="tool-btn active" data-tool="add" title="Adicionar caminho">
                ✏️ Adicionar
            </button>
            <button class="tool-btn" data-tool="remove" title="Remover caminho">
                🗑️ Remover
            </button>
            <button class="tool-btn" data-tool="line" title="Desenhar linha">
                📏 Linha
            </button>
            <button class="tool-btn" data-tool="fill" title="Preencher área">
                🎨 Preencher
            </button>
        </div>
        <div class="editor-info">
            <span class="path-stats">Células: <span id="pathCellCount">0</span></span>
            <span class="path-validation" id="pathValidation">✅ Válido</span>
        </div>
    `;
    
    // Inserir antes do grid
    const grid = pathSection.querySelector('.path-grid');
    pathSection.insertBefore(editorControls, grid);
    
    // Event listeners para ferramentas
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            pathEditorState.drawMode = btn.dataset.tool;
        });
    });
}

// Event handlers do editor de caminho
function handleCellMouseDown(e, x, y) {
    e.preventDefault();
    pathEditorState.isDrawing = true;
    pathEditorState.lastCell = {x, y};
    
    if (pathEditorState.drawMode === 'add') {
        pathGrid[y][x] = true;
    } else if (pathEditorState.drawMode === 'remove') {
        pathGrid[y][x] = false;
    }
    
    updatePathDisplay();
    updatePathStats();
}

function handleCellMouseEnter(e, x, y) {
    if (!pathEditorState.isDrawing) return;
    
    if (pathEditorState.drawMode === 'add') {
        pathGrid[y][x] = true;
    } else if (pathEditorState.drawMode === 'remove') {
        pathGrid[y][x] = false;
    }
    
    updatePathDisplay();
    updatePathStats();
}

function handleCellMouseUp() {
    pathEditorState.isDrawing = false;
    pathEditorState.lastCell = null;
}

// Aplicar template de caminho
function applyPathTemplate(templateName) {
    if (confirm(`Aplicar template "${PATH_TEMPLATES[templateName].name}"?`)) {
        const template = PATH_TEMPLATES[templateName];
        applyPathToGrid(template.path);
        showNotification(`Template "${template.name}" aplicado!`, 'success');
    }
}

// Alternar célula do caminho (mantido para compatibilidade)
function togglePathCell(x, y) {
    pathGrid[y][x] = !pathGrid[y][x];
    updatePathDisplay();
    updatePathStats();
}

// Atualizar exibição do caminho
function updatePathDisplay() {
    // Verificar se pathGrid existe e foi inicializado
    if (!pathGrid || !Array.isArray(pathGrid) || pathGrid.length === 0) {
        return;
    }
    
    const cells = document.querySelectorAll('.path-cell');
    
    cells.forEach(cell => {
        const x = parseInt(cell.dataset.x);
        const y = parseInt(cell.dataset.y);
        
        cell.classList.remove('path', 'start', 'end', 'invalid');
        
        if (pathGrid[y] && pathGrid[y][x]) {
            cell.classList.add('path');
        }
    });
    
    // Marcar início e fim se existirem
    const path = getPathFromGrid();
    if (path.length > 0) {
        const startCell = document.querySelector(`[data-x="${path[0].x}"][data-y="${path[0].y}"]`);
        const endCell = document.querySelector(`[data-x="${path[path.length-1].x}"][data-y="${path[path.length-1].y}"]`);
        
        if (startCell) startCell.classList.add('start');
        if (endCell) endCell.classList.add('end');
    }
    
    // Validar caminho apenas se os elementos existirem
    if (document.getElementById('pathValidation')) {
        validatePath();
    }
}

// Atualizar estatísticas do caminho
function updatePathStats() {
    const path = getPathFromGrid();
    const cellCount = document.getElementById('pathCellCount');
    if (cellCount) {
        cellCount.textContent = path.length;
    }
}

// Validar caminho
function validatePath() {
    // Verificar se pathGrid existe e foi inicializado
    if (!pathGrid || !Array.isArray(pathGrid) || pathGrid.length === 0) {
        return false;
    }
    
    const path = getPathFromGrid();
    const validationElement = document.getElementById('pathValidation');
    if (!validationElement) {
        return path.length > 0;
    }
    if (path.length === 0) {
        validationElement.textContent = '❌ Caminho vazio';
        validationElement.className = 'path-validation invalid';
        return false;
    }
    // Encontrar início e fim
    const start = path[0];
    const end = path[path.length - 1];
    // Criar grid de visitados
    const visited = Array(GRID_HEIGHT).fill().map(() => Array(GRID_WIDTH).fill(false));
    // Função auxiliar para encontrar vizinhos válidos
    function getNeighbors(x, y) {
        const dirs = [
            [0, 1], [1, 0], [0, -1], [-1, 0]
        ];
        return dirs.map(([dx, dy]) => [x + dx, y + dy])
            .filter(([nx, ny]) =>
                nx >= 0 && nx < GRID_WIDTH && ny >= 0 && ny < GRID_HEIGHT && pathGrid[ny] && pathGrid[ny][nx]
            );
    }
    // BFS para percorrer o caminho
    let queue = [[start.x, start.y]];
    visited[start.y][start.x] = true;
    let count = 1;
    while (queue.length > 0) {
        const [x, y] = queue.shift();
        for (const [nx, ny] of getNeighbors(x, y)) {
            if (!visited[ny][nx]) {
                visited[ny][nx] = true;
                queue.push([nx, ny]);
                count++;
            }
        }
    }
    // Verificar se todas as células do caminho foram visitadas e se o fim foi alcançado
    if (count === path.length && visited[end.y][end.x]) {
        validationElement.textContent = '✅ Válido';
        validationElement.className = 'path-validation valid';
        return true;
    } else {
        validationElement.textContent = '❌ Caminho desconectado';
        validationElement.className = 'path-validation invalid';
        return false;
    }
}

// Obter caminho do grid na ordem real do percurso
function getPathFromGrid() {
    // Verificar se pathGrid existe e foi inicializado
    if (!pathGrid || !Array.isArray(pathGrid) || pathGrid.length === 0) {
        return [];
    }
    
    // Encontrar ponto inicial: célula marcada na borda OU primeira célula marcada
    let start = null;
    for (let y = 0; y < GRID_HEIGHT; y++) {
        for (let x = 0; x < GRID_WIDTH; x++) {
            if (pathGrid[y] && pathGrid[y][x]) {
                // Se está na borda, prioriza como início
                if (x === 0 || y === 0 || x === GRID_WIDTH - 1 || y === GRID_HEIGHT - 1) {
                    start = { x, y };
                    break;
                }
                if (!start) start = { x, y };
            }
        }
        if (start) break;
    }
    if (!start) return [];
    // Percorrer o caminho a partir do início
    const visited = Array(GRID_HEIGHT).fill().map(() => Array(GRID_WIDTH).fill(false));
    const path = [];
    function getNeighbors(x, y) {
        const dirs = [
            [0, 1], [1, 0], [0, -1], [-1, 0]
        ];
        return dirs.map(([dx, dy]) => [x + dx, y + dy])
            .filter(([nx, ny]) =>
                nx >= 0 && nx < GRID_WIDTH && ny >= 0 && ny < GRID_HEIGHT && pathGrid[ny] && pathGrid[ny][nx] && !visited[ny][nx]
            );
    }
    let current = start;
    path.push(current);
    visited[current.y][current.x] = true;
    while (true) {
        const neighbors = getNeighbors(current.x, current.y);
        if (neighbors.length === 0) break;
        // Pega o primeiro vizinho não visitado
        const [nx, ny] = neighbors[0];
        current = { x: nx, y: ny };
        path.push(current);
        visited[ny][nx] = true;
    }
    return path;
}

// Aplicar caminho ao grid
function applyPathToGrid(path) {
    // Limpar grid
    pathGrid = Array(GRID_HEIGHT).fill().map(() => Array(GRID_WIDTH).fill(false));
    
    // Aplicar caminho
    path.forEach(point => {
        if (point.x >= 0 && point.x < GRID_WIDTH && point.y >= 0 && point.y < GRID_HEIGHT) {
            pathGrid[point.y][point.x] = true;
        }
    });
    
    updatePathDisplay();
    updatePathStats();
}

// Configurar event listeners
function setupEventListeners() {
    // Salvar configurações
    const saveConfigBtn = document.getElementById('saveConfig');
    if (saveConfigBtn) saveConfigBtn.addEventListener('click', saveConfig);
    
    // Restaurar padrões
    const resetConfigBtn = document.getElementById('resetConfig');
    if (resetConfigBtn) resetConfigBtn.addEventListener('click', resetConfig);
    
    // Exportar configurações
    const exportConfigBtn = document.getElementById('exportConfig');
    if (exportConfigBtn) exportConfigBtn.addEventListener('click', exportConfig);
    
    // Importar configurações
    const importConfigBtn = document.getElementById('importConfig');
    if (importConfigBtn) importConfigBtn.addEventListener('click', showImportModal);
    
    // Botões de presets
    const presetEasyBtn = document.getElementById('presetEasy');
    if (presetEasyBtn) presetEasyBtn.addEventListener('click', () => applyPreset('easy'));
    
    const presetMediumBtn = document.getElementById('presetMedium');
    if (presetMediumBtn) presetMediumBtn.addEventListener('click', () => applyPreset('medium'));
    
    const presetHardBtn = document.getElementById('presetHard');
    if (presetHardBtn) presetHardBtn.addEventListener('click', () => applyPreset('hard'));
    
    const presetCustomBtn = document.getElementById('presetCustom');
    if (presetCustomBtn) presetCustomBtn.addEventListener('click', () => applyPreset('custom'));
    
    // Detectar mudanças nos campos para marcar como personalizado
    document.addEventListener('input', (e) => {
        if (e.target.type === 'number' && e.target.id !== 'globalSkillPointsInput') {
            if (currentPreset !== 'custom') {
                setPresetActive('custom');
            }
        }
    });
    
    const confirmImportBtn = document.getElementById('confirmImport');
    if (confirmImportBtn) confirmImportBtn.addEventListener('click', importConfig);
    
    const cancelImportBtn = document.getElementById('cancelImport');
    if (cancelImportBtn) cancelImportBtn.addEventListener('click', hideImportModal);
    
    // Controles do caminho
    const clearPathBtn = document.getElementById('clearPath');
    if (clearPathBtn) clearPathBtn.addEventListener('click', clearPath);
    
    const defaultPathBtn = document.getElementById('defaultPath');
    if (defaultPathBtn) defaultPathBtn.addEventListener('click', setDefaultPath);
    
    // Prevenir arrastar do grid
    const pathGridElement = document.getElementById('pathGrid');
    if (pathGridElement) pathGridElement.addEventListener('dragstart', (e) => e.preventDefault());

    // Salvar configurações das torres
    const teslaChainRadiusInput = document.getElementById('teslaChainRadius');
    if (teslaChainRadiusInput) {
        teslaChainRadiusInput.onchange = () => {
            let val = parseFloat(teslaChainRadiusInput.value);
            if (val < 0.5) val = 0.5;
            if (val > 3) val = 3;
            teslaChainRadiusInput.value = val;
            // Salvar no localStorage
            let config = JSON.parse(localStorage.getItem('arqueiroConfig') || '{}');
            config.towers = config.towers || {};
            config.towers.tesla = config.towers.tesla || {};
            config.towers.tesla.chainRadius = val;
            localStorage.setItem('arqueiroConfig', JSON.stringify(config));
        };
    }

    // Salvar configurações dos upgrades do Arqueiro
    ['archerUpgradeDamage','archerUpgradeRange','archerUpgradeSpeed'].forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.onchange = () => {
                let val = parseFloat(input.value);
                let config = JSON.parse(localStorage.getItem('arqueiroConfig') || '{}');
                config.towers = config.towers || {};
                config.towers.archer = config.towers.archer || {};
                if(id==='archerUpgradeDamage') config.towers.archer.upgradeDamage = val;
                if(id==='archerUpgradeRange') config.towers.archer.upgradeRange = val;
                if(id==='archerUpgradeSpeed') config.towers.archer.upgradeSpeed = val;
                localStorage.setItem('arqueiroConfig', JSON.stringify(config));
            };
        }
    });

    // Salvar configurações dos upgrades das torres
    ['cannon','magic','tesla'].forEach(tower => {
        ['UpgradeDamage','UpgradeRange','UpgradeSpeed'].forEach(suf => {
            const id = tower + suf;
            const input = document.getElementById(id);
            if (input) {
                input.onchange = () => {
                    let val = parseFloat(input.value);
                    let config = JSON.parse(localStorage.getItem('arqueiroConfig') || '{}');
                    config.towers = config.towers || {};
                    config.towers[tower] = config.towers[tower] || {};
                    if(suf==='UpgradeDamage') config.towers[tower].upgradeDamage = val;
                    if(suf==='UpgradeRange') config.towers[tower].upgradeRange = val;
                    if(suf==='UpgradeSpeed') config.towers[tower].upgradeSpeed = val;
                    localStorage.setItem('arqueiroConfig', JSON.stringify(config));
                };
            }
        });
    });

    // Salvar configurações dos parâmetros especiais das torres
    const cannonAreaRadiusInput = document.getElementById('cannonAreaRadius');
    if (cannonAreaRadiusInput) {
        cannonAreaRadiusInput.onchange = () => {
            let val = parseInt(cannonAreaRadiusInput.value);
            let config = JSON.parse(localStorage.getItem('arqueiroConfig') || '{}');
            config.towers = config.towers || {};
            config.towers.cannon = config.towers.cannon || {};
            config.towers.cannon.areaRadius = val;
            localStorage.setItem('arqueiroConfig', JSON.stringify(config));
        };
    }
    const cannonAreaDamageMultiplierInput = document.getElementById('cannonAreaDamageMultiplier');
    if (cannonAreaDamageMultiplierInput) {
        cannonAreaDamageMultiplierInput.onchange = () => {
            let val = parseInt(cannonAreaDamageMultiplierInput.value);
            let config = JSON.parse(localStorage.getItem('arqueiroConfig') || '{}');
            config.towers = config.towers || {};
            config.towers.cannon = config.towers.cannon || {};
            config.towers.cannon.areaDamageMultiplier = val;
            localStorage.setItem('arqueiroConfig', JSON.stringify(config));
        };
    }
    const magicSlowEffectInput = document.getElementById('magicSlowEffect');
    if (magicSlowEffectInput) {
        magicSlowEffectInput.onchange = () => {
            let val = parseInt(magicSlowEffectInput.value);
            let config = JSON.parse(localStorage.getItem('arqueiroConfig') || '{}');
            config.towers = config.towers || {};
            config.towers.magic = config.towers.magic || {};
            config.towers.magic.slowEffect = val;
            localStorage.setItem('arqueiroConfig', JSON.stringify(config));
        };
    }
    const teslaChainMaxInput = document.getElementById('teslaChainMax');
    if (teslaChainMaxInput) {
        teslaChainMaxInput.onchange = () => {
            let val = parseInt(teslaChainMaxInput.value);
            let config = JSON.parse(localStorage.getItem('arqueiroConfig') || '{}');
            config.towers = config.towers || {};
            config.towers.tesla = config.towers.tesla || {};
            config.towers.tesla.chainMax = val;
            localStorage.setItem('arqueiroConfig', JSON.stringify(config));
        };
    }
}

// Salvar configurações
function saveConfig() {
    try {
        const config = collectConfigFromFields();
        
        // Validar caminho antes de salvar
        if (!validatePath()) {
            showNotification('Caminho inválido! Corrija antes de salvar.', 'error');
            return;
        }
        
        // Salvar configurações do jogo
        saveGameConfig(config);
        
        // Salvar configurações das torres
        saveTowerConfig(config.towers);
        
        // Salvar configurações dos inimigos
        const enemyConfig = {
            enemyBaseHealth: config.enemyBaseHealth,
            enemyHealthIncrease: config.enemyHealthIncrease,
            enemySpeed: config.enemySpeed,
            enemyReward: config.enemyReward,
            enemiesPerWave: config.enemiesPerWave,
            enemiesIncrease: config.enemiesIncrease,
            enemyTypes: config.enemyTypes
        };
        saveEnemyConfig(enemyConfig);
        
        // Notificar sobre mudança de configuração
        notifyConfigChanged();
        
        showNotification('Configurações salvas com sucesso!', 'success');
        
        // Se estamos no mesmo domínio, tentar aplicar mudanças imediatamente
        if (window.opener && window.opener.reloadConfigs) {
            console.log('🔄 Aplicando configurações ao jogo...');
            window.opener.reloadConfigs();
            window.opener.forceCanvasResize && window.opener.forceCanvasResize();
        }
        
    } catch (error) {
        console.error('Erro ao salvar configurações:', error);
        showNotification('Erro ao salvar configurações: ' + error.message, 'error');
    }
}

// Restaurar configurações padrão
function resetConfig() {
    if (confirm('Tem certeza que deseja restaurar as configurações padrão?')) {
        currentConfig = { ...DEFAULT_CONFIG };
        applyConfigToFields();
        applyPathToGrid(DEFAULT_CONFIG.enemyPath);
        showNotification('Configurações restauradas!', 'info');
    }
}

// Exportar configurações
function exportConfig() {
    const config = collectConfigFromFields();
    
    // Validar caminho antes de exportar
    if (!validatePath()) {
        showNotification('Caminho inválido! Corrija antes de exportar.', 'error');
        return;
    }
    
    const configJson = JSON.stringify(config, null, 2);
    
    const blob = new Blob([configJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'arqueiro-config.json';
    a.click();
    
    URL.revokeObjectURL(url);
    showNotification('Configurações exportadas!', 'success');
}

// Mostrar modal de importação
function showImportModal() {
    document.getElementById('importModal').style.display = 'flex';
    document.getElementById('importText').value = '';
    document.getElementById('importText').focus();
}

// Ocultar modal de importação
function hideImportModal() {
    document.getElementById('importModal').style.display = 'none';
}

// Importar configurações
function importConfig() {
    const importText = document.getElementById('importText').value.trim();
    
    if (!importText) {
        showNotification('Por favor, cole uma configuração válida', 'error');
        return;
    }
    
    try {
        const config = JSON.parse(importText);
        
        // Validar configuração
        if (!config.towers || !config.enemyPath) {
            throw new Error('Configuração inválida');
        }
        
        currentConfig = { ...DEFAULT_CONFIG, ...config };
        applyConfigToFields();
        applyPathToGrid(config.enemyPath);
        
        hideImportModal();
        showNotification('Configurações importadas com sucesso!', 'success');
        
    } catch (e) {
        showNotification('Erro ao importar configuração: ' + e.message, 'error');
        console.error('Erro na importação:', e);
    }
}

// Limpar caminho
function clearPath() {
    if (confirm('Tem certeza que deseja limpar o caminho?')) {
        pathGrid = Array(GRID_HEIGHT).fill().map(() => Array(GRID_WIDTH).fill(false));
        updatePathDisplay();
        updatePathStats();
    }
}

// Definir caminho padrão
function setDefaultPath() {
    if (confirm('Tem certeza que deseja usar o caminho padrão?')) {
        applyPathToGrid(DEFAULT_CONFIG.enemyPath);
    }
}

// Mostrar notificação
function showNotification(message, type = 'info') {
    // Criar elemento de notificação
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Verificar se há outras notificações e ajustar posição
    const existingNotifications = document.querySelectorAll('.notification');
    if (existingNotifications.length > 0) {
        const offset = existingNotifications.length * 80; // 80px de espaçamento
        notification.style.top = `${20 + offset}px`;
    }
    
    // Adicionar ao DOM
    document.body.appendChild(notification);
    
    // Animar entrada
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Remover após 4 segundos
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
                // Reposicionar notificações restantes
                repositionNotifications();
            }
        }, 400);
    }, 4000);
}

// Função para reposicionar notificações restantes
function repositionNotifications() {
    const notifications = document.querySelectorAll('.notification');
    notifications.forEach((notification, index) => {
        notification.style.top = `${20 + (index * 80)}px`;
    });
}

// Funções de preset
function applyPreset(presetName) {
    if (presetName === 'custom') {
        setPresetActive('custom');
        return;
    }
    
    const preset = PRESETS[presetName];
    if (!preset) return;
    
    // Aplicar configurações do preset
    Object.keys(preset.config).forEach(key => {
        const input = document.getElementById(key);
        if (input) {
            input.value = preset.config[key];
        }
    });
    
    // Marcar preset como ativo
    setPresetActive(presetName);
    currentPreset = presetName;
    
    showNotification(`Preset "${preset.name}" aplicado com sucesso!`, 'success');
}

function setPresetActive(presetName) {
    // Remover classe active de todos os botões
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Adicionar classe active no botão selecionado
    const activeBtn = document.getElementById(`preset${presetName.charAt(0).toUpperCase() + presetName.slice(1)}`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
    
    currentPreset = presetName;
}

function detectCurrentPreset() {
    // Verificar se os valores atuais correspondem a algum preset
    for (const [presetName, preset] of Object.entries(PRESETS)) {
        let matches = true;
        
        for (const [key, value] of Object.entries(preset.config)) {
            const input = document.getElementById(key);
            if (input && parseFloat(input.value) !== value) {
                matches = false;
                break;
            }
        }
        
        if (matches) {
            setPresetActive(presetName);
            return;
        }
    }
    
    // Se não corresponde a nenhum preset, marcar como personalizado
    setPresetActive('custom');
}

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    loadConfig();
    createPathGrid();
    createPathTemplates();
    setupPathEditor();
    setupEventListeners();
    updateGlobalSkillPointsConfig();
    detectCurrentPreset();
});

// As animações agora estão definidas no config-style.css 