// Configuração de Monstros com Sprites
const DEFAULT_SPRITE_CONFIG = {
    size: { width: 32, height: 32 },
    animationFrames: 1,
    frameWidth: 32,
    frameHeight: 32,
    animationSpeed: 200
};

export const MONSTER_SPRITE_CONFIG = {
    'normal': {
        name: 'Monstro Normal',
        sprites: {
            'down': 'assets/monstros/Normal/goblin_brutao_baixo.png',
            'right': 'assets/monstros/Normal/goblin_brutao_direita.png',
            'left': 'assets/monstros/Normal/goblin_brutao_esquerda.png',
            'up': 'assets/monstros/Normal/goblin_brutao_subindo.png'
        },
        ...DEFAULT_SPRITE_CONFIG,
        enemyTypes: ['normal', 'fast', 'tank', 'elite']
    },
    'fast': {
        name: 'Gárgula Flamejante',
        sprites: {
            'down': 'assets/monstros/Rapido/Gárgula_Flamejante_decendo.png',
            'right': 'assets/monstros/Rapido/Gárgula_Flamejante_direita.png',
            'left': 'assets/monstros/Rapido/Gárgula_Flamejante_esqueda.png',
            'up': 'assets/monstros/Rapido/Gárgula_Flamejante_subindo.png'
        },
        ...DEFAULT_SPRITE_CONFIG,
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
        ...DEFAULT_SPRITE_CONFIG,
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
        ...DEFAULT_SPRITE_CONFIG,
        enemyTypes: ['elite']
    }
};

// Mapeamento de tipos de inimigos para sprites
export const ENEMY_TYPE_TO_SPRITE = {
    'normal': 'normal',
    'fast': 'fast',
    'tank': 'tank',
    'elite': 'elite'
}; 