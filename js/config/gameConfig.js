// Configurações gerais do jogo
export const DEFAULT_GAME_CONFIG = {
    // Configurações básicas
    initialHealth: 20,
    initialGold: 75,
    gridSize: 40,
    waveDelay: 3000,
    upgradeBaseCost: 75,
    upgradePercentage: 50, // Porcentagem do valor da torre para upgrade
    sellPercentage: 50,
    pointsPerKill: 8,           // Reduzido de 10 para 8 (compensar multiplicadores)
    waveBonusMultiplier: 40,    // Reduzido de 50 para 40 (temos bônus exponencial)
    upgradeBonusMultiplier: 20, // Reduzido de 25 para 20 (mais equilibrado)
    waveDelaySeconds: 5,
    towerMaxLevel: 5,           // Nível máximo padrão para todas as torres
    
    // Configurações de ondas
    goldMultiplier: 1,
    enemyHealthMultiplier: 1.25,
    enemySpeedMultiplier: 1.15,
    enemySpawnRate: 1000,
    
    // Configurações visuais
    canvasWidth: 800,
    canvasHeight: 600,
    projectileSpeed: 5,
    projectileSize: 4,
    damageNumberLifetime: 60,
    damageNumberSpeed: 1,
    
    // Caminho padrão dos inimigos
    enemyPath: [
        {x: 0, y: 3}, {x: 1, y: 3}, {x: 2, y: 3}, {x: 3, y: 3}, {x: 4, y: 3},
        {x: 5, y: 3}, {x: 6, y: 3}, {x: 7, y: 3}, {x: 8, y: 3}, {x: 9, y: 3},
        {x: 10, y: 3}, {x: 11, y: 3}, {x: 12, y: 3}, {x: 13, y: 3}, {x: 14, y: 3},
        {x: 15, y: 3}, {x: 16, y: 3}, {x: 17, y: 3}, {x: 18, y: 3}, {x: 19, y: 3}
    ]
};

// Sistema de eventos para notificar mudanças
const configEventTarget = new EventTarget();

// Evento personalizado para mudanças de configuração
export const CONFIG_CHANGED_EVENT = 'configChanged';

// Função para disparar evento de mudança
export function notifyConfigChanged() {
    configEventTarget.dispatchEvent(new CustomEvent(CONFIG_CHANGED_EVENT, {
        detail: { config: loadGameConfig() }
    }));
}

// Função para escutar mudanças de configuração
export function onConfigChanged(callback) {
    configEventTarget.addEventListener(CONFIG_CHANGED_EVENT, (event) => {
        callback(event.detail.config);
    });
}

// Carregar configurações salvas
export function loadGameConfig() {
    const savedConfig = localStorage.getItem('arqueiroConfig');
    if (savedConfig) {
        try {
            const config = JSON.parse(savedConfig);
            return { ...DEFAULT_GAME_CONFIG, ...config };
        } catch (e) {
            // Erro ao carregar configurações
        }
    }
    return DEFAULT_GAME_CONFIG;
}

// Salvar configurações
export function saveGameConfig(config) {
    try {
        localStorage.setItem('arqueiroConfig', JSON.stringify(config));
        // Notificar sobre a mudança
        notifyConfigChanged();
        return true;
    } catch (e) {
        // Erro ao salvar configurações
        return false;
    }
}

// Resetar configurações para padrão
export function resetGameConfig() {
    localStorage.removeItem('arqueiroConfig');
    return DEFAULT_GAME_CONFIG;
}

// Exportar configuração atual
export function exportGameConfig() {
    const config = loadGameConfig();
    const dataStr = JSON.stringify(config, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = 'arqueiro-config.json';
    link.click();
}

// Importar configuração
export function importGameConfig(jsonData) {
    try {
        const config = JSON.parse(jsonData);
        if (saveGameConfig(config)) {
            return { success: true, config };
        }
        return { success: false, error: 'Erro ao salvar configuração' };
    } catch (e) {
        return { success: false, error: 'Formato de arquivo inválido' };
    }
} 