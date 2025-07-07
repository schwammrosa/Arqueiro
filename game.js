// Importar configurações dos módulos
import { 
    DEFAULT_GAME_CONFIG, 
    loadGameConfig,
    onConfigChanged
} from './js/config/gameConfig.js';

import { 
    loadTowerConfig 
} from './js/config/towerConfig.js';

import { 
    loadEnemyConfig, 
    chooseEnemyType, 
    calculateEnemyStats 
} from './js/config/enemyConfig.js';

// Importar classes
import { Tower } from './js/classes/Tower.js';
import { Enemy } from './js/classes/Enemy.js';
import { Projectile, TeslaChainProjectile, CannonProjectile } from './js/classes/Projectile.js';
import { DamageNumber } from './js/classes/DamageNumber.js';

// Importar sistemas
import { RenderSystem } from './js/systems/RenderSystem.js';
import { UISystem } from './js/systems/UISystem.js';
import { GameSystem } from './js/systems/GameSystem.js';

// Importar a função da árvore de habilidades
import { initSkillTreePanel } from './js/systems/SkillTreeSystem.js';

// ============================================================================
// CONFIGURAÇÕES E CONSTANTES
// ============================================================================

// --- Chaves de Armazenamento ---
const SKILL_TREE_KEY = 'arqueiroSkillTree';
const SKILL_POINTS_KEY = 'arqueiroUpgradePoints';
const TUTORIAL_COMPLETED_KEY = 'tutorialCompleted';
const ENEMY_PATH_KEY = 'enemyPath';
const ARQUEIRO_CONFIG_KEY = 'arqueiroConfig';
const MAIOR_ONDA_KEY = 'maiorOndaAtingida';

// --- Configurações de UI ---
const UI_CONSTANTS = {
    SKILL_TREE_ROW_HEIGHT: '110px',
    SKILL_TREE_GAP: '32px',
    TOOLTIP_PADDING: 12,
    SAFETY_MARGIN_MOBILE: 40,
    SAFETY_MARGIN_TABLET: 30,
    SAFETY_MARGIN_DESKTOP: 20,
    CANVAS_SCALE_MOBILE: 0.8,
    CANVAS_SCALE_TABLET: 0.9,
    CANVAS_SCALE_DESKTOP: 1.0
};

// --- Configurações de Jogo ---
const GAME_CONSTANTS = {
    DEFAULT_SELL_PERCENTAGE: 50,
    DEFAULT_WAVE_DELAY: 5,
    DEFAULT_SPAWN_INTERVAL: 1.0,
    DEFAULT_ENEMIES_PER_WAVE: 5,
    DEFAULT_ENEMY_REWARD: 10,
    DEFAULT_ENEMIES_INCREASE: 2,
    BASE_ARROW_RAIN_DAMAGE: 40,
    ARROW_RAIN_RADIUS: 90,
    ICE_STORM_BASE_DURATION: 3,
    ICE_STORM_SLOW_SPEED: 0.01
};

// --- Configurações de Responsividade ---
const RESPONSIVE_BREAKPOINTS = {
    MOBILE: 480,
    TABLET: 768
};

// --- Configurações de Árvore de Habilidades ---
const SKILL_BONUSES = {
    VIDA_BONUS: 1,
    DEFESA_BONUS: 0.10,
    DANO_GLOBAL_BONUS: 0.05,
    DANO_ESPECIFICO_BONUS: 0.10,
    VELOCIDADE_BONUS: 0.10,
    AREA_CANHAO_BONUS: 0.15,
    CONGELAMENTO_BONUS: 1.0,
    CHUVA_FLECHAS_BONUS: 0.25,
    OURO_EXTRA_BONUS: 0.10
};

const SKILL_TREE = [
    // Camada 1 (base)
    { id: 'vida', name: 'Vida Inicial +', desc: '+1 de vida inicial por nível', max: 5, cost: 1, parent: null, branch: 'vida', children: ['cura', 'defesa'], row: 3, col: 1 },
    { id: 'dano', name: 'Dano Global +', desc: '+5% de dano para todas as torres por nível', max: 5, cost: 1, parent: null, branch: 'dano', children: ['dano_arq', 'dano_can', 'dano_mag', 'dano_tes'], row: 3, col: 2 },
    { id: 'esp', name: 'Especial', desc: 'Desbloqueia habilidades especiais', max: 1, cost: 1, parent: null, branch: 'esp', children: ['chuva', 'gelo', 'ouro', 'torre'], row: 3, col: 3 },
    // Camada 2
    { id: 'cura', name: 'Cura Passiva', desc: 'Regenera 1 de vida a cada 20s', max: 3, cost: 2, parent: 'vida', branch: 'vida', children: [], row: 2, col: 1 },
    { id: 'defesa', name: 'Defesa', desc: 'Reduz dano recebido em 10% por nível', max: 3, cost: 2, parent: 'vida', branch: 'vida', children: [], row: 1, col: 1 },
    { id: 'dano_arq', name: 'Dano Arqueiro +', desc: '+10% de dano para torres Arqueiro', max: 3, cost: 2, parent: 'dano', branch: 'dano', children: ['vel_arq'], row: 2, col: 2 },
    { id: 'dano_can', name: 'Dano Canhão +', desc: '+10% de dano para torres Canhão', max: 3, cost: 2, parent: 'dano', branch: 'dano', children: ['alc_can'], row: 2, col: 2 },
    { id: 'dano_mag', name: 'Dano Mago +', desc: '+10% de dano para torres Mago', max: 3, cost: 2, parent: 'dano', branch: 'dano', children: ['cong_mag'], row: 2, col: 2 },
    { id: 'dano_tes', name: 'Dano Tesla +', desc: '+10% de dano para torres Tesla', max: 3, cost: 2, parent: 'dano', branch: 'dano', children: ['enc_tes'], row: 2, col: 2 },
    { id: 'chuva', name: 'Chuva de Flechas +', desc: 'Aprimora a Chuva de Flechas', max: 3, cost: 2, parent: 'esp', branch: 'esp', children: [], row: 2, col: 3 },
    { id: 'gelo', name: 'Tempestade de Gelo', desc: 'Nova habilidade: congela todos os inimigos', max: 1, cost: 3, parent: 'esp', branch: 'esp', children: [], row: 1, col: 3 },
    { id: 'ouro', name: 'Ouro extra por onda', desc: '+10% de ouro ao vencer uma onda', max: 3, cost: 2, parent: 'esp', branch: 'esp', children: [], row: 2, col: 3 },
    { id: 'torre', name: 'Desbloquear Torre Especial', desc: 'Nova torre exclusiva', max: 1, cost: 3, parent: 'esp', branch: 'esp', children: [], row: 2, col: 3 },
    // Camada 3 (topo)
    { id: 'vel_arq', name: 'Velocidade Arqueiro +', desc: '+10% de velocidade de ataque Arqueiro', max: 3, cost: 2, parent: 'dano_arq', branch: 'dano', children: [], row: 1, col: 2 },
    { id: 'alc_can', name: 'Área Explosão +', desc: '+15% de área de efeito da explosão', max: 2, cost: 2, parent: 'dano_can', branch: 'dano', children: [], row: 1, col: 2 },
    { id: 'cong_mag', name: 'Congelamento Mago +', desc: '+1s de congelamento', max: 2, cost: 2, parent: 'dano_mag', branch: 'dano', children: [], row: 1, col: 2 },
    { id: 'enc_tes', name: 'Encadeamento Tesla +', desc: '+1 inimigo encadeado', max: 2, cost: 2, parent: 'dano_tes', branch: 'dano', children: [], row: 1, col: 2 },
];

const SKILL_ICONS = {
    vida: '❤️', cura: '💚', defesa: '🛡️',
    dano: '⚔️', dano_arq: '🏹', vel_arq: '💨', dano_can: '🚀', alc_can: '💥', dano_mag: '🔮', cong_mag: '❄️', dano_tes: '⚡', enc_tes: '🔗',
    esp: '✨', chuva: '🏹', gelo: '❄️', ouro: '💰', torre: '🌟'
};

function loadSkillTree() {
    const saved = localStorage.getItem(SKILL_TREE_KEY);
    if (saved) return JSON.parse(saved);
    const obj = {};
    SKILL_TREE.forEach(n => obj[n.id] = 0);
    return obj;
}
function saveSkillTree(tree) {
    localStorage.setItem(SKILL_TREE_KEY, JSON.stringify(tree));
}
function loadSkillPoints() {
    return parseInt(localStorage.getItem(SKILL_POINTS_KEY) || '0');
}
function saveSkillPoints(points) {
    localStorage.setItem(SKILL_POINTS_KEY, points);
}
let skillTree = loadSkillTree();
let skillPoints = loadSkillPoints();

function canUnlockSkill(node) {
    if (skillPoints < node.cost) return false;
    if (node.parent === null) return true;
    return skillTree[node.parent] > 0;
}

// Função para agrupar nós da árvore por camadas
function groupNodesByLayers(tree) {
    const layers = {};
    tree.forEach(node => {
        if (!layers[node.row]) layers[node.row] = [];
        layers[node.row].push(node);
    });
    return layers;
}

// Função para criar um nó individual da árvore de habilidades
function createSkillNode(node, nodeDivs) {
    const nodeDiv = document.createElement('div');
    nodeDiv.className = 'skill-node';
    
    const level = skillTree[node.id] || 0;
    const unlocked = level > 0;
    const available = !unlocked && canUnlockSkill(node);
    
    // Adicionar cadeado se bloqueado
    let iconHtml = SKILL_ICONS[node.id] || '❔';
    if (!unlocked && !available) {
        iconHtml += ' <span class="skill-lock">🔒</span>';
        nodeDiv.classList.add('locked');
    }
    
    nodeDiv.innerHTML = `<div class="skill-icon">${iconHtml}</div>`;
    nodeDiv.style.position = 'relative';
    nodeDiv.style.zIndex = 2;
    nodeDivs[node.id] = nodeDiv;
    
    // Criar tooltip
    const tooltip = document.createElement('div');
    tooltip.className = 'skill-tooltip';
    tooltip.innerHTML = `<b>${node.name}</b><br>${node.desc}<br><span style='color:#b26a00;font-size:0.95em;'>${unlocked ? 'Desbloqueada' : available ? 'Disponível' : 'Bloqueada'}</span><br>Custo: ${node.cost}<br>Nível: ${level}/${node.max}`;
    nodeDiv.appendChild(tooltip);
    
    // Event listeners do tooltip
    nodeDiv.onmouseenter = () => { tooltip.style.display = 'block'; };
    nodeDiv.onmouseleave = () => { tooltip.style.display = 'none'; };
    
    return nodeDiv;
}

// Função para criar uma linha da árvore de habilidades
function createSkillTreeRow(layer, nodeDivs) {
    const rowDiv = document.createElement('div');
    rowDiv.className = 'skill-tree-row';
    rowDiv.style.display = 'flex';
    rowDiv.style.justifyContent = 'center';
    rowDiv.style.gap = UI_CONSTANTS.SKILL_TREE_GAP;
    rowDiv.style.position = 'relative';
    rowDiv.style.height = UI_CONSTANTS.SKILL_TREE_ROW_HEIGHT;
    
    layer.forEach(node => {
        const nodeDiv = createSkillNode(node, nodeDivs);
        rowDiv.appendChild(nodeDiv);
    });
    
    return rowDiv;
}

// Função para desenhar conexões SVG entre os nós
function drawSkillTreeConnections(tree, nodeDivs, container) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.classList.add('skill-conn');
    svg.setAttribute('width', container.offsetWidth);
    svg.setAttribute('height', container.offsetHeight);
    svg.style.position = 'absolute';
    svg.style.left = '0';
    svg.style.top = '0';
    svg.style.pointerEvents = 'none';
    svg.style.zIndex = 1;
    
    // Desenhar linhas de conexão
    tree.forEach(node => {
        if (!node.parent) return;
        
        const from = nodeDivs[node.parent];
        const to = nodeDivs[node.id];
        if (!from || !to) return;
        
        const fromRect = from.getBoundingClientRect();
        const toRect = to.getBoundingClientRect();
        const contRect = container.getBoundingClientRect();
        
        const x1 = fromRect.left + fromRect.width/2 - contRect.left;
        const y1 = fromRect.top + fromRect.height - contRect.top;
        const x2 = toRect.left + toRect.width/2 - contRect.left;
        const y2 = toRect.top - contRect.top;
        
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
        svg.appendChild(line);
    });
    
    // Remover SVG antigo se existir
    const oldSvg = container.querySelector('.skill-conn');
    if (oldSvg) oldSvg.remove();
    
    return svg;
}

function renderSkillTreePanel(branch, containerId) {
    const tree = SKILL_TREE.filter(node => node.branch === branch || node.id === branch);
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = '';
    
    // Agrupar nós por camadas
    const layers = groupNodesByLayers(tree);
    const maxRow = Math.max(...tree.map(n => n.row));
    
    // Renderizar nós centralizados por camada
    const nodeDivs = {};
    for (let row = 1; row <= maxRow; row++) {
        const layer = layers[row] || [];
        const rowDiv = createSkillTreeRow(layer, nodeDivs);
        container.appendChild(rowDiv);
    }
    
    // Desenhar conexões SVG entre os nós (após renderizar)
    setTimeout(() => {
        const svg = drawSkillTreeConnections(tree, nodeDivs, container);
        container.appendChild(svg);
    }, 10);
}

// Renderizar as três árvores
renderSkillTreePanel('vida', 'skill-tree-vida');
renderSkillTreePanel('dano', 'skill-tree-dano');
renderSkillTreePanel('esp', 'skill-tree-especial');

// ============================================================================
// FUNÇÕES DE CONFIGURAÇÃO E INICIALIZAÇÃO
// ============================================================================

// Exibir painel de upgrades usando o sistema modularizado
function showUpgradeModal() {
    const modal = document.getElementById('upgradeModal');
    let skillTree = loadSkillTree();
    let skillPoints = loadSkillPoints();
    document.getElementById('upgradePoints').textContent = skillPoints;
    const list = document.getElementById('upgradeList');
    list.innerHTML = '';
    const panelDiv = document.createElement('div');
    panelDiv.id = 'skill-tree-multi-panel';
    list.appendChild(panelDiv);
    initSkillTreePanel('skill-tree-multi-panel', skillTree, skillPoints);
    modal.style.display = 'flex';
}

const btnUpgrades = document.getElementById('btnUpgrades');
if (btnUpgrades) {
    btnUpgrades.onclick = showUpgradeModal;
}

document.getElementById('closeUpgradeModal').addEventListener('click', () => {
    document.getElementById('upgradeModal').style.display = 'none';
});

// ============================================================================
// VARIÁVEIS GLOBAIS
// ============================================================================

// Variáveis globais para configurações (serão atualizadas dinamicamente)
let GAME_CONFIG = loadGameConfig();
let TOWER_TYPES = loadTowerConfig();

// Função para mostrar o modal de dificuldade
function showDifficultyModal() {
    document.getElementById('difficultyModal').style.display = 'flex';
}

// Função para aplicar os efeitos da árvore de habilidades ao GAME_CONFIG
function applySkillTreeEffects(gameConfig, skillTree) {
    // Vida/Suporte
    gameConfig.initialHealth += (skillTree['vida'] || 0) * SKILL_BONUSES.VIDA_BONUS;
    gameConfig.defenseBonus = (skillTree['defesa'] || 0) * SKILL_BONUSES.DEFESA_BONUS;
    gameConfig.passiveHeal = (skillTree['cura'] || 0);
    
    // Ataque/Dano
    gameConfig.globalDamageBonus = 1 + (skillTree['dano'] || 0) * SKILL_BONUSES.DANO_GLOBAL_BONUS;
    gameConfig.archerDamageBonus = 1 + (skillTree['dano_arq'] || 0) * SKILL_BONUSES.DANO_ESPECIFICO_BONUS;
    gameConfig.archerSpeedBonus = 1 + (skillTree['vel_arq'] || 0) * SKILL_BONUSES.VELOCIDADE_BONUS;
    gameConfig.cannonDamageBonus = 1 + (skillTree['dano_can'] || 0) * SKILL_BONUSES.DANO_ESPECIFICO_BONUS;
    gameConfig.cannonAreaBonus = 1 + (skillTree['alc_can'] || 0) * SKILL_BONUSES.AREA_CANHAO_BONUS;
    gameConfig.mageDamageBonus = 1 + (skillTree['dano_mag'] || 0) * SKILL_BONUSES.DANO_ESPECIFICO_BONUS;
    gameConfig.mageFreezeBonus = (skillTree['cong_mag'] || 0) * SKILL_BONUSES.CONGELAMENTO_BONUS;
    gameConfig.teslaDamageBonus = 1 + (skillTree['dano_tes'] || 0) * SKILL_BONUSES.DANO_ESPECIFICO_BONUS;
    gameConfig.teslaChainBonus = (skillTree['enc_tes'] || 0);
    
    // Especial
    gameConfig.arrowRainBonus = (skillTree['chuva'] || 0);
    gameConfig.iceStorm = (skillTree['gelo'] || 0) > 0;
    gameConfig.goldPerWaveBonus = 1 + (skillTree['ouro'] || 0) * SKILL_BONUSES.OURO_EXTRA_BONUS;
    gameConfig.specialTowerUnlocked = (skillTree['torre'] || 0) > 0;
    
    window.GAME_CONFIG = gameConfig;
}

// Modificar getInitialGameState para aplicar a árvore de habilidades
function getInitialGameState() {
    let config = loadGameConfig();
    applySkillTreeEffects(config, loadSkillTree());
    return {
        health: config.initialHealth,
        gold: config.initialGold,
        wave: 0,
        isPaused: false,
        isGameOver: false,
        selectedTower: null,
        selectedTowerType: null,
        mouseX: undefined,
        mouseY: undefined,
        towers: [],
        enemies: [],
        projectiles: [],
        visualEffects: [],
        waveInProgress: false,
        allEnemiesSpawned: false,
        waveTimer: 0,
        nextWaveTimer: 0,
        gameTime: 0,
        score: 0,
        damageNumbers: [],
        monstersThisWave: 0,
        monstersDefeated: 0,
        // Variáveis do novo sistema de spawn
        enemiesSpawned: 0,
        lastSpawnTime: 0,
        spawnInterval: 1.0 // segundos
    };
}

// Estado do jogo
let gameState = getInitialGameState();

// Canvas e contexto
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Inicializar canvas com configurações
canvas.width = GAME_CONFIG.canvasWidth;
canvas.height = GAME_CONFIG.canvasHeight;

// Função para recarregar configurações
function reloadConfigs() {
    const oldCanvasWidth = GAME_CONFIG.canvasWidth;
    const oldCanvasHeight = GAME_CONFIG.canvasHeight;
    
    GAME_CONFIG = loadGameConfig();
    applySkillTreeEffects(GAME_CONFIG, loadSkillTree());
    TOWER_TYPES = loadTowerConfig();
    
    // Atualizar tamanho do canvas se necessário
    if (oldCanvasWidth !== GAME_CONFIG.canvasWidth || oldCanvasHeight !== GAME_CONFIG.canvasHeight) {

        // Usar adjustCanvasSize() para aplicar as novas dimensões com responsividade
        adjustCanvasSize();
    }
    
    // Atualizar RenderSystem com novas configurações
    renderSystem.GAME_CONFIG = GAME_CONFIG;
    
    // Atualizar configurações das torres existentes
    gameState.towers.forEach(tower => {
        tower.gameConfig = GAME_CONFIG;
        tower.towerTypes = TOWER_TYPES;
        tower.applyBonuses && tower.applyBonuses();
    });
    

    renderTowerOptions();

    // Ao aplicar as configurações do painel, garantir que o valor de freezeDuration da torre mágica seja usado em mageFreezeBonus
    if (TOWER_TYPES.magic && typeof TOWER_TYPES.magic.freezeDuration !== 'undefined') {
        GAME_CONFIG.mageFreezeBonus = TOWER_TYPES.magic.freezeDuration;
    }

    // Ao recarregar as configurações, aplicar os valores da Tempestade de Gelo do painel
    if (typeof GAME_CONFIG.iceStormCooldown !== 'undefined') {
        window.ICE_STORM_COOLDOWN = GAME_CONFIG.iceStormCooldown;
    }
    
    // Aplicar configuração do teslaChainRadius
    if (TOWER_TYPES.tesla && typeof TOWER_TYPES.tesla.chainRadius !== 'undefined') {
        GAME_CONFIG.teslaChainRadius = TOWER_TYPES.tesla.chainRadius;
    }
    if (typeof GAME_CONFIG.iceStormDuration !== 'undefined') {
        window.ICE_STORM_BASE_DURATION = GAME_CONFIG.iceStormDuration;
    }
    if (typeof GAME_CONFIG.iceStormDamage !== 'undefined') {
        window.ICE_STORM_EXTRA_DAMAGE = GAME_CONFIG.iceStormDamage;
    }
}

// Função para calcular altura usada pelos elementos da UI
function calculateUsedHeight() {
    let usedHeight = 0;
    const elements = [
        document.querySelector('.top-panel'),
        document.querySelector('.horizontal-controls'),
        document.getElementById('specialSkillsFixedBar') || document.querySelector('.skills-container'),
        document.querySelector('.footer-tower-bar')
    ];
    
    elements.forEach(element => {
        if (element && element.offsetWidth > 0) {
            usedHeight += element.getBoundingClientRect().height + 20; // 20px margin
        }
    });
    
    return usedHeight;
}

// Função para determinar margem de segurança baseada no tamanho da tela
function getSafetyMargin(screenWidth) {
    if (screenWidth <= RESPONSIVE_BREAKPOINTS.MOBILE) {
        return UI_CONSTANTS.SAFETY_MARGIN_MOBILE;
    } else if (screenWidth <= RESPONSIVE_BREAKPOINTS.TABLET) {
        return UI_CONSTANTS.SAFETY_MARGIN_TABLET;
    }
    return UI_CONSTANTS.SAFETY_MARGIN_DESKTOP;
}

// Função para calcular escala baseada no tamanho da tela
function calculateCanvasScale(screenWidth, screenHeight, baseWidth, baseHeight, availableHeight) {
    if (screenWidth <= RESPONSIVE_BREAKPOINTS.MOBILE) {
        // Celular - ajustar para caber na tela
        const availableWidth = screenWidth * 0.95;
        return Math.min(availableWidth / baseWidth, availableHeight / baseHeight, UI_CONSTANTS.CANVAS_SCALE_MOBILE);
    } else if (screenWidth <= RESPONSIVE_BREAKPOINTS.TABLET) {
        // Tablet - escala moderada
        const availableWidth = screenWidth * 0.9;
        return Math.min(availableWidth / baseWidth, availableHeight / baseHeight, UI_CONSTANTS.CANVAS_SCALE_TABLET);
    } else {
        // Desktop - verificar se precisa escalar
        const availableWidth = screenWidth - 300; // Espaço para painel lateral
        return Math.min(availableWidth / baseWidth, availableHeight / baseHeight, UI_CONSTANTS.CANVAS_SCALE_DESKTOP);
    }
}

// Função para ajustar o tamanho do canvas responsivamente
function adjustCanvasSize() {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) return;
    
    // Usar dimensões das configurações salvas
    const baseWidth = GAME_CONFIG.canvasWidth || 800;
    const baseHeight = GAME_CONFIG.canvasHeight || 600;
    
    // Obter dimensões da tela
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    
    // Calcular altura usada pelos elementos
    const usedHeight = calculateUsedHeight();
    
    // Adicionar margem de segurança
    const safetyMargin = getSafetyMargin(screenWidth);
    const totalUsedHeight = usedHeight + safetyMargin;
    
    // Calcular altura disponível real
    const availableHeight = Math.max(200, screenHeight - totalUsedHeight);
    
    // Calcular fator de escala
    const scale = calculateCanvasScale(screenWidth, screenHeight, baseWidth, baseHeight, availableHeight);
    
    // Aplicar dimensões configuradas
    canvas.width = baseWidth;
    canvas.height = baseHeight;
    
    // Aplicar escala CSS para responsividade
    const finalWidth = Math.floor(baseWidth * scale);
    const finalHeight = Math.floor(baseHeight * scale);
    
    canvas.style.width = finalWidth + 'px';
    canvas.style.height = finalHeight + 'px';
    
    // Força reposicionamento se necessário
    if (screenWidth <= RESPONSIVE_BREAKPOINTS.TABLET) {
        canvas.style.margin = '0 auto';
        canvas.style.display = 'block';
    }
}

// Ajustar canvas ao carregar e redimensionar
window.addEventListener('resize', () => {

    adjustCanvasSize();
    
    // Aguardar um pouco para ajustar canvas
    setTimeout(() => {
        adjustCanvasSize();
    }, 200);
});
window.addEventListener('orientationchange', () => {
    setTimeout(adjustCanvasSize, 100);
});

// Escutar mudanças de configuração
onConfigChanged((newConfig) => {

    reloadConfigs();
    uiSystem.showNotification('Configurações aplicadas ao jogo!', 'info');
});

// Carregar caminho dos inimigos
function loadEnemyPath() {
    // Primeiro, tentar carregar do enemyPath separado (templates)
    const savedPath = localStorage.getItem(ENEMY_PATH_KEY);
    if (savedPath) {
        try {
            const path = JSON.parse(savedPath);
            if (path && path.length > 0) {
                return path;
            }
        } catch (e) {
            console.error('Erro ao carregar caminho do template:', e);
        }
    }
    
    // Fallback: carregar do arqueiroConfig
    const savedConfig = localStorage.getItem(ARQUEIRO_CONFIG_KEY);
    if (savedConfig) {
        try {
            const config = JSON.parse(savedConfig);
            if (config.enemyPath && config.enemyPath.length > 0) {
                return config.enemyPath;
            }
        } catch (e) {
            console.error('Erro ao carregar caminho dos inimigos:', e);
        }
    }
    
    return GAME_CONFIG.enemyPath;
}

const enemyPath = loadEnemyPath();

// Inicializar sistema de renderização
const renderSystem = new RenderSystem(ctx, GAME_CONFIG, enemyPath);

// Garantir que o gameState seja a mesma referência
renderSystem.gameState = gameState;

// Inicializar sistema de interface do usuário
const uiSystem = new UISystem(gameState);


// Garantir que o gameState seja a mesma referência
gameState = uiSystem.gameState;

// Inicializar sistema principal do jogo
const gameSystem = new GameSystem(gameState, GAME_CONFIG, enemyPath, Enemy, chooseEnemyType, calculateEnemyStats, DamageNumber, uiSystem, renderSystem);

// Garantir que o gameState seja a mesma referência
gameState = gameSystem.gameState;

// Inicializar botões das habilidades especiais
gameSystem.updateSpecialSkillsVisibility();

 // Controlar visibilidade primeiro
gameSystem.updateSpecialSkillUI('arrowRain');
gameSystem.updateSpecialSkillUI('iceStorm');
gameSystem.updateSpeedUI();
// Tornar gameSystem acessível globalmente para o menu


// ============================================================================
// FUNÇÕES UTILITÁRIAS
// ============================================================================

// Função para verificar se está em dispositivo mobile
function isMobile() {
    return window.innerWidth <= RESPONSIVE_BREAKPOINTS.MOBILE;
}

// ============================================================================
// FUNÇÕES DE INTERFACE DO USUÁRIO (UI)
// ============================================================================

// Função para mostrar informações da torre
// Função para atualizar informações básicas da torre
function updateTowerBasicInfo(tower) {
    const elements = {
        title: document.getElementById('towerInfoTitle'),
        level: document.getElementById('towerLevel'),
        damage: document.getElementById('towerDamage'),
        range: document.getElementById('towerRange'),
        fireRate: document.getElementById('towerFireRate'),
        icon: document.getElementById('towerIconDisplay')
    };
    
    if (elements.title) elements.title.textContent = tower.name;
    if (elements.level) elements.level.textContent = tower.level;
    if (elements.damage) elements.damage.textContent = tower.damage;
    if (elements.range) elements.range.textContent = tower.range;
    
    // Converter taxa de tiro para segundos
    const fireRateSeconds = (tower.fireRate / 1000).toFixed(1);
    if (elements.fireRate) elements.fireRate.textContent = `${fireRateSeconds}s`;
    
    // Mostrar ícone da torre
    const towerIcon = TOWER_TYPES[tower.type]?.icon || '🏰';
    if (elements.icon) elements.icon.textContent = towerIcon;
}

// Função para calcular custos da torre
function calculateTowerCosts(tower) {
    const upgradeCost = tower.getUpgradeCost();
    const sellPercentage = localStorage.getItem(ARQUEIRO_CONFIG_KEY) ? 
        JSON.parse(localStorage.getItem(ARQUEIRO_CONFIG_KEY)).sellPercentage : GAME_CONSTANTS.DEFAULT_SELL_PERCENTAGE;
    const sellValue = Math.floor(tower.totalCost * (sellPercentage / 100));
    
    return { upgradeCost, sellValue };
}

// Função para atualizar valores de custo na UI
function updateTowerCostInfo(upgradeCost, sellValue) {
    const upgradeCostElement = document.getElementById('upgradeCost');
    const sellValueElement = document.getElementById('sellValue');
    
    if (upgradeCostElement) upgradeCostElement.textContent = upgradeCost;
    if (sellValueElement) sellValueElement.textContent = sellValue;
}

// Função para configurar botões da torre
function configureTowerButtons(tower, upgradeCost) {
    const upgradeBtn = document.getElementById('upgradeTower');
    const sellBtn = document.getElementById('sellTower');
    
    if (!upgradeBtn || !sellBtn) return;
    
    const isMaxLevel = tower.level >= tower.getMaxLevel();
    upgradeBtn.disabled = gameState.gold < upgradeCost || isMaxLevel;
    
    // Atualizar texto do botão se estiver no nível máximo
    if (isMaxLevel) {
        upgradeBtn.innerHTML = `
            <span class="btn-icon">⬆️</span>
            <span class="btn-text">Nível Máximo</span>
            <span class="btn-cost">--</span>
        `;
    } else {
        upgradeBtn.innerHTML = `
            <span class="btn-icon">⬆️</span>
            <span class="btn-text">Evoluir</span>
            <span class="btn-cost" id="upgradeCost">${upgradeCost}</span>
        `;
    }
    
    sellBtn.disabled = false;
}

// Função para configurar modal da torre
function setupTowerModal(tower) {
    gameState.selectedTowerForInfo = tower;
    const modal = document.getElementById('towerInfoPanel');
    
    if (!modal) return;
    
    modal.style.display = 'flex';
    
    // Adicionar evento para fechar ao clicar fora
    const handleOutsideClick = function(e) {
        if (e.target === modal) {
            closeTowerInfo();
            modal.removeEventListener('click', handleOutsideClick);
        }
    };
    modal.addEventListener('click', handleOutsideClick);
}

function showTowerInfo(tower) {
    // Aplicar bônus e selecionar torre
    if (tower.applyBonuses) tower.applyBonuses();
    gameState.towers.forEach(t => t.isSelected = false);
    tower.isSelected = true;
    
    // Atualizar informações básicas
    updateTowerBasicInfo(tower);
    
    // Calcular e atualizar custos
    const { upgradeCost, sellValue } = calculateTowerCosts(tower);
    updateTowerCostInfo(upgradeCost, sellValue);
    
    // Configurar botões
    configureTowerButtons(tower, upgradeCost);
    
    // Configurar modal
    setupTowerModal(tower);
}

// Fechar painel de informações da torre
function closeTowerInfo() {
    const modal = document.getElementById('towerInfoPanel');
    if (modal) {
        modal.style.display = 'none';
    }
    
    // Desselecionar todas as torres
    if (gameState && gameState.towers) {
        gameState.towers.forEach(t => t.isSelected = false);
    }
    if (gameState) {
        gameState.selectedTowerForInfo = null;
    }
}

// Função para atualizar estatísticas básicas do jogo
function updateGameStats() {
    const elements = {
        health: document.getElementById('health'),
        gold: document.getElementById('gold'),
        wave: document.getElementById('wave'),
        score: document.getElementById('score'),
        monsters: document.getElementById('monsters')
    };
    
    if (elements.health) elements.health.textContent = gameState.health;
    if (elements.gold) elements.gold.textContent = gameState.gold;
    if (elements.wave) elements.wave.textContent = gameState.wave;
    if (elements.score) elements.score.textContent = gameState.score;
    
    // Exibir monstros total/eliminados
    if (elements.monsters) {
        elements.monsters.textContent = `${gameState.monstersThisWave || 0}/${gameState.monstersDefeated || 0}`;
    }
}

// Função para atualizar tempo do jogo
function updateGameTime() {
    const gameTimeElement = document.getElementById('gameTime');
    if (!gameTimeElement) return;
    
    const minutes = Math.floor(gameState.gameTime / 60);
    const seconds = Math.floor(gameState.gameTime % 60);
    gameTimeElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Função para atualizar timer da próxima onda
function updateNextWaveTimer() {
    const nextWaveTimerElement = document.getElementById('nextWaveTimer');
    if (!nextWaveTimerElement) return;
    
    if (gameState.waveInProgress) {
        nextWaveTimerElement.textContent = 'Em andamento';
    } else if (gameState.nextWaveTimer > 0) {
        const seconds = Math.ceil(gameState.nextWaveTimer);
        nextWaveTimerElement.textContent = `${seconds}s`;
    } else if (gameState.wave > 0) {
        nextWaveTimerElement.textContent = 'Pronta';
    } else {
        nextWaveTimerElement.textContent = '--';
    }
}

// Função para atualizar botão de iniciar onda
function updateStartButton() {
    const startBtn = document.getElementById('start-wave');
    if (!startBtn) return;
    
    const shouldDisable = gameState.waveInProgress || 
                         gameState.nextWaveTimer <= 0 || 
                         gameState.enemies.length > 0;
    
    startBtn.disabled = shouldDisable;
}

// Função para atualizar botões de torre
function updateTowerButtons() {
    document.querySelectorAll('.tower-btn').forEach(btn => {
        const cost = parseInt(btn.dataset.cost);
        if (gameState.gold < cost) {
            btn.classList.add('disabled');
        } else {
            btn.classList.remove('disabled');
        }
    });
}

function updateUI() {
    // Verificar se gameState existe
    if (!gameState) return;
    
    // Atualizar todas as seções da UI
    updateGameStats();
    updateGameTime();
    updateNextWaveTimer();
    updateStartButton();
    updateTowerButtons();
}

// Gerar dinamicamente as opções de torres no painel lateral
function renderTowerOptions() {
    const GAME_CONFIG = window.GAME_CONFIG;
    const towerOptionsDiv = document.getElementById('footerTowerBar');
    if (!towerOptionsDiv) {
        return;
    }
    towerOptionsDiv.innerHTML = '';
    Object.entries(TOWER_TYPES).forEach(([key, tower]) => {
        const btn = document.createElement('button');
        btn.className = 'tower-btn';
        btn.dataset.tower = key;
        btn.dataset.cost = tower.cost;
        btn.dataset.towerName = tower.name;
        btn.title = `${tower.name} - ${tower.cost} ouro`;
        // Adicionar atributos para tooltip mobile
        btn.setAttribute('data-tower-name', tower.name);
        btn.setAttribute('data-cost', tower.cost);
        let locked = false;
        if (key === 'special' && !GAME_CONFIG.specialTowerUnlocked) {
            locked = true;
            btn.classList.add('locked');
            btn.disabled = true;
            btn.title = 'Desbloqueie a torre especial na árvore de habilidades para usar';
            btn.style.border = '2px solid #0066cc';
        }
        btn.innerHTML = `
            <div class="tower-icon" style="position:relative;">${tower.icon || ''}${locked ? '<span style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:1.5em;z-index:10;pointer-events:none;">🔒</span>' : ''}</div>
            <div class="tower-info">
                <div class="tower-name">${tower.name}</div>
                <div class="tower-cost">${tower.cost} ouro</div>
            </div>
        `;
        btn.addEventListener('click', () => {
            if (btn.classList.contains('disabled') || btn.classList.contains('locked')) return;
            
            // Se a torre já está selecionada, desselecionar
            if (gameState.selectedTower === key) {
                gameState.selectedTower = null;
                gameState.selectedTowerType = null;
                gameState.mouseX = undefined;
                gameState.mouseY = undefined;
                btn.classList.remove('selected');
            } else {
                // Selecionar nova torre
                gameState.selectedTower = key;
                document.querySelectorAll('.footer-tower-bar .tower-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
            }
        });
        
        // Verificar se o jogador tem ouro suficiente
        if (gameState.gold < tower.cost && !locked) {
            btn.classList.add('disabled');
        }
        
        towerOptionsDiv.appendChild(btn);
    });
    
    // Atualizar estado dos botões quando o ouro mudar
    updateTowerButtonStates();
}

// Função para atualizar estados dos botões de torre baseado no ouro
window.updateTowerButtonStates = function() {
    if (!gameState) return;
    
    const towerButtons = document.querySelectorAll('.footer-tower-bar .tower-btn');
    towerButtons.forEach(btn => {
        const cost = parseInt(btn.dataset.cost) || 0;
        const towerKey = btn.dataset.tower;
        const tower = TOWER_TYPES[towerKey];
        
        if (!tower) return;
        
        // Remover estados anteriores
        btn.classList.remove('disabled');
        
        // Verificar se está bloqueado (torre especial)
        const isLocked = towerKey === 'special' && !GAME_CONFIG.specialTowerUnlocked;
        
        if (!isLocked && gameState.gold < cost) {
            btn.classList.add('disabled');
            btn.title = `${tower.name} - ${cost} ouro (Ouro insuficiente: ${gameState.gold}/${cost})`;
                 } else if (!isLocked) {
             btn.title = `${tower.name} - ${cost} ouro`;
         }
     });
};

// Chamar após carregar as configs e sempre que recarregar
function onReady() {
    // Garantir que as configurações estejam carregadas antes de ajustar o canvas
    GAME_CONFIG = loadGameConfig();
    applySkillTreeEffects(GAME_CONFIG, loadSkillTree());
    TOWER_TYPES = loadTowerConfig();
    
    // Agora ajustar o canvas com as configurações corretas
    adjustCanvasSize();
    renderTowerOptions();
    
    // Configurar event listeners da dificuldade
    
    // Garantir que as habilidades especiais sejam verificadas na inicialização
    setTimeout(() => {
        if (window.gameSystem) {
            window.gameSystem.updateSpecialSkillsVisibility();
        }
    }, 100);
    
    // Verificar se é um usuário novo para mostrar o tutorial
    checkFirstTimeUser();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onReady);
} else {
    onReady();
}

// ============================================================================
// SISTEMA DE TUTORIAL
// ============================================================================

// Sistema de Tutorial
let tutorialState = {
    currentStep: 1,
    totalSteps: 6,
    isActive: false
};

function showTutorial() {
    tutorialState.isActive = true;
    tutorialState.currentStep = 1;
    updateTutorialStep();
    document.getElementById('tutorialModal').style.display = 'flex';
}

function hideTutorial() {
    tutorialState.isActive = false;
    document.getElementById('tutorialModal').style.display = 'none';
}

function updateTutorialStep() {
    for (let i = 1; i <= tutorialState.totalSteps; i++) {
        const step = document.getElementById(`tutorialStep${i}`);
        if (step) {
            step.classList.remove('active');
        }
    }
    
    // Mostrar o passo atual
    const currentStep = document.getElementById(`tutorialStep${tutorialState.currentStep}`);
    if (currentStep) {
        currentStep.classList.add('active');
    }
    
    // Atualizar indicador de progresso
    document.getElementById('tutorialStep').textContent = tutorialState.currentStep;
    document.getElementById('tutorialTotal').textContent = tutorialState.totalSteps;
    
    // Atualizar botões de navegação
    const prevBtn = document.getElementById('tutorialPrev');
    const nextBtn = document.getElementById('tutorialNext');
    const finishBtn = document.getElementById('tutorialFinish');
    
    prevBtn.disabled = tutorialState.currentStep === 1;
    nextBtn.style.display = tutorialState.currentStep === tutorialState.totalSteps ? 'none' : 'inline-block';
    finishBtn.style.display = tutorialState.currentStep === tutorialState.totalSteps ? 'inline-block' : 'none';
}

function nextTutorialStep() {
    if (tutorialState.currentStep < tutorialState.totalSteps) {
        tutorialState.currentStep++;
        updateTutorialStep();
    }
}

function prevTutorialStep() {
    if (tutorialState.currentStep > 1) {
        tutorialState.currentStep--;
        updateTutorialStep();
    }
}

function finishTutorial() {
    hideTutorial();
    // Salvar que o tutorial foi visto
    localStorage.setItem(TUTORIAL_COMPLETED_KEY, 'true');
}

function checkFirstTimeUser() {
    const tutorialCompleted = localStorage.getItem(TUTORIAL_COMPLETED_KEY);
    if (!tutorialCompleted) {
        // Mostrar tutorial automaticamente para novos usuários
        setTimeout(() => {
            showTutorial();
        }, 1000); // Pequeno delay para garantir que o menu carregou
    }
}

// Event listeners do tutorial
document.addEventListener('DOMContentLoaded', function() {
    // Botão de tutorial no menu
    const btnTutorial = document.getElementById('btnTutorial');
    if (btnTutorial) {
        btnTutorial.addEventListener('click', showTutorial);
    }
    
    // Botões de navegação do tutorial
    const closeTutorialBtn = document.getElementById('closeTutorialModal');
    const prevBtn = document.getElementById('tutorialPrev');
    const nextBtn = document.getElementById('tutorialNext');
    const finishBtn = document.getElementById('tutorialFinish');
    
    if (closeTutorialBtn) {
        closeTutorialBtn.addEventListener('click', hideTutorial);
    }
    
    if (prevBtn) {
        prevBtn.addEventListener('click', prevTutorialStep);
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', nextTutorialStep);
    }
    
    if (finishBtn) {
        finishBtn.addEventListener('click', finishTutorial);
    }
    
    // Fechar tutorial ao clicar fora
    const tutorialModal = document.getElementById('tutorialModal');
    if (tutorialModal) {
        tutorialModal.addEventListener('click', function(e) {
            if (e.target === tutorialModal) {
                hideTutorial();
            }
        });
    }
    
    // Navegação por teclado
    document.addEventListener('keydown', function(e) {
        if (!tutorialState.isActive) return;
        
        switch(e.key) {
            case 'ArrowRight':
            case ' ':
                e.preventDefault();
                if (tutorialState.currentStep < tutorialState.totalSteps) {
                    nextTutorialStep();
                } else {
                    finishTutorial();
                }
                break;
            case 'ArrowLeft':
                e.preventDefault();
                if (tutorialState.currentStep > 1) {
                    prevTutorialStep();
                }
                break;
            case 'Escape':
                e.preventDefault();
                hideTutorial();
                break;
        }
    });
});

// ============================================================================
// EVENT LISTENERS E INTERAÇÕES
// ============================================================================

// Event listeners
canvas.addEventListener('click', (e) => {
    if (gameState.isGameOver) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;
    const gridPos = renderSystem.getGridPosition(mouseX, mouseY);

    // Verificar se clicou em uma torre existente
    const clickedTower = renderSystem.getTowerAtPosition(gridPos.x, gridPos.y, gameState);
    if (clickedTower) {
        showTowerInfo(clickedTower);
        return;
    }

    // Colocar nova torre
    if (gameState.selectedTower && renderSystem.canPlaceTower(gridPos.x, gridPos.y, gameState)) {
        updateSkillTreeAndConfig();
        const towerType = gameState.selectedTower;
        const cost = TOWER_TYPES[towerType].cost;

        if (gameState.gold >= cost) {
            // Criar nova torre
            const newTower = new Tower(
                gridPos.x, 
                gridPos.y, 
                towerType, 
                TOWER_TYPES, 
                GAME_CONFIG, 
                gameState, 
                ctx, 
                Projectile, 
                () => uiSystem.updateUI(), 
                (message, type) => uiSystem.showNotification(message, type), 
                TeslaChainProjectile, 
                CannonProjectile,
                renderSystem.imageManager
            );
            
            // Adicionar ao gameState (gameSystem.gameState é a mesma referência)
            gameState.towers.push(newTower);
            
            // Deduzir ouro
            gameState.gold -= cost;
            
            // MANTER a torre selecionada para facilitar a colocação de múltiplas torres
            
            // Atualizar UI
            uiSystem.updateUI();
            
            // Notificar criação da torre
            uiSystem.showNotification(`Torre ${TOWER_TYPES[towerType].name} construída!`, 'success');
        } else {
            uiSystem.showNotification('Ouro insuficiente!', 'error');
        }
    } else if (gameState.selectedTower) {
        // Se tem torre selecionada mas não pode colocar aqui, mostrar feedback
        uiSystem.showNotification('Não é possível colocar torre nesta posição!', 'error');
    }
});

// Adicionar tecla ESC para desselecionar torre
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && gameState.selectedTower) {
        gameState.selectedTower = null;
        gameState.selectedTowerType = null;
        gameState.mouseX = undefined;
        gameState.mouseY = undefined;
        document.querySelectorAll('.footer-tower-bar .tower-btn').forEach(b => b.classList.remove('selected'));
        uiSystem.showNotification('Torre desselecionada!', 'info');
    }
});

document.getElementById('start-wave').addEventListener('click', () => {
    gameSystem.startWave();
});

document.getElementById('pause').addEventListener('click', () => {
    gameSystem.togglePause();
});

document.getElementById('restart').addEventListener('click', () => {
    // Em vez de reiniciar diretamente, voltar ao menu principal
    document.getElementById('gameOver').style.display = 'none';
    
    // Voltar ao menu principal
    if (typeof window.showMainMenu === 'function') {
        window.showMainMenu();
    } else {
        // Fallback se a função não existir
        const menu = document.getElementById('mainMenu');
        if (menu) {
            menu.style.display = 'flex';
            document.body.classList.remove('game-running');
        }
    }
    
    
});

// Event listeners do painel de informações da torre
document.getElementById('upgradeTower').addEventListener('click', () => {
    if (gameState.selectedTowerForInfo) {
        const success = gameState.selectedTowerForInfo.upgrade();
        if (success) {
            showTowerInfo(gameState.selectedTowerForInfo); // Atualizar painel
        }
    }
});

document.getElementById('sellTower').addEventListener('click', () => {
    if (gameState.selectedTowerForInfo) {
        const refund = gameState.selectedTowerForInfo.sell();
        closeTowerInfo();
        // Mostrar notificação do valor recebido
        uiSystem.showNotification(`Torre vendida! Recebeu ${refund} ouro!`, 'success');
    }
});

document.getElementById('closeTowerInfo').addEventListener('click', closeTowerInfo);

// ============================================================================
// HABILIDADES ESPECIAIS
// ============================================================================

// --- Habilidade Especial: Chuva de Flechas ---
let arrowRainSelecting = false;
let arrowRainPreview = null; // {x, y} ou null

function activateArrowRainMode() {
    if (!gameSystem.useSpecialSkill('arrowRain')) return;
    
    // Aplicar bônus da árvore de habilidades
    const bonus = (GAME_CONFIG.arrowRainBonus || 0);
    const totalDamage = GAME_CONSTANTS.BASE_ARROW_RAIN_DAMAGE * (1 + SKILL_BONUSES.CHUVA_FLECHAS_BONUS * bonus);
    
    let hits = 0;
    [...gameState.enemies].forEach(enemy => {
        enemy.takeDamage(totalDamage);
        hits++;
    });
    
    uiSystem.showNotification(`Chuva de Flechas: ${hits} inimigos atingidos!`, 'success');
    
    [...gameState.enemies].forEach(enemy => {
        showArrowRainEffect(enemy.x, enemy.y);
    });
    
    // Garantir que o botão volte ao normal
    const btn = document.getElementById('btnArrowRain');
    if (btn) btn.classList.remove('selected');
    document.body.style.cursor = 'default';
}

function showArrowRainEffect(x, y) {
    // Desenhar círculos ou flechas caindo (placeholder)
    const ctx = gameState.ctx;
    if (!ctx) return;
    
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, GAME_CONSTANTS.ARROW_RAIN_RADIUS, 0, 2 * Math.PI);
    ctx.strokeStyle = '#ff9800';
    ctx.lineWidth = 4;
    ctx.globalAlpha = 0.5;
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.restore();
    // Pode adicionar animação depois
}

// --- Eventos ---
document.addEventListener('DOMContentLoaded', () => {
    setupSpecialSkillEventListeners();
});

// Função para configurar event listeners das habilidades especiais
function setupSpecialSkillEventListeners() {
    const btnArrow = document.getElementById('btnArrowRain');
    if (btnArrow) {
        // Remover listener antigo se existir
        btnArrow.removeEventListener('click', btnArrow._arrowRainHandler);
        
        // Criar novo handler e armazenar referência
        btnArrow._arrowRainHandler = () => {
            activateArrowRainMode();
        };
        
        // Adicionar listener
        btnArrow.addEventListener('click', btnArrow._arrowRainHandler);
        
        // Também adicionar onclick como fallback
        btnArrow.onclick = btnArrow._arrowRainHandler;
    }
    
    const btnIce = document.getElementById('btnIceStorm');
    if (btnIce) {
        // Remover listener antigo se existir
        btnIce.removeEventListener('click', btnIce._iceStormHandler);
        
        // Criar novo handler e armazenar referência
        btnIce._iceStormHandler = () => {
            activateIceStorm();
        };
        
        // Adicionar listener
        btnIce.addEventListener('click', btnIce._iceStormHandler);
        
        // Também adicionar onclick como fallback
        btnIce.onclick = btnIce._iceStormHandler;
    }
    
    // Configurar botão de velocidade
    const speedBtn = document.getElementById('speedButton');
    if (speedBtn) {
        // Remover listener antigo se existir
        speedBtn.removeEventListener('click', speedBtn._speedHandler);
        
        // Criar novo handler e armazenar referência
        speedBtn._speedHandler = () => {
            if (gameSystem) {
                gameSystem.toggleGameSpeed();
            }
        };
        
        // Adicionar listener
        speedBtn.addEventListener('click', speedBtn._speedHandler);
        
        // Também adicionar onclick como fallback
        speedBtn.onclick = speedBtn._speedHandler;
    }
}

// Função para re-configurar event listeners (para debug)
window.fixEventListeners = function() {

    setupSpecialSkillEventListeners();

};

// Função para testar event listeners


// Interceptar clique no canvas para lançar a habilidade
const gameCanvas = document.getElementById('gameCanvas');
if (gameCanvas) {
    gameCanvas.addEventListener('click', (e) => {
        if (arrowRainSelecting && arrowRainPreview) {
            handleArrowRainClick(arrowRainPreview.x, arrowRainPreview.y);
        }
    });
    gameCanvas.addEventListener('mousemove', (e) => {
        if (!arrowRainSelecting) {
            setArrowRainPreview(null);
            return;
        }
        const rect = gameCanvas.getBoundingClientRect();
        const scaleX = gameCanvas.width / rect.width;
        const scaleY = gameCanvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;
        setArrowRainPreview({x, y});
    });
    gameCanvas.addEventListener('mouseleave', () => {
        setArrowRainPreview(null);
    });
}

// Botões são inicializados no GameSystem após sua criação

// Integrar preview no loop de renderização do jogo
const originalRender = window.renderGame || null;
window.renderGame = function() {
    if (typeof originalRender === 'function') originalRender();
    // Desenhar preview da área de efeito se necessário
    if (arrowRainSelecting && arrowRainPreview && gameState.ctx) {
        const ctx = gameState.ctx;
        ctx.save();
        ctx.beginPath();
        ctx.arc(arrowRainPreview.x, arrowRainPreview.y, GAME_CONSTANTS.ARROW_RAIN_RADIUS, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(255, 152, 0, 0.18)';
        ctx.strokeStyle = '#ff9800';
        ctx.lineWidth = 2;
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }
};

// Inicializar jogo (pausado até clicar em "Jogar")
gameSystem.initializeFirstWave();
uiSystem.updateUI();
// Não iniciar o game loop automaticamente - será iniciado quando clicar em "Jogar"



function setArrowRainPreview(val) {
    arrowRainPreview = val;
}

// Função utilitária para mostrar/esconder tooltip
function showInfoTooltip(html, x, y) {
    const tooltip = document.getElementById('infoTooltip');
    tooltip.innerHTML = html;
    tooltip.style.display = 'block';
    
    // Ajustar posição para não sair da tela
    const pad = UI_CONSTANTS.TOOLTIP_PADDING;
    let left = x + pad;
    let top = y + pad;
    
    if (left + tooltip.offsetWidth > window.innerWidth) {
        left = x - tooltip.offsetWidth - pad;
    }
    if (top + tooltip.offsetHeight > window.innerHeight) {
        top = y - tooltip.offsetHeight - pad;
    }
    
    tooltip.style.left = left + 'px';
    tooltip.style.top = top + 'px';
}
function hideInfoTooltip() {
    const tooltip = document.getElementById('infoTooltip');
    tooltip.style.display = 'none';
}

// Detectar mouse sobre torres/inimigos
canvas.addEventListener('mousemove', (e) => {
    if (arrowRainSelecting) return; // Não mostrar tooltip durante seleção de magia
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;
    
    // SEMPRE atualizar posição do mouse para preview da torre
    gameState.mouseX = mouseX;
    gameState.mouseY = mouseY;
    
    // Definir selectedTowerType se há torre selecionada
    if (gameState.selectedTower) {
        gameState.selectedTowerType = gameState.selectedTower;
    }
    
    // Procurar torre sob o mouse
    const tower = renderSystem.getTowerAtPosition(mouseX, mouseY, gameState);
    
    // Resetar hover de todas as torres
    gameState.towers.forEach(t => t.isHovered = false);
    
    if (tower) {
        // Definir hover para a torre atual
        tower.isHovered = true;
        
        showInfoTooltip(
            `<b>${tower.name} (Nível ${tower.level})</b><br>` +
            `Dano: ${tower.damage}<br>` +
            `Alcance: ${tower.range}<br>` +
            `Vel. Ataque: ${(tower.fireRate/60).toFixed(2)}s<br>` +
            `Upgrade: ${tower.getUpgradeCost()} ouro<br>` +
            `Venda: ${Math.floor(tower.totalCost * ((localStorage.getItem('arqueiroConfig') ? JSON.parse(localStorage.getItem('arqueiroConfig')).sellPercentage : 50) / 100))} ouro`
        , e.clientX, e.clientY);
        return;
    }
    // Procurar inimigo sob o mouse
    let foundEnemy = null;
    for (const enemy of gameState.enemies) {
        const dx = enemy.x - mouseX;
        const dy = enemy.y - mouseY;
        if (Math.sqrt(dx*dx + dy*dy) <= enemy.size) {
            foundEnemy = enemy;
            break;
        }
    }
    if (foundEnemy) {
        showInfoTooltip(
            `<b>${foundEnemy.type.charAt(0).toUpperCase() + foundEnemy.type.slice(1)}</b><br>` +
            `Vida: ${Math.max(0, Math.round(foundEnemy.health))} / ${foundEnemy.maxHealth}<br>` +
            `Velocidade: ${foundEnemy.speed}<br>` +
            `Recompensa: ${foundEnemy.reward} ouro`
        , e.clientX, e.clientY);
        return;
    }
    hideInfoTooltip();
});
canvas.addEventListener('mouseleave', () => {
    hideInfoTooltip();
    // Limpar hover de todas as torres quando o mouse sai do canvas
    gameState.towers.forEach(t => t.isHovered = false);
});

// --- Tempestade de Gelo ---
function getIceStormDuration() {
    // Duração base + bônus da árvore (cong_mag)
    return GAME_CONSTANTS.ICE_STORM_BASE_DURATION + (GAME_CONFIG.mageFreezeBonus || 0);
}

function activateIceStorm() {
    if (!gameSystem.useSpecialSkill('iceStorm')) return;
    
    const duration = getIceStormDuration();
    const enemiesAffected = gameState.enemies.length;
    
    gameState.enemies.forEach(enemy => {
        enemy.slowUntil = Date.now() + duration * 1000;
        enemy.originalSpeed = enemy.originalSpeed || enemy.speed;
        enemy.speed = GAME_CONSTANTS.ICE_STORM_SLOW_SPEED; // praticamente parado
        enemy.isFrozen = true;
    });
    
    uiSystem.showNotification(`Tempestade de Gelo: ${enemiesAffected} inimigos congelados por ${duration.toFixed(1)}s!`, 'success');
    
    setTimeout(() => {
        gameState.enemies.forEach(enemy => {
            if (enemy.isFrozen) {
                enemy.speed = enemy.originalSpeed || enemy.speed;
                enemy.isFrozen = false;
            }
        });
    }, duration * 1000);
}

// Event listeners serão configurados quando o gameSystem for inicializado

// --- Ouro extra por onda ---
// No fim da onda, ao premiar o jogador:
// Dentro do gameSystem.gameLoop, após completar a onda:
// const waveBonusMultiplier = 10; // Exemplo: 10 de pontos base por onda
// const waveBonus = (gameState.wave + 1) * waveBonusMultiplier;
// gameState.score += waveBonus;
// Aplicar bônus de ouro extra por onda
// const goldBonus = Math.floor((GAME_CONFIG.goldPerWaveBonus || 1) * 10); // Exemplo: 10 de ouro base por onda
// gameState.gold += goldBonus;
// uiSystem.showNotification(`Onda ${gameState.wave + 1} completada! +${waveBonus} pontos! +${goldBonus} ouro extra!`, 'success');

// ============================================================================
// SISTEMA DE ÁRVORE DE HABILIDADES - FUNÇÕES DE ATUALIZAÇÃO
// ============================================================================

// Sempre que skillTree for alterada, reaplicar efeitos e atualizar torres
function updateSkillTreeAndConfig() {
    skillTree = loadSkillTree();
    applySkillTreeEffects(GAME_CONFIG, skillTree);
    if (gameState && gameState.towers) {
        gameState.towers.forEach(tower => {
            tower.gameConfig = GAME_CONFIG;
            tower.applyBonuses && tower.applyBonuses();
        });
    }
}

// Função para atualizar árvore e efeitos após upgrade
function onSkillTreeUpgrade() {
    skillTree = loadSkillTree();
    
    updateSkillTreeAndConfig();
    
    // Atualizar botões das habilidades especiais
    if (gameSystem) {
        gameSystem.updateSpecialSkillsVisibility(); // Verificar se devem ser desbloqueadas
        gameSystem.updateSpecialSkillUI('arrowRain');
        gameSystem.updateSpecialSkillUI('iceStorm');
        
        // Verificar estado atual
        const arrowUnlocked = gameSystem.isSpecialSkillUnlocked('arrowRain');
        const iceUnlocked = gameSystem.isSpecialSkillUnlocked('iceStorm');
    }
    
    // Recarregar GAME_CONFIG e skillTree do localStorage antes de atualizar o menu de torres
    const updatedSkillTree = loadSkillTree();
    applySkillTreeEffects(GAME_CONFIG, updatedSkillTree);
    
    renderTowerOptions(); // Atualiza o menu de torres ao desbloquear habilidades
}

document.addEventListener('skillTreeChanged', (event) => {
    if (gameSystem) {
        gameSystem.updateSpecialSkillsVisibility(); // Verificar se devem ser desbloqueadas
        gameSystem.updateSpecialSkillUI('arrowRain');
        gameSystem.updateSpecialSkillUI('iceStorm');
        
        // Log do estado atual
        const arrowUnlocked = gameSystem.isSpecialSkillUnlocked('arrowRain');
        const iceUnlocked = gameSystem.isSpecialSkillUnlocked('iceStorm');
    }
});

// ============================================================================
// FUNÇÕES DE PROGRESSO E SALVAMENTO
// ============================================================================

// Função utilitária para calcular ouro acumulado até uma onda
function calcularOuroAteOnda(onda, enemiesPerWave, enemyReward) {
    let total = 0;
    for (let i = 1; i < onda; i++) {
        const enemiesThisWave = enemiesPerWave + (i - 1) * (GAME_CONFIG.enemiesIncrease || 2);
        const goldThisWave = enemiesThisWave * (GAME_CONFIG.enemyReward || 10);
        total += goldThisWave;
    }
    return total;
}

// Salvar maior onda atingida ao perder
function salvarMaiorOnda(onda) {
    const atual = parseInt(localStorage.getItem(MAIOR_ONDA_KEY) || '1');
    if (onda > atual) localStorage.setItem(MAIOR_ONDA_KEY, onda);
    
    // Salvar progresso por dificuldade
    const selectedDifficulty = localStorage.getItem('selectedDifficulty') || 'normal';
    const progressKey = `progress_${selectedDifficulty}`;
    localStorage.setItem(progressKey, onda.toString());
}

// Controlar visibilidade do botão Continuar no menu inicial
function adicionarBotaoContinuarMenu() {
    const difficulties = ['easy', 'normal', 'hard'];
    let maxProgress = 0;
    
    // Verificar progresso de todas as dificuldades
    difficulties.forEach(diff => {
        const progressKey = `progress_${diff}`;
        const progress = parseInt(localStorage.getItem(progressKey) || '0');
        if (progress > maxProgress) {
            maxProgress = progress;
        }
    });
    
    const btn = document.getElementById('btnContinue');
    
    if (btn) {
        // Atualizar os elementos span separados
        const continueText = btn.querySelector('.continue-text');
        const continueWave = btn.querySelector('.continue-wave');
        
        if (maxProgress > 0) {
            if (continueText) continueText.textContent = 'Continuar';
            if (continueWave) continueWave.textContent = `(onda ${maxProgress})`;
            btn.style.display = 'flex';
        } else {
            btn.style.display = 'none';
        }
    }
}

// A inicialização do botão "Continuar" agora é feita via index.html com setTimeout

// Adicionar botão Continuar na tela de game over
function adicionarBotaoContinuarGameOver() {
    const key = 'maiorOndaAtingida';
    const maiorOnda = parseInt(localStorage.getItem(key) || '1');
    let btn = document.getElementById('btnContinueGameOver');
    if (!btn) {
        btn = document.createElement('button');
        btn.id = 'btnContinueGameOver';
        btn.className = 'btn btn-success';
        btn.textContent = 'Continuar do Nível ' + maiorOnda;
        btn.style.marginTop = '18px';
        btn.onclick = () => {
            document.getElementById('gameOver').style.display = 'none';
            iniciarModoContinuar();
        };
        document.querySelector('.game-over-content').appendChild(btn);
    }
    btn.style.display = maiorOnda > 1 ? 'block' : 'none';
    btn.textContent = 'Continuar do Nível ' + maiorOnda;
}

// Função para iniciar o modo continuar
function iniciarModoContinuar() {
    const selectedDifficulty = localStorage.getItem('selectedDifficulty') || 'normal';
    const progressKey = `progress_${selectedDifficulty}`;
    const maiorOnda = parseInt(localStorage.getItem(progressKey) || '1');
    
    if (maiorOnda <= 1) {
        iniciarNovoJogo();
        return;
    }
    
    // ATUALIZAR GAME_CONFIG ANTES DE CALCULAR O OURO
    GAME_CONFIG = loadGameConfig();
    
    // Calcular ouro acumulado
    const enemiesPerWave = GAME_CONFIG.enemiesPerWave || 5;
    const enemyReward = GAME_CONFIG.enemyReward || 10;
    const enemiesIncrease = GAME_CONFIG.enemiesIncrease || 2;
    const ouro = calcularOuroAteOnda(maiorOnda, enemiesPerWave, enemyReward);
    
    // Função customizada para o modo continuar
    function getInitialGameStateContinuar() {
        let config = loadGameConfig();
        applySkillTreeEffects(config, loadSkillTree());
        
        const newGameState = {
            health: config.initialHealth,
            gold: ouro,
            wave: maiorOnda - 1, // O jogo já incrementa ao iniciar a próxima onda
            isPaused: false,
            isGameOver: false,
            selectedTower: null,
            selectedTowerType: null, // Adicionar campo faltante
            mouseX: undefined,
            mouseY: undefined,
            towers: [],
            enemies: [],
            projectiles: [],
            visualEffects: [], // Adicionar visualEffects
            waveInProgress: false,
            allEnemiesSpawned: false,
            waveTimer: 0,
            nextWaveTimer: 0,
            gameTime: 0,
            score: 0,
            damageNumbers: [],
            monstersThisWave: 0,
            monstersDefeated: 0,
            // Variáveis do novo sistema de spawn
            enemiesSpawned: 0,
            lastSpawnTime: 0,
            spawnInterval: 1.0 // segundos
        };
        
        return newGameState;
    }
    
    // Função customizada para inicializar o modo continuar (não reseta wave)
    function initializeContinuarMode() {
        const savedConfig = localStorage.getItem('arqueiroConfig');
        const waveDelaySeconds = savedConfig ? JSON.parse(savedConfig).waveDelaySeconds || 5 : 5;
        gameSystem.gameState.nextWaveTimer = waveDelaySeconds;
        gameSystem.gameState.waveInProgress = false;
        gameSystem.gameState.allEnemiesSpawned = false;
    }
    
    gameSystem.restart(getInitialGameStateContinuar, initializeContinuarMode);
    
    // ATUALIZAR A VARIÁVEL GLOBAL gameState (faltava)
    gameState = gameSystem.gameState;
    
    // Atualizar referências nos sistemas (faltava)
    uiSystem.setGameState(gameState);
    renderSystem.gameState = gameState;
    
    // Garantir que o sistema de torres esteja funcionando (faltava)
    if (gameSystem.reinitializeTowers) {
        gameSystem.reinitializeTowers();
    }
    
    // Recarregar configurações e torres (faltava)
    reloadConfigs();
    renderTowerOptions();
    
    // Recarregar enemyPath para garantir que o caminho correto seja usado
    const newEnemyPath = loadEnemyPath();
    renderSystem.updateEnemyPath(newEnemyPath);
    gameSystem.enemyPath = newEnemyPath;
    
    // Atualizar GAME_CONFIG no GameSystem também
    gameSystem.GAME_CONFIG = GAME_CONFIG;
    
    // Atualizar UI (faltava)
    uiSystem.updateUI();
    
    // Esconder menu se estiver visível
    const menu = document.getElementById('mainMenu');
    if (menu) menu.style.display = 'none';
    
    // Notificar o jogador
    uiSystem.showNotification(`Continuando do nível ${maiorOnda} com ${ouro} ouro!`, 'info');
    // Iniciar o game loop
    gameSystem.startGameLoop();
}

// Função para iniciar um novo jogo (diferente do modo continuar)
function iniciarNovoJogo() {
    // Usar função getInitialGameState para criar estado completamente novo
    gameSystem.restart(getInitialGameState, () => {

        
        // Inicializar primeira onda normalmente
        gameSystem.initializeFirstWave();
        
        // ATUALIZAR A VARIÁVEL GLOBAL gameState
        gameState = gameSystem.gameState;
        
        // Atualizar referências nos sistemas
        uiSystem.setGameState(gameState);
        renderSystem.gameState = gameState;
        
        // Garantir que o sistema de torres esteja funcionando
        if (gameSystem.reinitializeTowers) {
            gameSystem.reinitializeTowers();
        }
        
        // Recarregar configurações e torres
        reloadConfigs();
        renderTowerOptions();
        
        // Atualizar UI
        uiSystem.updateUI();
        

    });
    
    // Esconder menu se estiver visível
    const menu = document.getElementById('mainMenu');
    if (menu) menu.style.display = 'none';
    
    // Notificar o jogador
    uiSystem.showNotification('Novo jogo iniciado!', 'success');
    // Iniciar o game loop
    gameSystem.startGameLoop();
}

// Expor funções necessárias para o escopo global
window.iniciarModoContinuar = iniciarModoContinuar;
window.iniciarNovoJogo = iniciarNovoJogo;
window.adicionarBotaoContinuarMenu = adicionarBotaoContinuarMenu;
window.showDifficultyModal = showDifficultyModal;