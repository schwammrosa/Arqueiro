// Configuração de Monstros com Sprites
export const MONSTER_SPRITE_CONFIG = {
    'normal': {
        name: 'Monstro Normal',
        sprites: {
            'down': 'assets/monstros/Normal/goblin_brutao_baixo.png',
            'right': 'assets/monstros/Normal/goblin_brutao_direita.png',
            'left': 'assets/monstros/Normal/goblin_brutao_esquerda.png',
            'up': 'assets/monstros/Normal/goblin_brutao_subindo.png'
        },
        size: { width: 32, height: 32 },
        animationFrames: 1, // Corrigido: 1 frame por imagem (não são sprite sheets)
        frameWidth: 32,
        frameHeight: 32,
        animationSpeed: 200, // ms por frame
        enemyTypes: ['normal', 'fast', 'tank', 'elite'] // Tipos de inimigos que usam este sprite
    },
    'fast': {
        name: 'Gárgula Flamejante',
        sprites: {
            'down': 'assets/monstros/Rapido/Gárgula_Flamejante_decendo.png',
            'right': 'assets/monstros/Rapido/Gárgula_Flamejante_direita.png',
            'left': 'assets/monstros/Rapido/Gárgula_Flamejante_esqueda.png',
            'up': 'assets/monstros/Rapido/Gárgula_Flamejante_subindo.png'
        },
        size: { width: 32, height: 32 },
        animationFrames: 1, // 1 frame por imagem
        frameWidth: 32,
        frameHeight: 32,
        animationSpeed: 200,
        enemyTypes: ['fast']
    },
    'tank': {
        name: 'Cavaleiro Esquelético',
        sprites: {
            'down': 'assets/monstros/Tanque/cavaleiro_esqueletico_baixo.png',
            'right': 'assets/monstros/Tanque/cavaleiro_esqueletico_direita.png',
            'left': 'assets/monstros/Tanque/cavaleiro_esqueletico_esquerda.png',
            'up': 'assets/monstros/Tanque/cavaleiro_esqueletico_subindo.png'
        },
        size: { width: 32, height: 32 },
        animationFrames: 1,
        frameWidth: 32,
        frameHeight: 32,
        animationSpeed: 200,
        enemyTypes: ['tank']
    },
    'elite': {
        name: 'Troll Cornudo',
        sprites: {
            'down': 'assets/monstros/Elite/troll_cornudo_baixo.png',
            'right': 'assets/monstros/Elite/troll_cornudo_dieira.png',
            'left': 'assets/monstros/Elite/troll_cornudo_esquerda.png',
            'up': 'assets/monstros/Elite/troll_cornudo_subindo.png'
        },
        size: { width: 32, height: 32 },
        animationFrames: 1,
        frameWidth: 32,
        frameHeight: 32,
        animationSpeed: 200,
        enemyTypes: ['elite']
    },
    // Adicionar novos monstros aqui:
    // 'orc_guerreiro': {
    //     name: 'Orc Guerreiro',
    //     sprites: {
    //         'down': 'assets/monstros/orc_guerreiro_baixo.png',
    //         'right': 'assets/monstros/orc_guerreiro_direita.png',
    //         'left': 'assets/monstros/orc_guerreiro_esquerda.png',
    //         'up': 'assets/monstros/orc_guerreiro_subindo.png'
    //     },
    //     size: { width: 40, height: 40 },
    //     animationFrames: 4,
    //     frameWidth: 40,
    //     frameHeight: 40,
    //     animationSpeed: 180,
    //     enemyTypes: ['tank', 'elite']
    // }
};

// Mapeamento de tipos de inimigos para sprites
export const ENEMY_TYPE_TO_SPRITE = {
    'normal': 'normal',
    'fast': 'fast',
    'tank': 'tank',
    'elite': 'elite'
};

// Função para obter configuração de sprite por tipo de inimigo
export function getSpriteConfigForEnemyType(enemyType) {
    const spriteType = ENEMY_TYPE_TO_SPRITE[enemyType];
    return spriteType ? MONSTER_SPRITE_CONFIG[spriteType] : null;
}

// Função para obter lista de todos os tipos de sprites disponíveis
export function getAvailableSpriteTypes() {
    return Object.keys(MONSTER_SPRITE_CONFIG);
}

// Função para verificar se um tipo de inimigo tem sprite
export function hasSpriteForEnemyType(enemyType) {
    return ENEMY_TYPE_TO_SPRITE.hasOwnProperty(enemyType);
} 