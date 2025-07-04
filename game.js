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

// --- Árvore de Habilidades ---
const SKILL_TREE_KEY = 'arqueiroSkillTree';
const SKILL_POINTS_KEY = 'arqueiroUpgradePoints';

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
    dano: '⚔️', dano_arq: '🏹', vel_arq: '💨', dano_can: '💣', alc_can: '💥', dano_mag: '🔮', cong_mag: '❄️', dano_tes: '⚡', enc_tes: '🔗',
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

function renderSkillTreePanel(branch, containerId) {
    const tree = SKILL_TREE.filter(node => node.branch === branch || node.id === branch);
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    // Agrupar por camadas (row)
    const layers = {};
    tree.forEach(node => {
        if (!layers[node.row]) layers[node.row] = [];
        layers[node.row].push(node);
    });
    const maxRow = Math.max(...tree.map(n => n.row));

    // Renderizar nós centralizados por camada
    const nodeDivs = {};
    for (let row = 1; row <= maxRow; row++) {
        const layer = layers[row] || [];
        const rowDiv = document.createElement('div');
        rowDiv.className = 'skill-tree-row';
        rowDiv.style.display = 'flex';
        rowDiv.style.justifyContent = 'center';
        rowDiv.style.gap = '32px';
        rowDiv.style.position = 'relative';
        rowDiv.style.height = '110px';
        layer.forEach(node => {
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
            // Tooltip
            const tooltip = document.createElement('div');
            tooltip.className = 'skill-tooltip';
            tooltip.innerHTML = `<b>${node.name}</b><br>${node.desc}<br><span style='color:#b26a00;font-size:0.95em;'>${unlocked ? 'Desbloqueada' : available ? 'Disponível' : 'Bloqueada'}</span><br>Custo: ${node.cost}<br>Nível: ${level}/${node.max}`;
            nodeDiv.appendChild(tooltip);
            nodeDiv.onmouseenter = () => { tooltip.style.display = 'block'; };
            nodeDiv.onmouseleave = () => { tooltip.style.display = 'none'; };
            rowDiv.appendChild(nodeDiv);
        });
        container.appendChild(rowDiv);
    }
    // Desenhar conexões SVG entre os nós (após renderizar)
    setTimeout(() => {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.classList.add('skill-conn');
        svg.setAttribute('width', container.offsetWidth);
        svg.setAttribute('height', container.offsetHeight);
        svg.style.position = 'absolute';
        svg.style.left = '0';
        svg.style.top = '0';
        svg.style.pointerEvents = 'none';
        svg.style.zIndex = 1;
        // Para cada nó, se tiver parent, desenhar linha do centro do parent até o centro do filho
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
        container.appendChild(svg);
    }, 10);
}

// Renderizar as três árvores
renderSkillTreePanel('vida', 'skill-tree-vida');
renderSkillTreePanel('dano', 'skill-tree-dano');
renderSkillTreePanel('esp', 'skill-tree-especial');

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
window.addEventListener('mousedown', (e) => {
    const modal = document.getElementById('upgradeModal');
    if (modal.style.display !== 'none' && !modal.querySelector('.upgrade-modal-content').contains(e.target)) {
        modal.style.display = 'none';
    }
});

// Variáveis globais para configurações (serão atualizadas dinamicamente)
let GAME_CONFIG = loadGameConfig();
let TOWER_TYPES = loadTowerConfig();

// Função para aplicar os efeitos da árvore de habilidades ao GAME_CONFIG
function applySkillTreeEffects(gameConfig, skillTree) {
    // Vida/Suporte
    gameConfig.initialHealth += (skillTree['vida'] || 0);
    gameConfig.defenseBonus = (skillTree['defesa'] || 0) * 0.10; // 10% por nível
    gameConfig.passiveHeal = (skillTree['cura'] || 0); // 1 por nível
    // Ataque/Dano
    gameConfig.globalDamageBonus = 1 + (skillTree['dano'] || 0) * 0.05;
    gameConfig.archerDamageBonus = 1 + (skillTree['dano_arq'] || 0) * 0.10;
    gameConfig.archerSpeedBonus = 1 + (skillTree['vel_arq'] || 0) * 0.10;
    gameConfig.cannonDamageBonus = 1 + (skillTree['dano_can'] || 0) * 0.10;
            gameConfig.cannonAreaBonus = 1 + (skillTree['alc_can'] || 0) * 0.15;
    gameConfig.mageDamageBonus = 1 + (skillTree['dano_mag'] || 0) * 0.10;
    gameConfig.mageFreezeBonus = (skillTree['cong_mag'] || 0) * 1.0; // +1s por nível
    gameConfig.teslaDamageBonus = 1 + (skillTree['dano_tes'] || 0) * 0.10;
    gameConfig.teslaChainBonus = (skillTree['enc_tes'] || 0); // +1 inimigo
    // Especial
    gameConfig.arrowRainBonus = (skillTree['chuva'] || 0);
    gameConfig.iceStorm = (skillTree['gelo'] || 0) > 0;
    gameConfig.goldPerWaveBonus = 1 + (skillTree['ouro'] || 0) * 0.10;
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
        towers: [],
        enemies: [],
        projectiles: [],
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
        canvas.width = GAME_CONFIG.canvasWidth;
        canvas.height = GAME_CONFIG.canvasHeight;
        console.log('Canvas redimensionado:', GAME_CONFIG.canvasWidth, 'x', GAME_CONFIG.canvasHeight);
    }
    
    // Atualizar RenderSystem com novas configurações
    renderSystem.GAME_CONFIG = GAME_CONFIG;
    
    // Atualizar configurações das torres existentes
    gameState.towers.forEach(tower => {
        tower.gameConfig = GAME_CONFIG;
        tower.towerTypes = TOWER_TYPES;
        tower.applyBonuses && tower.applyBonuses();
    });
    
    console.log('Configurações recarregadas:', GAME_CONFIG);
    renderTowerOptions();

    // Ao aplicar as configurações do painel, garantir que o valor de freezeDuration da torre mágica seja usado em mageFreezeBonus
    if (TOWER_TYPES.magic && typeof TOWER_TYPES.magic.freezeDuration !== 'undefined') {
        GAME_CONFIG.mageFreezeBonus = TOWER_TYPES.magic.freezeDuration;
    }

    // Ao recarregar as configurações, aplicar os valores da Tempestade de Gelo do painel
    if (typeof GAME_CONFIG.iceStormCooldown !== 'undefined') {
        window.ICE_STORM_COOLDOWN = GAME_CONFIG.iceStormCooldown;
    }
    if (typeof GAME_CONFIG.iceStormDuration !== 'undefined') {
        window.ICE_STORM_BASE_DURATION = GAME_CONFIG.iceStormDuration;
    }
    if (typeof GAME_CONFIG.iceStormDamage !== 'undefined') {
        window.ICE_STORM_EXTRA_DAMAGE = GAME_CONFIG.iceStormDamage;
    }
}

// Função para ajustar o tamanho do canvas responsivamente
function adjustCanvasSize() {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) return;
    
    // Dimensões base do jogo
    const baseWidth = 800;
    const baseHeight = 600;
    
    // Obter dimensões da tela
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    
    // Calcular fator de escala para dispositivos móveis
    let scale = 1;
    
    if (screenWidth <= 480) {
        // Celular - ajustar para caber na tela com margem
        const availableWidth = screenWidth * 0.95;
        const availableHeight = (screenHeight - 200) * 0.8; // Espaço para UI
        scale = Math.min(availableWidth / baseWidth, availableHeight / baseHeight);
    } else if (screenWidth <= 768) {
        // Tablet - escala moderada
        const availableWidth = screenWidth * 0.9;
        const availableHeight = (screenHeight - 150) * 0.85;
        scale = Math.min(availableWidth / baseWidth, availableHeight / baseHeight);
    }
    
    // Aplicar dimensões
    if (scale < 1) {
        canvas.style.width = (baseWidth * scale) + 'px';
        canvas.style.height = (baseHeight * scale) + 'px';
    } else {
        canvas.style.width = baseWidth + 'px';
        canvas.style.height = baseHeight + 'px';
    }
    
    // Manter dimensões internas do canvas
    canvas.width = baseWidth;
    canvas.height = baseHeight;
    
    console.log(`Canvas ajustado: ${canvas.style.width} x ${canvas.style.height} (escala: ${scale.toFixed(2)})`);
}

// Ajustar canvas ao carregar e redimensionar
window.addEventListener('resize', adjustCanvasSize);
window.addEventListener('orientationchange', () => {
    setTimeout(adjustCanvasSize, 100);
});

// Escutar mudanças de configuração
onConfigChanged((newConfig) => {
    console.log('Configuração alterada, recarregando...');
    reloadConfigs();
    uiSystem.showNotification('Configurações aplicadas ao jogo!', 'info');
});

// Carregar caminho dos inimigos
function loadEnemyPath() {
    const savedConfig = localStorage.getItem('arqueiroConfig');
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

// Inicializar sistema de interface do usuário
const uiSystem = new UISystem(gameState);

// Inicializar sistema principal do jogo
const gameSystem = new GameSystem(gameState, GAME_CONFIG, enemyPath, Enemy, chooseEnemyType, calculateEnemyStats, DamageNumber, uiSystem, renderSystem);

// Inicializar botões das habilidades especiais
gameSystem.updateSpecialSkillUI('arrowRain');
gameSystem.updateSpecialSkillUI('iceStorm');
gameSystem.updateSpeedUI();
// Tornar gameSystem acessível globalmente para o menu
window.gameSystem = gameSystem;

// Mostrar informações da torre
function showTowerInfo(tower) {
    if (tower.applyBonuses) tower.applyBonuses();
    gameState.towers.forEach(t => t.isSelected = false);
    tower.isSelected = true;
    document.getElementById('towerInfoTitle').textContent = `${tower.name} - Nível ${tower.level}`;
    document.getElementById('towerLevel').textContent = tower.level;
    document.getElementById('towerDamage').textContent = tower.damage;
    document.getElementById('towerRange').textContent = tower.range;
    const fireRateMs = Math.round(tower.fireRate * (1000 / 60));
    document.getElementById('towerFireRate').textContent = `${fireRateMs}ms`;
    const upgradeCost = tower.getUpgradeCost();
    const sellValue = Math.floor(tower.totalCost * ((localStorage.getItem('arqueiroConfig') ? JSON.parse(localStorage.getItem('arqueiroConfig')).sellPercentage : 50) / 100));
    document.getElementById('upgradeCost').textContent = upgradeCost;
    document.getElementById('sellValue').textContent = sellValue;
    const upgradeBtn = document.getElementById('upgradeTower');
    const sellBtn = document.getElementById('sellTower');
    upgradeBtn.disabled = gameState.gold < upgradeCost;
    sellBtn.disabled = false;
    gameState.selectedTowerForInfo = tower;
    document.getElementById('towerInfoPanel').style.display = 'flex';
}

// Fechar painel de informações da torre
function closeTowerInfo() {
    document.getElementById('towerInfoPanel').style.display = 'none';
    
    // Desselecionar todas as torres
    gameState.towers.forEach(t => t.isSelected = false);
    gameState.selectedTowerForInfo = null;
}

function updateUI() {
    document.getElementById('health').textContent = gameState.health;
    document.getElementById('gold').textContent = gameState.gold;
    document.getElementById('wave').textContent = gameState.wave;
    document.getElementById('score').textContent = gameState.score;
    // Exibir monstros total/eliminados
    document.getElementById('monsters').textContent = `${gameState.monstersThisWave}/${gameState.monstersDefeated}`;
    const minutes = Math.floor(gameState.gameTime / 60);
    const seconds = Math.floor(gameState.gameTime % 60);
    document.getElementById('gameTime').textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    if (gameState.waveInProgress) {
        document.getElementById('nextWaveTimer').textContent = 'Em andamento';
    } else if (gameState.nextWaveTimer > 0) {
        const seconds = Math.ceil(gameState.nextWaveTimer);
        document.getElementById('nextWaveTimer').textContent = `${seconds}s`;
    } else if (gameState.wave > 0) {
        document.getElementById('nextWaveTimer').textContent = 'Pronta';
    } else {
        document.getElementById('nextWaveTimer').textContent = '--';
    }
    const startBtn = document.getElementById('start-wave');
    if (gameState.waveInProgress || gameState.nextWaveTimer <= 0 || gameState.enemies.length > 0) {
        startBtn.disabled = true;
    } else {
        startBtn.disabled = false;
    }
    document.querySelectorAll('.tower-btn').forEach(btn => {
        const cost = parseInt(btn.dataset.cost);
        if (gameState.gold < cost) {
            btn.classList.add('disabled');
        } else {
            btn.classList.remove('disabled');
        }
    });
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
            gameState.selectedTower = key;
            document.querySelectorAll('.footer-tower-bar .tower-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
        });
        towerOptionsDiv.appendChild(btn);
    });
}

// Chamar após carregar as configs e sempre que recarregar
function onReady() {
    renderTowerOptions();
    adjustCanvasSize(); // Ajustar canvas para responsividade
    // ... outros inits se necessário
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onReady);
} else {
    onReady();
}

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
                uiSystem.updateUI, 
                uiSystem.showNotification, 
                TeslaChainProjectile, 
                CannonProjectile
            );
            
            // Adicionar ao gameState (gameSystem.gameState é a mesma referência)
            gameState.towers.push(newTower);
            
            // Deduzir ouro
            gameState.gold -= cost;
            
            // Limpar seleção
            gameState.selectedTower = null;
            
            // Atualizar UI
            uiSystem.updateUI();
            
            // Notificar criação da torre
            uiSystem.showNotification(`Torre ${TOWER_TYPES[towerType].name} construída!`, 'success');
        } else {
            uiSystem.showNotification('Ouro insuficiente!', 'error');
        }
    }
});

document.getElementById('start-wave').addEventListener('click', () => {
    gameSystem.startWave();
});

document.getElementById('pause').addEventListener('click', () => {
    gameSystem.togglePause();
});

document.getElementById('restart').addEventListener('click', () => {
    gameSystem.restart(getInitialGameState, () => gameSystem.initializeFirstWave());
    uiSystem.setGameState(gameSystem.gameState);
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

// --- Habilidade Especial: Chuva de Flechas ---
const ARROW_RAIN_BASE_DAMAGE = 40; // Reduzido de 60 para 40
const ARROW_RAIN_RADIUS = 90; // px
let arrowRainSelecting = false;
let arrowRainPreview = null; // {x, y} ou null

function activateArrowRainMode() {
    if (!gameSystem.useSpecialSkill('arrowRain')) return;
    setArrowRainSelecting(true);
    const btn = document.getElementById('btnArrowRain');
    btn.classList.add('selected');
    document.body.style.cursor = 'crosshair';
    uiSystem.showNotification('Clique no mapa para usar a Chuva de Flechas!', 'info');
}

function handleArrowRainClick(x, y) {
    // Dano em área
    let hits = 0;
    // Aplicar bônus da árvore de habilidades
    const bonus = (GAME_CONFIG.arrowRainBonus || 0);
    const totalDamage = ARROW_RAIN_BASE_DAMAGE * (1 + 0.25 * bonus); // +25% por nível
    [...gameState.enemies].forEach(enemy => {
        const dx = enemy.x - x;
        const dy = enemy.y - y;
        if (Math.sqrt(dx*dx + dy*dy) <= ARROW_RAIN_RADIUS + (enemy.size || 0)) {
            enemy.takeDamage(totalDamage);
            hits++;
        }
    });
    // Efeito visual simples (pode ser melhorado depois)
    showArrowRainEffect(x, y);
    setArrowRainSelecting(false);
    setArrowRainPreview(null);
    document.body.style.cursor = 'default';
    uiSystem.showNotification(`Chuva de Flechas: ${hits} inimigos atingidos!`, 'success');
}

function showArrowRainEffect(x, y) {
    // Desenhar círculos ou flechas caindo (placeholder)
    const ctx = gameState.ctx;
    if (!ctx) return;
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, ARROW_RAIN_RADIUS, 0, 2 * Math.PI);
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
    const btnArrow = document.getElementById('btnArrowRain');
    if (btnArrow) {
        btnArrow.addEventListener('click', () => {
            activateArrowRainMode();
        });
    }
    const btnIce = document.getElementById('btnIceStorm');
    if (btnIce) {
        btnIce.addEventListener('click', () => {
            activateIceStorm();
        });
    }
    
    // Configurar botão de velocidade
    const speedBtn = document.getElementById('speedButton');
    if (speedBtn) {
        speedBtn.addEventListener('click', () => {
            if (gameSystem) {
                gameSystem.toggleGameSpeed();
            }
        });
    }
});

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
        ctx.arc(arrowRainPreview.x, arrowRainPreview.y, ARROW_RAIN_RADIUS, 0, 2 * Math.PI);
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
// gameSystem.startGameLoop();

window.arrowRainSelecting = arrowRainSelecting;
window.arrowRainPreview = arrowRainPreview;
window.ARROW_RAIN_RADIUS = ARROW_RAIN_RADIUS;

// Remover o antigo window.renderGame, pois a renderização do preview agora está no GameSystem
// (Se existir, pode remover ou deixar vazio)
window.renderGame = undefined;

// Sempre que alterar arrowRainSelecting ou arrowRainPreview, sincronizar com window
function setArrowRainSelecting(val) {
    arrowRainSelecting = val;
    window.arrowRainSelecting = val;
}
function setArrowRainPreview(val) {
    arrowRainPreview = val;
    window.arrowRainPreview = val;
}

// Função utilitária para mostrar/esconder tooltip
function showInfoTooltip(html, x, y) {
    const tooltip = document.getElementById('infoTooltip');
    tooltip.innerHTML = html;
    tooltip.style.display = 'block';
    // Ajustar posição para não sair da tela
    const pad = 12;
    let left = x + pad;
    let top = y + pad;
    if (left + tooltip.offsetWidth > window.innerWidth) left = x - tooltip.offsetWidth - pad;
    if (top + tooltip.offsetHeight > window.innerHeight) top = y - tooltip.offsetHeight - pad;
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
    // Procurar torre sob o mouse
    const tower = renderSystem.getTowerAtPosition(mouseX, mouseY, gameState);
    if (tower) {
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
canvas.addEventListener('mouseleave', hideInfoTooltip);

// --- Tempestade de Gelo ---
const ICE_STORM_BASE_DURATION = 3; // segundos
function getIceStormDuration() {
    // Duração base + bônus da árvore (cong_mag)
    return ICE_STORM_BASE_DURATION + (GAME_CONFIG.mageFreezeBonus || 0);
}

function activateIceStorm() {
    if (!gameSystem.useSpecialSkill('iceStorm')) return;
    // Congelar todos os inimigos
    const duration = getIceStormDuration();
    const enemiesAffected = gameState.enemies.length;
    gameState.enemies.forEach(enemy => {
        enemy.slowUntil = Date.now() + duration * 1000;
        enemy.originalSpeed = enemy.originalSpeed || enemy.speed;
        enemy.speed = 0.01; // praticamente parado
        enemy.isFrozen = true;
    });
    
    uiSystem.showNotification(`Tempestade de Gelo: ${enemiesAffected} inimigos congelados por ${duration.toFixed(1)}s!`, 'success');
    
    // Feedback visual: todos os inimigos ficam azulados
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
    console.log('[DEBUG] skillTree após upgrade:', skillTree);
    updateSkillTreeAndConfig();
    
    // Atualizar botões das habilidades especiais
    if (gameSystem) {
        gameSystem.updateSpecialSkillUI('arrowRain');
        gameSystem.updateSpecialSkillUI('iceStorm');
    }
    
    // Recarregar GAME_CONFIG e skillTree do localStorage antes de atualizar o menu de torres
    const updatedSkillTree = loadSkillTree();
    applySkillTreeEffects(GAME_CONFIG, updatedSkillTree);
    console.log('[DEBUG] GAME_CONFIG.specialTowerUnlocked:', GAME_CONFIG.specialTowerUnlocked);
    renderTowerOptions(); // Atualiza o menu de torres ao desbloquear habilidades
    console.log('[DEBUG] renderTowerOptions chamado após upgrade');
}

document.addEventListener('skillTreeChanged', () => {
    if (gameSystem) {
        gameSystem.updateSpecialSkillUI('arrowRain');
        gameSystem.updateSpecialSkillUI('iceStorm');
    }
});

// Função para verificar elementos
window.checkElements = function() {
    console.log('Verificando elementos...');
    console.log('btnArrowRain:', document.getElementById('btnArrowRain'));
    console.log('btnIceStorm:', document.getElementById('btnIceStorm'));
    console.log('arrowRainCooldown:', document.getElementById('arrowRainCooldown'));
    console.log('iceStormCooldown:', document.getElementById('iceStormCooldown'));
};

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
    const key = 'maiorOndaAtingida';
    const atual = parseInt(localStorage.getItem(key) || '1');
    if (onda > atual) localStorage.setItem(key, onda);
}

// Controlar visibilidade do botão Continuar no menu inicial
function adicionarBotaoContinuarMenu() {
    const key = 'maiorOndaAtingida';
    const maiorOnda = parseInt(localStorage.getItem(key) || '1');
    const btn = document.getElementById('btnContinue');
    
    if (btn) {
        // Atualizar texto do botão com a onda
        if (maiorOnda > 1) {
            btn.innerHTML = `Continuar<br><span class="onda-info">(Onda ${maiorOnda})</span>`;
            btn.style.display = 'flex';
        } else {
            btn.style.display = 'none';
        }
    }
}

document.addEventListener('DOMContentLoaded', adicionarBotaoContinuarMenu);

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
    const key = 'maiorOndaAtingida';
    const maiorOnda = parseInt(localStorage.getItem(key) || '1');
    
    if (maiorOnda <= 1) return;
    
    console.log('[DEBUG] Iniciando modo continuar do nível:', maiorOnda);
    
    // Calcular ouro acumulado
    const enemiesPerWave = GAME_CONFIG.enemiesPerWave || 5;
    const enemyReward = GAME_CONFIG.enemyReward || 10;
    const enemiesIncrease = GAME_CONFIG.enemiesIncrease || 2;
    const ouro = calcularOuroAteOnda(maiorOnda, enemiesPerWave, enemyReward);
    
    console.log('[DEBUG] Ouro calculado:', ouro);
    
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
            towers: [],
            enemies: [],
            projectiles: [],
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
        
        console.log('[DEBUG] Novo gameState criado:', newGameState);
        return newGameState;
    }
    
    gameSystem.restart(getInitialGameStateContinuar, () => {
        // Usar uma versão customizada que não reseta o wave
        const savedConfig = localStorage.getItem('arqueiroConfig');
        const waveDelaySeconds = savedConfig ? JSON.parse(savedConfig).waveDelaySeconds || 5 : 5;
        gameSystem.gameState.nextWaveTimer = waveDelaySeconds;
        gameSystem.gameState.waveInProgress = false;
        gameSystem.gameState.allEnemiesSpawned = false;
        
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
        
        console.log('[DEBUG] Modo continuar inicializado. gameState:', gameState);
        console.log('[DEBUG] Torres disponíveis:', TOWER_TYPES);
    });
    
    // Esconder menu se estiver visível
    const menu = document.getElementById('mainMenu');
    if (menu) menu.style.display = 'none';
    
    // Notificar o jogador
    uiSystem.showNotification(`Continuando do nível ${maiorOnda} com ${ouro} ouro!`, 'info');
}

// Expor função para o escopo global
window.iniciarModoContinuar = iniciarModoContinuar;
window.adicionarBotaoContinuarMenu = adicionarBotaoContinuarMenu;

// Função de debug para modal de game over
window.debugGameOver = function() {
    console.log('=== Debug Modal Game Over ===');
    
    if (window.gameSystem) {
        const gs = window.gameSystem.gameState;
        console.log(`Estado atual:`);
        console.log(`- Onda: ${gs.wave}`);
        console.log(`- Pontuação: ${gs.score}`);
        console.log(`- Tempo de jogo: ${gs.gameTime.toFixed(2)}s`);
        console.log(`- Game over: ${gs.isGameOver}`);
        console.log(`- Inimigos ativos: ${gs.enemies.length}`);
        console.log(`- Torres: ${gs.towers.length}`);
        
        return {
            forceGameOver: () => {
                console.log('Forçando game over para teste...');
                gameSystem.gameOver();
            },
            addTestScore: (points) => {
                gs.score += points;
                console.log(`Adicionados ${points} pontos. Nova pontuação: ${gs.score}`);
            },
            simulateWaveComplete: () => {
                console.log('Simulando completar onda...');
                gs.score += 100;
                gs.wave++;
                console.log(`Nova onda: ${gs.wave}, pontuação: ${gs.score}`);
            },
            clearModal: () => {
                const gameOverContent = document.querySelector('.game-over-content');
                if (gameOverContent) {
                    const dynamicElements = gameOverContent.querySelectorAll('div.reward-message, div.motivational-message');
                    dynamicElements.forEach(el => el.remove());
                    console.log(`Removidos ${dynamicElements.length} elementos dinâmicos`);
                }
            },
            testMultiple: () => {
                console.log('Testando múltiplas execuções...');
                for (let i = 0; i < 3; i++) {
                    setTimeout(() => {
                        console.log(`Execução ${i + 1}`);
                        gameSystem.gameOver();
                    }, i * 100);
                }
            }
        };
    } else {
        console.error('gameSystem não encontrado');
        return null;
    }
};

// Função de debug para sistema de velocidade
window.debugSpeedSystem = function() {
    console.log('=== Sistema de Velocidade - Debug ===');
    
    if (window.gameSystem) {
        const gs = window.gameSystem;
        console.log(`Velocidade atual: ${gs.gameSpeed}x`);
        console.log(`Velocidades disponíveis: ${gs.availableSpeeds.join(', ')}`);
        console.log(`Índice atual: ${gs.currentSpeedIndex}`);
        
        // Informações das habilidades especiais
        console.log(`--- Habilidades Especiais ---`);
        Object.entries(gs.specialSkills).forEach(([name, skill]) => {
            const remainingTime = skill.ready ? 0 : skill.cooldownTime - (gs.gameState.gameTime - skill.lastUsed);
            console.log(`${name}: ${skill.ready ? 'Pronto' : `${remainingTime.toFixed(1)}s restantes`}`);
        });
        
        return {
            speed: gs.gameSpeed,
            setSpeed: function(speed) {
                console.log(`Alterando velocidade para ${speed}x`);
                gs.setGameSpeed(speed);
            },
            testSkill: function(skillName) {
                console.log(`Testando habilidade: ${skillName}`);
                const success = gs.useSpecialSkill(skillName);
                console.log(`Resultado: ${success ? 'Sucesso' : 'Falhou (cooldown ou não desbloqueado)'}`);
                return success;
            },
            testSpeedCooldown: function() {
                console.log('🔍 Teste de cooldown com velocidade:');
                console.log('1. Use uma habilidade especial');
                console.log('2. Altere a velocidade para 8x');
                console.log('3. Observe o cooldown diminuir mais rápido');
                console.log('4. Volte para 1x e compare');
            }
        };
    } else {
        console.error('gameSystem não encontrado');
        return null;
    }
};

// Função de debug para monitorar deltaTime e movimento
window.debugMovementSystem = function() {
    console.log('=== Sistema de Movimento e Spawn - Debug ===');
    
    if (window.gameSystem) {
        const gs = window.gameSystem.gameState;
        console.log(`Inimigos ativos: ${gs.enemies.length}`);
        
        // Informações de spawn
        console.log(`--- Sistema de Spawn ---`);
        console.log(`Onda em progresso: ${gs.waveInProgress}`);
        console.log(`Inimigos spawnados: ${gs.enemiesSpawned}/${gs.monstersThisWave}`);
        console.log(`Todos spawnados: ${gs.allEnemiesSpawned}`);
        console.log(`Intervalo de spawn: ${gs.spawnInterval}s`);
        console.log(`Último spawn: ${gs.lastSpawnTime.toFixed(2)}s`);
        console.log(`Tempo atual: ${gs.gameTime.toFixed(2)}s`);
        console.log(`Próximo spawn em: ${Math.max(0, gs.spawnInterval - (gs.gameTime - gs.lastSpawnTime)).toFixed(2)}s`);
        
        if (gs.enemies.length > 0) {
            const enemy = gs.enemies[0];
            console.log(`--- Movimento ---`);
            console.log(`Exemplo - Posição: (${enemy.x.toFixed(2)}, ${enemy.y.toFixed(2)})`);
            console.log(`PathIndex: ${enemy.pathIndex}/${enemy.enemyPath.length - 1}`);
            console.log(`Velocidade: ${enemy.speed}`);
            console.log(`Estado de slow: ${enemy.slowUntil ? 'Ativo até ' + new Date(enemy.slowUntil) : 'Inativo'}`);
        }
        
        console.log(`--- Estado do Jogo ---`);
        console.log(`Jogo pausado: ${gs.isPaused}`);
        console.log(`Auto-pausado: ${window.gameSystem.wasAutoPaused}`);
        console.log(`Página visível: ${!document.hidden}`);
    }
    
    return {
        monitor: () => {
            // Monitorar deltaTime por 10 segundos
            let samples = [];
            let count = 0;
            const maxSamples = 600; // ~10 segundos a 60fps
            
            const originalGameLoop = window.gameSystem.gameLoop.bind(window.gameSystem);
            window.gameSystem.gameLoop = function(currentTime) {
                const deltaTime = currentTime - this.lastTime;
                
                if (count < maxSamples) {
                    samples.push(deltaTime);
                    count++;
                    
                    if (deltaTime > 50) {
                        console.warn(`[DELTA] DeltaTime alto: ${deltaTime.toFixed(2)}ms`);
                    }
                    
                    if (count === maxSamples) {
                        const avg = samples.reduce((a, b) => a + b) / samples.length;
                        const max = Math.max(...samples);
                        const min = Math.min(...samples);
                        console.log(`\n=== Relatório DeltaTime ===`);
                        console.log(`Média: ${avg.toFixed(2)}ms`);
                        console.log(`Máximo: ${max.toFixed(2)}ms`);
                        console.log(`Mínimo: ${min.toFixed(2)}ms`);
                        console.log(`Amostras > 50ms: ${samples.filter(s => s > 50).length}`);
                        console.log(`Amostras > 100ms: ${samples.filter(s => s > 100).length}`);
                        
                        // Restaurar gameLoop original
                        window.gameSystem.gameLoop = originalGameLoop;
                    }
                }
                
                return originalGameLoop(currentTime);
            };
            
            console.log('Monitoramento iniciado por 10 segundos...');
        },
        
        testMinimize: () => {
            console.log('Simulando minimização/reativação...');
            document.dispatchEvent(new Event('visibilitychange'));
        },
        
        testSpawnPause: () => {
            console.log('\n=== Teste de Spawn com Pausa ===');
            
            if (!window.gameSystem || !window.gameSystem.gameState.waveInProgress) {
                console.log('❌ Nenhuma onda em progresso. Inicie uma onda primeiro.');
                return;
            }
            
            const gs = window.gameSystem.gameState;
            console.log(`Estado inicial:`);
            console.log(`- Pausado: ${gs.isPaused}`);
            console.log(`- Inimigos: ${gs.enemiesSpawned}/${gs.monstersThisWave}`);
            console.log(`- Tempo: ${gs.gameTime.toFixed(2)}s`);
            
            console.log('\n1. Pausando jogo por 3 segundos...');
            window.gameSystem.togglePause();
            
            setTimeout(() => {
                console.log(`Estado após pausa:`);
                console.log(`- Pausado: ${gs.isPaused}`);
                console.log(`- Inimigos: ${gs.enemiesSpawned}/${gs.monstersThisWave} (deve ser igual)`);
                console.log(`- Tempo: ${gs.gameTime.toFixed(2)}s (deve ser igual)`);
                
                console.log('\n2. Despausando jogo...');
                window.gameSystem.togglePause();
                
                setTimeout(() => {
                    console.log(`Estado após despausar:`);
                    console.log(`- Pausado: ${gs.isPaused}`);
                    console.log(`- Inimigos: ${gs.enemiesSpawned}/${gs.monstersThisWave} (pode ter aumentado)`);
                    console.log(`- Tempo: ${gs.gameTime.toFixed(2)}s (deve ter aumentado)`);
                    console.log('\n✅ Teste concluído! Verifique se o spawn pausou/despausou corretamente.');
                }, 2000);
            }, 3000);
        }
    };
};

// Função de debug para testar sistema de recompensas
window.debugRewardSystem = function() {
    const points = parseInt(localStorage.getItem('arqueiroUpgradePoints') || '0');
    const lastWave = parseInt(localStorage.getItem('arqueiroLastRewardedWave') || '0');
    
    console.log('=== Sistema de Recompensas - Status ===');
    console.log('Pontos atuais:', points);
    console.log('Última onda recompensada:', lastWave);
    console.log('');
    console.log('Para testar:');
    console.log('- debugRewardSystem.simulate(55) // Simular morte na onda 55');
    console.log('- debugRewardSystem.reset() // Resetar sistema');
    console.log('- debugRewardSystem.setLastWave(30) // Definir última onda');
    
    return {
        simulate: (wave) => {
            console.log(`\n--- Simulando morte na onda ${wave} ---`);
            const lastRewardedWave = parseInt(localStorage.getItem('arqueiroLastRewardedWave') || '0');
            const newProgress = Math.max(0, wave - lastRewardedWave);
            let points = 0;
            
            if (newProgress >= 10) {
                points = Math.floor(newProgress / 10);
            } else if (newProgress >= 5) {
                points = 1;
            }
            
            // Marcos especiais
            if (wave >= 25 && lastRewardedWave < 25) points += 1;
            if (wave >= 50 && lastRewardedWave < 50) points += 2;
            if (wave >= 100 && lastRewardedWave < 100) points += 3;
            
            console.log(`Progresso: ${lastRewardedWave} → ${wave} (${newProgress} novas)`);
            console.log(`Pontos que ganharia: ${points}`);
            console.log(`Marcos: 25=${wave >= 25 && lastRewardedWave < 25}, 50=${wave >= 50 && lastRewardedWave < 50}, 100=${wave >= 100 && lastRewardedWave < 100}`);
        },
        reset: () => {
            localStorage.setItem('arqueiroUpgradePoints', '0');
            localStorage.setItem('arqueiroLastRewardedWave', '0');
            console.log('Sistema resetado!');
        },
        setLastWave: (wave) => {
            localStorage.setItem('arqueiroLastRewardedWave', wave);
            console.log(`Última onda definida para: ${wave}`);
        }
    };
};

// Integrar ao fluxo de game over
// (Chame adicionarBotaoContinuarGameOver() ao exibir a tela de derrota)
const originalGameOver = gameSystem.gameOver.bind(gameSystem);
gameSystem.gameOver = function(victory = false) {
    // Evitar múltiplas execuções
    if (this.gameState.isGameOver) return;
    
    originalGameOver(victory);
    
    // Só executar uma vez após game over
    setTimeout(() => {
        if (!victory) {
            salvarMaiorOnda(this.gameState.wave);
            adicionarBotaoContinuarGameOver();
        }
        adicionarBotaoContinuarMenu();
    }, 500);
}; 