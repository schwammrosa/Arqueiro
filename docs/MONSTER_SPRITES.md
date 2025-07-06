# Sistema de Sprites de Monstros

## Visão Geral

O sistema de sprites de monstros permite que os inimigos sejam renderizados com imagens animadas em vez de formas geométricas simples. O sistema suporta animações baseadas em direção e frame rate configurável.

## Estrutura de Arquivos

```
assets/monstros/
├── goblin_brutao_baixo.png     # Sprite sheet para movimento para baixo (usado pelo monstro normal)
├── goblin_brutao_direita.png   # Sprite sheet para movimento para direita (usado pelo monstro normal)
├── goblin_brutao_esquerda.png  # Sprite sheet para movimento para esquerda (usado pelo monstro normal)
└── goblin_brutao_subindo.png   # Sprite sheet para movimento para cima (usado pelo monstro normal)
```

## Configuração de Sprites

### Formato dos Sprite Sheets

- **Layout**: Frames horizontais (4 frames por direção)
- **Tamanho**: 32x32 pixels por frame
- **Formato**: PNG com transparência
- **Nomenclatura**: `{nome_monstro}_{direcao}.png`

### Direções Suportadas

- `baixo` - Movimento para baixo
- `direita` - Movimento para direita  
- `esquerda` - Movimento para esquerda
- `subindo` - Movimento para cima

## Adicionando Novos Monstros

### 1. Preparar os Sprites

Crie os sprite sheets para cada direção seguindo o padrão:
- 4 frames horizontais
- Tamanho consistente (ex: 32x32 ou 40x40)
- Nomenclatura: `{nome}_{direcao}.png`

### 2. Adicionar Configuração

Edite `js/config/monsterConfig.js`:

```javascript
export const MONSTER_SPRITE_CONFIG = {
    'normal': {
        name: 'Monstro Normal',
        sprites: {
            'down': 'assets/monstros/goblin_brutao_baixo.png',
            'right': 'assets/monstros/goblin_brutao_direita.png',
            'left': 'assets/monstros/goblin_brutao_esquerda.png',
            'up': 'assets/monstros/goblin_brutao_subindo.png'
        },
        size: { width: 32, height: 32 },
        animationFrames: 4,
        frameWidth: 32,
        frameHeight: 32,
        animationSpeed: 200, // ms por frame
        enemyTypes: ['normal', 'fast', 'tank', 'elite']
    },
    'novo_monstro': {
        name: 'Novo Monstro',
        sprites: {
            'down': 'assets/monstros/novo_monstro_baixo.png',
            'right': 'assets/monstros/novo_monstro_direita.png',
            'left': 'assets/monstros/novo_monstro_esquerda.png',
            'up': 'assets/monstros/novo_monstro_subindo.png'
        },
        size: { width: 40, height: 40 },
        animationFrames: 4,
        frameWidth: 40,
        frameHeight: 40,
        animationSpeed: 180,
        enemyTypes: ['tank', 'elite']
    }
};
```

### 3. Mapear Tipos de Inimigos

Atualize o mapeamento em `js/config/monsterConfig.js`:

```javascript
export const ENEMY_TYPE_TO_SPRITE = {
    'normal': 'normal',
    'fast': 'normal', 
    'tank': 'novo_monstro',    // Usar novo sprite para tanques
    'elite': 'novo_monstro'    // Usar novo sprite para elites
};
```

## Configurações Avançadas

### Velocidade de Animação

```javascript
animationSpeed: 200 // 200ms por frame = 5 FPS
animationSpeed: 150 // 150ms por frame = 6.67 FPS
animationSpeed: 100 // 100ms por frame = 10 FPS
```

### Tamanhos de Sprite

```javascript
size: { width: 32, height: 32 }  // Pequeno
size: { width: 40, height: 40 }  // Médio
size: { width: 48, height: 48 }  // Grande
```

### Múltiplos Frames

```javascript
animationFrames: 6,  // 6 frames por direção
frameWidth: 32,      // Largura de cada frame
frameHeight: 32      // Altura de cada frame
```

## Sistema de Fallback

Se os sprites não carregarem ou não estiverem disponíveis, o sistema automaticamente usa o desenho geométrico original:

- Círculos coloridos baseados no tipo de inimigo
- Barras de vida
- Efeitos visuais de slow/freeze

## Performance

### Otimizações Implementadas

1. **Object Pooling**: Frames de animação são pré-processados
2. **Lazy Loading**: Sprites são carregados sob demanda
3. **Cache Management**: Frames são reutilizados
4. **Fallback System**: Desenho geométrico como backup

### Monitoramento

```javascript
// Verificar estatísticas do sistema
const stats = monsterSpriteManager.getStats();
console.log('Monstros carregados:', stats.loadedMonsters);
console.log('Total de frames:', stats.totalFrames);
```

## Troubleshooting

### Sprites Não Aparecem

1. Verificar se os arquivos existem em `assets/monstros/`
2. Verificar nomenclatura dos arquivos
3. Verificar configuração em `monsterConfig.js`
4. Verificar console para erros de carregamento

### Performance Ruim

1. Reduzir `animationSpeed`
2. Diminuir `animationFrames`
3. Otimizar tamanho dos sprites
4. Verificar se há muitos monstros na tela

### Sprites Distorcidos

1. Verificar se `frameWidth` e `frameHeight` estão corretos
2. Verificar se `size` está proporcional aos frames
3. Verificar se os sprite sheets têm o layout correto

## Exemplos de Uso

### Criar Monstro com Sprite

```javascript
const enemy = new Enemy(
    'tank', 
    gameState, 
    GAME_CONFIG, 
    enemyPath, 
    chooseEnemyType, 
    calculateEnemyStats, 
    DamageNumber, 
    showNotification,
    monsterSpriteManager // Passar o sprite manager
);
```

### Verificar se Sprite Está Disponível

```javascript
if (monsterSpriteManager.isMonsterLoaded('normal')) {
    console.log('Sprite do Monstro Normal carregado!');
}
```

### Obter Configuração de Sprite

```javascript
import { getSpriteConfigForEnemyType } from './js/config/monsterConfig.js';

const config = getSpriteConfigForEnemyType('tank');
if (config) {
    console.log('Nome do sprite:', config.name);
    console.log('Tamanho:', config.size);
}
``` 