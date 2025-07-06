// Exemplo: Como Adicionar um Novo Monstro ao Sistema
// Este arquivo demonstra o processo completo de adicionar um novo tipo de monstro

// 1. PRIMEIRO: Preparar os sprites
// Criar os seguintes arquivos em assets/monstros/:
// - orc_guerreiro_baixo.png
// - orc_guerreiro_direita.png  
// - orc_guerreiro_esquerda.png
// - orc_guerreiro_subindo.png

// 2. SEGUNDO: Atualizar a configuração em js/config/monsterConfig.js

export const NOVO_MONSTER_CONFIG = {
    'orc_guerreiro': {
        name: 'Orc Guerreiro',
        sprites: {
            'down': 'assets/monstros/orc_guerreiro_baixo.png',
            'right': 'assets/monstros/orc_guerreiro_direita.png',
            'left': 'assets/monstros/orc_guerreiro_esquerda.png',
            'up': 'assets/monstros/orc_guerreiro_subindo.png'
        },
        size: { width: 40, height: 40 }, // Orc é maior que goblin
        animationFrames: 4,
        frameWidth: 40,
        frameHeight: 40,
        animationSpeed: 180, // Animação mais rápida
        enemyTypes: ['tank', 'elite'] // Apenas tanques e elites usam este sprite
    }
};

// 3. TERCEIRO: Atualizar o mapeamento de tipos de inimigos

export const NOVO_ENEMY_MAPPING = {
    'normal': 'normal',           // Inimigos normais usam monstro normal
    'fast': 'normal',             // Inimigos rápidos usam monstro normal
    'tank': 'orc_guerreiro',      // Tanques agora usam orc
    'elite': 'orc_guerreiro'      // Elites agora usam orc
};

// 4. QUARTO: Atualizar as estatísticas dos inimigos (opcional)
// Em js/config/enemyConfig.js, você pode ajustar as estatísticas:

export const NOVO_ENEMY_STATS = {
    tank: {
        baseHealth: 150,      // Orc tem mais vida
        baseSpeed: 0.8,       // Orc é mais lento
        baseReward: 25,       // Orc dá mais recompensa
        color: '#8B4513',     // Cor marrom para orc
        size: 20,             // Tamanho maior
        scoreMultiplier: 1.5  // Mais pontos
    },
    elite: {
        baseHealth: 300,      // Elite orc tem muita vida
        baseSpeed: 0.6,       // Elite orc é mais lento
        baseReward: 50,       // Elite orc dá muita recompensa
        color: '#654321',     // Cor marrom escuro
        size: 25,             // Tamanho grande
        scoreMultiplier: 2.0  // Muitos pontos
    }
};

// 5. QUINTO: Implementação completa no monsterConfig.js

/*
// Adicionar ao MONSTER_SPRITE_CONFIG:
'orc_guerreiro': {
    name: 'Orc Guerreiro',
    sprites: {
        'down': 'assets/monstros/orc_guerreiro_baixo.png',
        'right': 'assets/monstros/orc_guerreiro_direita.png',
        'left': 'assets/monstros/orc_guerreiro_esquerda.png',
        'up': 'assets/monstros/orc_guerreiro_subindo.png'
    },
    size: { width: 40, height: 40 },
    animationFrames: 4,
    frameWidth: 40,
    frameHeight: 40,
    animationSpeed: 180,
    enemyTypes: ['tank', 'elite']
}

// Atualizar ENEMY_TYPE_TO_SPRITE:
export const ENEMY_TYPE_TO_SPRITE = {
    'normal': 'normal',
    'fast': 'normal',
    'tank': 'orc_guerreiro',    // Mudança aqui
    'elite': 'orc_guerreiro'    // Mudança aqui
};
*/

// 6. SEXTO: Testar o novo monstro

export function testNewMonster() {
    // Verificar se o sprite foi carregado
    if (monsterSpriteManager.isMonsterLoaded('normal')) {
        console.log('✅ Monstro Normal carregado com sucesso!');
        
        // Verificar configuração
        const config = monsterSpriteManager.monsterConfigs['normal'];
        console.log('📏 Tamanho:', config.size);
        console.log('⚡ Velocidade de animação:', config.animationSpeed);
        console.log('🎯 Tipos de inimigos:', config.enemyTypes);
    } else {
        console.log('❌ Erro: Monstro Normal não foi carregado');
    }
}

// 7. SÉTIMO: Criar monstro de teste

export function createTestOrc(gameState, GAME_CONFIG, enemyPath, chooseEnemyType, calculateEnemyStats, DamageNumber, showNotification, monsterSpriteManager) {
    // Criar um tanque (que agora usa sprite de orc)
    const orcTank = new Enemy(
        'tank', 
        gameState, 
        GAME_CONFIG, 
        enemyPath, 
        chooseEnemyType, 
        calculateEnemyStats, 
        DamageNumber, 
        showNotification,
        monsterSpriteManager
    );
    
    console.log('🛡️ Tanque Orc criado com sprite:', orcTank.spriteType);
    return orcTank;
}

// 8. OITAVO: Verificar performance

export function checkPerformance(monsterSpriteManager) {
    const stats = monsterSpriteManager.getStats();
    console.log('📊 Estatísticas do sistema:');
    console.log('   Monstros carregados:', stats.loadedMonsters);
    console.log('   Total de frames:', stats.totalFrames);
    console.log('   Tipos disponíveis:', monsterSpriteManager.getAvailableMonsters());
}

// 9. NONO: Limpar cache (se necessário)

export function clearMonsterCache(monsterSpriteManager) {
    monsterSpriteManager.clearCache();
    console.log('🗑️ Cache de monstros limpo');
}

// 10. DÉCIMO: Exemplo de uso completo

export function exemploCompleto() {
    console.log('🎮 Exemplo de adição de novo monstro:');
    console.log('1. Preparar sprites em assets/monstros/');
    console.log('2. Atualizar monsterConfig.js');
    console.log('3. Atualizar enemyConfig.js (opcional)');
    console.log('4. Testar carregamento');
    console.log('5. Verificar performance');
    console.log('6. Implementar no jogo');
} 