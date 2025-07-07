// Configurações gerais do jogo
export const DEFAULT_GAME_CONFIG = {
    // Configurações básicas
    initialHealth: 20,
    initialGold: 75,
    gridSize: 40,
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

// Constantes do sistema
const STORAGE_KEY = 'arqueiroConfig';
const CONFIG_CHANGED_EVENT = 'configChanged';

// Sistema de eventos para notificar mudanças
const configEventTarget = new EventTarget();

// Evento personalizado para mudanças de configuração
export { CONFIG_CHANGED_EVENT };

/**
 * Dispara evento de mudança de configuração
 */
export function notifyConfigChanged() {
    configEventTarget.dispatchEvent(new CustomEvent(CONFIG_CHANGED_EVENT, {
        detail: { config: loadGameConfig() }
    }));
}

/**
 * Escuta mudanças de configuração
 * @param {Function} callback - Função chamada quando a configuração muda
 */
export function onConfigChanged(callback) {
    configEventTarget.addEventListener(CONFIG_CHANGED_EVENT, (event) => {
        callback(event.detail.config);
    });
}

/**
 * Carrega configurações salvas do localStorage
 * @returns {Object} Configuração carregada ou padrão
 */
export function loadGameConfig() {
    const savedConfig = localStorage.getItem(STORAGE_KEY);
    if (savedConfig) {
        try {
            const config = JSON.parse(savedConfig);
            return { ...DEFAULT_GAME_CONFIG, ...config };
        } catch (error) {
            console.warn('Erro ao carregar configurações salvas:', error);
        }
    }
    return DEFAULT_GAME_CONFIG;
}

/**
 * Salva configurações no localStorage
 * @param {Object} config - Configuração a ser salva
 * @returns {boolean} True se salvou com sucesso
 */
export function saveGameConfig(config) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
        notifyConfigChanged();
        return true;
    } catch (error) {
        console.error('Erro ao salvar configurações:', error);
        return false;
    }
}

/**
 * Reseta configurações para os valores padrão
 * @returns {Object} Configuração padrão
 */
export function resetGameConfig() {
    localStorage.removeItem(STORAGE_KEY);
    return DEFAULT_GAME_CONFIG;
}

/**
 * Exporta configuração atual para arquivo JSON
 */
export function exportGameConfig() {
    const config = loadGameConfig();
    const dataStr = JSON.stringify(config, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    const url = URL.createObjectURL(dataBlob);
    
    link.href = url;
    link.download = 'arqueiro-config.json';
    link.click();
    
    // Limpar URL criada para evitar vazamento de memória
    setTimeout(() => URL.revokeObjectURL(url), 100);
}

/**
 * Importa configuração de arquivo JSON
 * @param {string} jsonData - Dados JSON da configuração
 * @returns {Object} Resultado da importação {success: boolean, config?: Object, error?: string}
 */
export function importGameConfig(jsonData) {
    try {
        const config = JSON.parse(jsonData);
        
        // Validação básica da estrutura
        if (typeof config !== 'object' || config === null) {
            return { success: false, error: 'Formato de configuração inválido' };
        }
        
        if (saveGameConfig(config)) {
            return { success: true, config };
        }
        return { success: false, error: 'Erro ao salvar configuração importada' };
    } catch (error) {
        console.error('Erro ao importar configuração:', error);
        return { success: false, error: 'Formato de arquivo inválido' };
    }
} 