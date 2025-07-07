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

// Usar configurações do módulo gameConfig.js
const DEFAULT_CONFIG = DEFAULT_GAME_CONFIG;

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
            // Primeira seção horizontal
            {x: 0, y: 2}, {x: 1, y: 2}, {x: 2, y: 2}, {x: 3, y: 2}, {x: 4, y: 2},
            // Descida
            {x: 4, y: 3}, {x: 4, y: 4}, {x: 4, y: 5}, {x: 4, y: 6},
            // Segunda seção horizontal
            {x: 5, y: 6}, {x: 6, y: 6}, {x: 7, y: 6}, {x: 8, y: 6}, {x: 9, y: 6},
            // Subida
            {x: 9, y: 5}, {x: 9, y: 4}, {x: 9, y: 3}, {x: 9, y: 2},
            // Terceira seção horizontal
            {x: 10, y: 2}, {x: 11, y: 2}, {x: 12, y: 2}, {x: 13, y: 2}, {x: 14, y: 2},
            // Descida final
            {x: 14, y: 3}, {x: 14, y: 4}, {x: 14, y: 5}, {x: 14, y: 6},
            // Final
            {x: 15, y: 6}, {x: 16, y: 6}, {x: 17, y: 6}, {x: 18, y: 6}, {x: 19, y: 6}
        ]
    },
    spiral: {
        name: 'Espiral',
        description: 'Caminho em espiral',
        path: [
            // Entrada pela esquerda
            {x: 0, y: 7}, {x: 1, y: 7}, {x: 2, y: 7},
            // Primeira volta - subir
            {x: 2, y: 6}, {x: 2, y: 5}, {x: 2, y: 4}, {x: 2, y: 3},
            // Direita
            {x: 3, y: 3}, {x: 4, y: 3}, {x: 5, y: 3}, {x: 6, y: 3}, {x: 7, y: 3}, {x: 8, y: 3},
            // Descer
            {x: 8, y: 4}, {x: 8, y: 5}, {x: 8, y: 6}, {x: 8, y: 7}, {x: 8, y: 8}, {x: 8, y: 9},
            // Esquerda
            {x: 7, y: 9}, {x: 6, y: 9}, {x: 5, y: 9}, {x: 4, y: 9},
            // Subir (espiral interna)
            {x: 4, y: 8}, {x: 4, y: 7}, {x: 4, y: 6},
            // Direita (espiral interna)
            {x: 5, y: 6}, {x: 6, y: 6},
            // Centro e saída
            {x: 6, y: 7}, {x: 7, y: 7}, {x: 8, y: 7}, {x: 9, y: 7}, {x: 10, y: 7}, {x: 11, y: 7},
            {x: 12, y: 7}, {x: 13, y: 7}, {x: 14, y: 7}, {x: 15, y: 7}, {x: 16, y: 7},
            {x: 17, y: 7}, {x: 18, y: 7}, {x: 19, y: 7}
        ]
    },
    maze: {
        name: 'Labirinto',
        description: 'Caminho complexo tipo labirinto',
        path: [
            // Entrada
            {x: 0, y: 12}, {x: 1, y: 12}, {x: 2, y: 12},
            // Subir
            {x: 2, y: 11}, {x: 2, y: 10}, {x: 2, y: 9}, {x: 2, y: 8},
            // Direita
            {x: 3, y: 8}, {x: 4, y: 8}, {x: 5, y: 8}, {x: 6, y: 8},
            // Descer
            {x: 6, y: 9}, {x: 6, y: 10}, {x: 6, y: 11}, {x: 6, y: 12},
            // Direita
            {x: 7, y: 12}, {x: 8, y: 12}, {x: 9, y: 12}, {x: 10, y: 12},
            // Subir
            {x: 10, y: 11}, {x: 10, y: 10}, {x: 10, y: 9}, {x: 10, y: 8}, {x: 10, y: 7},
            {x: 10, y: 6}, {x: 10, y: 5}, {x: 10, y: 4},
            // Direita
            {x: 11, y: 4}, {x: 12, y: 4}, {x: 13, y: 4}, {x: 14, y: 4},
            // Descer
            {x: 14, y: 5}, {x: 14, y: 6}, {x: 14, y: 7}, {x: 14, y: 8},
            // Direita final
            {x: 15, y: 8}, {x: 16, y: 8}, {x: 17, y: 8}, {x: 18, y: 8}, {x: 19, y: 8}
        ]
    },
    ucurve: {
        name: 'Curva U',
        description: 'Caminho simples em formato de U',
        path: [
            // Entrada pela esquerda
            {x: 0, y: 10}, {x: 1, y: 10}, {x: 2, y: 10}, {x: 3, y: 10},
            // Subir
            {x: 3, y: 9}, {x: 3, y: 8}, {x: 3, y: 7}, {x: 3, y: 6}, {x: 3, y: 5}, {x: 3, y: 4},
            // Direita (parte superior do U)
            {x: 4, y: 4}, {x: 5, y: 4}, {x: 6, y: 4}, {x: 7, y: 4}, {x: 8, y: 4}, {x: 9, y: 4},
            {x: 10, y: 4}, {x: 11, y: 4}, {x: 12, y: 4}, {x: 13, y: 4}, {x: 14, y: 4}, {x: 15, y: 4}, {x: 16, y: 4},
            // Descer
            {x: 16, y: 5}, {x: 16, y: 6}, {x: 16, y: 7}, {x: 16, y: 8}, {x: 16, y: 9}, {x: 16, y: 10},
            // Saída pela direita
            {x: 17, y: 10}, {x: 18, y: 10}, {x: 19, y: 10}
        ]
    }
};

// Função para testar todos os templates
function testAllTemplates() {
    Object.keys(PATH_TEMPLATES).forEach(templateName => {
        const template = PATH_TEMPLATES[templateName];
        
        // Verificar pontos válidos
        let validPoints = 0;
        let invalidPoints = 0;
        
        template.path.forEach(point => {
            if (point.x >= 0 && point.x < GRID_WIDTH && point.y >= 0 && point.y < GRID_HEIGHT) {
                validPoints++;
            } else {
                invalidPoints++;
            }
        });
        
        // Validar conectividade do caminho
        validateTemplatePath(template.path);
    });
}

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
                upgradePercentage: 50,
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
                upgradePercentage: 50,
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
                upgradePercentage: 50,
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
    createPathTemplates(); // Criar templates antes do editor
    setupPathEditor(); // Mover para antes de updatePathDisplay
    setupEventListeners();
    updatePathDisplay(); // Mover para depois de setupPathEditor
    updateGlobalSkillPointsConfig();
    detectCurrentPreset();
    
    // Testar templates (apenas em modo debug)
    if (window.location.search.includes('debug=true')) {
        testAllTemplates();
    }
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
    // waveDelay removido, agora usado waveDelaySeconds
            el = document.getElementById('upgradeBaseCost'); if (el) el.value = currentConfig.upgradeBaseCost || 50;
        el = document.getElementById('upgradePercentage'); if (el) el.value = currentConfig.upgradePercentage || 50;
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

// Função auxiliar para obter valor de elemento com segurança
function getElementValue(id, defaultValue = 0, isFloat = false) {
    const element = document.getElementById(id);
    if (!element) {
        console.warn(`Elemento com ID '${id}' não encontrado. Usando valor padrão: ${defaultValue}`);
        return defaultValue;
    }
    return isFloat ? parseFloat(element.value) : parseInt(element.value);
}

// Coletar configurações dos campos do formulário
function collectConfigFromFields() {
    const config = {
        // Configurações gerais
        initialHealth: getElementValue('initialHealth', 20),
        initialGold: getElementValue('initialGold', 75),
        gridSize: getElementValue('gridSize', 40),
        waveDelaySeconds: getElementValue('waveDelaySeconds', 5),
        upgradeBaseCost: getElementValue('upgradeBaseCost', 75),
        upgradePercentage: getElementValue('upgradePercentage', 50),
        sellPercentage: getElementValue('sellPercentage', 70),
        pointsPerKill: getElementValue('pointsPerKill', 10),
        waveBonusMultiplier: getElementValue('waveBonusMultiplier', 100),
        upgradeBonusMultiplier: getElementValue('upgradeBonusMultiplier', 25),
    
        // Configurações dos inimigos (CAMPOS FALTANTES ADICIONADOS)
        enemyBaseHealth: getElementValue('enemyBaseHealth', 50),
        enemyHealthIncrease: getElementValue('enemyHealthIncrease', 15),
        enemySpeed: getElementValue('enemySpeed', 0.5),
        enemyReward: getElementValue('enemyReward', 10),
        enemiesPerWave: getElementValue('enemiesPerWave', 8),
        enemiesIncrease: getElementValue('enemiesIncrease', 3),
        
        goldMultiplier: getElementValue('goldMultiplier', 1.0, true),
        enemyHealthMultiplier: getElementValue('enemyHealthMultiplier', 1.0, true),
        enemySpeedMultiplier: getElementValue('enemySpeedMultiplier', 1.0, true),
        enemySpawnRate: getElementValue('enemySpawnRate', 1000),
        
        // Configurações visuais
        canvasWidth: getElementValue('canvasWidth', 800),
        canvasHeight: getElementValue('canvasHeight', 600),
        projectileSpeed: getElementValue('projectileSpeed', 300, true),
        projectileSize: getElementValue('projectileSize', 6),
        damageNumberLifetime: getElementValue('damageNumberLifetime', 60),
        damageNumberSpeed: getElementValue('damageNumberSpeed', 1),
        
        // Configurações de tipos especiais de inimigos
        enemyTypes: {
            normal: {
                name: 'Normal',
                healthMultiplier: getElementValue('normalHealthMultiplier', 1.0, true),
                speedMultiplier: getElementValue('normalSpeedMultiplier', 1.0, true),
                rewardMultiplier: getElementValue('normalRewardMultiplier', 1.0, true),
                spawnChance: getElementValue('normalSpawnChance', 70),
                scoreMultiplier: getElementValue('normalScoreMultiplier', 1.0, true),
                color: '#dc3545'
            },
            fast: {
                name: 'Rápido',
                healthMultiplier: getElementValue('fastHealthMultiplier', 0.7, true),
                speedMultiplier: getElementValue('fastSpeedMultiplier', 1.8, true),
                rewardMultiplier: getElementValue('fastRewardMultiplier', 1.2, true),
                spawnChance: getElementValue('fastSpawnChance', 20),
                scoreMultiplier: getElementValue('fastScoreMultiplier', 1.2, true),
                color: '#ffc107'
            },
            tank: {
                name: 'Tanque',
                healthMultiplier: getElementValue('tankHealthMultiplier', 2.5, true),
                speedMultiplier: getElementValue('tankSpeedMultiplier', 0.6, true),
                rewardMultiplier: getElementValue('tankRewardMultiplier', 1.8, true),
                spawnChance: getElementValue('tankSpawnChance', 8),
                scoreMultiplier: getElementValue('tankScoreMultiplier', 1.8, true),
                color: '#6c757d'
            },
            elite: {
                name: 'Elite',
                healthMultiplier: getElementValue('eliteHealthMultiplier', 5.0, true),
                speedMultiplier: getElementValue('eliteSpeedMultiplier', 0.8, true),
                rewardMultiplier: getElementValue('eliteRewardMultiplier', 3.0, true),
                spawnChance: getElementValue('eliteSpawnChance', 2),
                scoreMultiplier: getElementValue('eliteScoreMultiplier', 3.0, true),
                color: '#dc3545'
            }
        },
        
        // Configurações das torres
        towers: {
            archer: {
                cost: getElementValue('archerCost', 50),
                range: getElementValue('archerRange', 120),
                damage: getElementValue('archerDamage', 15),
                fireRate: getElementValue('archerFireRate', 1000),
                upgradeDamage: getElementValue('archerUpgradeDamage', 30, true),
                upgradeRange: getElementValue('archerUpgradeRange', 10, true),
                upgradeSpeed: getElementValue('archerUpgradeSpeed', -10, true)
            },
            cannon: {
                cost: getElementValue('cannonCost', 75),
                range: getElementValue('cannonRange', 100),
                damage: getElementValue('cannonDamage', 25),
                fireRate: getElementValue('cannonFireRate', 1500),
                upgradeDamage: getElementValue('cannonUpgradeDamage', 35, true),
                upgradeRange: getElementValue('cannonUpgradeRange', 15, true),
                upgradeSpeed: getElementValue('cannonUpgradeSpeed', -15, true),
                areaRadius: getElementValue('cannonAreaRadius', 50),
                areaDamageMultiplier: getElementValue('cannonAreaDamageMultiplier', 80)
            },
            magic: {
                cost: getElementValue('magicCost', 95),
                range: getElementValue('magicRange', 140),
                damage: getElementValue('magicDamage', 20),
                fireRate: getElementValue('magicFireRate', 1000),
                upgradeDamage: getElementValue('magicUpgradeDamage', 25, true),
                upgradeRange: getElementValue('magicUpgradeRange', 20, true),
                upgradeSpeed: getElementValue('magicUpgradeSpeed', -5, true),
                slowEffect: getElementValue('magicSlowEffect', 70),
                freezeDuration: getElementValue('magicFreezeDuration', 2.0, true)
            },
            tesla: {
                cost: getElementValue('teslaCost', 95),
                range: getElementValue('teslaRange', 120),
                damage: getElementValue('teslaDamage', 20),
                fireRate: getElementValue('teslaFireRate', 1000),
                upgradeDamage: getElementValue('teslaUpgradeDamage', 30, true),
                upgradeRange: getElementValue('teslaUpgradeRange', 12, true),
                upgradeSpeed: getElementValue('teslaUpgradeSpeed', -8, true),
                chainMax: getElementValue('teslaChainMax', 3),
                chainRadius: getElementValue('teslaChainRadius', 80, true)
            },
            special: {
                cost: getElementValue('specialCost', 300),
                range: getElementValue('specialRange', 200),
                damage: getElementValue('specialDamage', 40),
                fireRate: getElementValue('specialFireRate', 500),
                color: document.getElementById('specialColor')?.value || '#ffd700',
                effect: document.getElementById('specialEffect')?.value || 'global'
            }
        },
        
        // Caminho dos inimigos
        enemyPath: getPathFromGrid(),
        
        // Configurações de habilidades especiais
        arrowRainCooldown: getElementValue('arrowRainCooldownConfig', 30),
        arrowRainDamage: getElementValue('arrowRainDamageConfig', 30),
        arrowRainRadius: getElementValue('arrowRainRadiusConfig', 100),
        iceStormCooldown: getElementValue('iceStormCooldownConfig', 45),
        iceStormDuration: getElementValue('iceStormDurationConfig', 3.0, true),
        iceStormDamage: getElementValue('iceStormDamageConfig', 15)
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
            <button class="template-btn" data-template="ucurve">
                <span class="template-name">Curva U</span>
                <span class="template-desc">Caminho em U</span>
            </button>
        </div>
    `;
    
    // Inserir antes dos controles
    const controls = pathSection.querySelector('.path-controls');
    pathSection.insertBefore(templatesDiv, controls);
    
    // Adicionar event listeners para templates
    templatesDiv.querySelectorAll('.template-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
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
    // Verificar se o template existe
    if (!PATH_TEMPLATES[templateName]) {
        showNotification(`Template "${templateName}" não encontrado!`, 'error');
        return;
    }
    
    const template = PATH_TEMPLATES[templateName];
    if (confirm(`Aplicar template "${template.name}"?\n\n${template.description}`)) {
        try {
            applyPathToGrid(template.path);
            showNotification(`Template "${template.name}" aplicado com sucesso!`, 'success');
    
        } catch (error) {
            console.error('Erro ao aplicar template:', error);
            showNotification(`Erro ao aplicar template: ${error.message}`, 'error');
        }
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
    
    // Validar e aplicar caminho
    let validPoints = 0;
    let invalidPoints = 0;
    
    path.forEach(point => {
        if (point.x >= 0 && point.x < GRID_WIDTH && point.y >= 0 && point.y < GRID_HEIGHT) {
            pathGrid[point.y][point.x] = true;
            validPoints++;
        } else {
            invalidPoints++;
            console.warn(`Ponto inválido no caminho: (${point.x}, ${point.y})`);
        }
    });
    
    if (invalidPoints > 0) {
        console.warn(`${invalidPoints} pontos inválidos ignorados, ${validPoints} pontos aplicados`);
    }
    
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

// Função para validar se um caminho é contínuo
function validateTemplatePath(path) {
    if (path.length < 2) {
        return { valid: false, error: 'Caminho muito curto' };
    }
    
    // Verificar se todos os pontos são adjacentes
    for (let i = 1; i < path.length; i++) {
        const current = path[i];
        const previous = path[i - 1];
        
        const dx = Math.abs(current.x - previous.x);
        const dy = Math.abs(current.y - previous.y);
        
        // Pontos devem ser adjacentes (máximo 1 célula de distância em uma direção)
        if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
            continue; // Válido
        } else {
            return { 
                valid: false, 
                error: `Caminho desconectado entre pontos ${i-1} e ${i}: (${previous.x},${previous.y}) -> (${current.x},${current.y})` 
            };
        }
    }
    
    return { valid: true };
}

// Comentário removido - inicialização já feita acima

// Funções auxiliares de segurança foram implementadas para lidar com elementos ausentes

// As animações agora estão definidas no config-style.css 