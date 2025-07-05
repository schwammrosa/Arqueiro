# 🏹 Legado da Fortaleza

Um jogo Tower Defense completo e moderno desenvolvido em JavaScript vanilla com HTML5 Canvas. O projeto conta com sistema de torres múltiplas, árvore de habilidades, configurações customizáveis e modo infinito.

## 🎮 Sobre o Jogo

**Legado da Fortaleza** é um jogo de defesa de torres onde você deve proteger sua base de ondas infinitas de inimigos. Construa torres estratégicamente, evolua suas habilidades e sobreviva o máximo de ondas possível!

### 🌟 Características Principais

- **Modo Infinito**: Ondas infinitas com dificuldade crescente
- **5 Tipos de Torres**: Cada uma com características únicas
- **4 Tipos de Inimigos**: Diferentes estratégias de combate
- **Árvore de Habilidades**: Sistema de progressão permanente
- **Habilidades Especiais**: Chuva de Flechas e Tempestade de Gelo
- **Sistema de Configuração**: Customização completa do jogo
- **Responsivo**: Funciona perfeitamente em desktop, tablet e mobile
- **Salvamento Automático**: Progresso salvo localmente

## 🚀 Como Jogar

### Instalação e Execução

1. **Clone o repositório**:
```bash
git clone https://github.com/seu-usuario/legado-da-fortaleza.git
cd legado-da-fortaleza
```

2. **Execute o servidor local**:
```bash
# Usando Python
python -m http.server 8000

# Usando Node.js
npm run dev
```

3. **Abra no navegador**:
```
http://localhost:8000
```

### Controles Básicos

- **Colocar Torres**: Clique em uma célula vazia do grid
- **Selecionar Torre**: Clique na célula e escolha o tipo
- **Evoluir Torre**: Clique na torre e pressione "Evoluir"
- **Vender Torre**: Clique na torre e pressione "Vender"
- **Habilidades Especiais**: Use os botões laterais
- **Controle de Velocidade**: Botão de velocidade (1x, 2x, 3x)

## 🏰 Sistema de Torres

### Torre Arqueiro 🏹
- **Custo**: 50 ouro
- **Alcance**: 120 pixels
- **Dano**: 15
- **Taxa de Tiro**: 1000ms
- **Especialidade**: Dano consistente e bom alcance

### Torre Canhão 🚀
- **Custo**: 75 ouro
- **Alcance**: 100 pixels
- **Dano**: 25 (área)
- **Taxa de Tiro**: 1500ms
- **Especialidade**: Dano em área, ideal para grupos

### Torre Mágica 🔮
- **Custo**: 95 ouro
- **Alcance**: 140 pixels
- **Dano**: 20 + congelamento
- **Taxa de Tiro**: 1000ms
- **Especialidade**: Reduz velocidade dos inimigos

### Torre Tesla ⚡
- **Custo**: 95 ouro
- **Alcance**: 120 pixels
- **Dano**: 20 (encadeamento)
- **Taxa de Tiro**: 1000ms
- **Especialidade**: Ataca múltiplos inimigos em cadeia

### Torre Especial 🌟
- **Custo**: 300 ouro
- **Alcance**: 200 pixels
- **Dano**: 40 (todos os inimigos)
- **Taxa de Tiro**: 500ms
- **Especialidade**: Ataca todos os inimigos na tela

## 👹 Tipos de Inimigos

### Inimigo Normal 🔴
- **Vida**: Base (multiplicador: 1x)
- **Velocidade**: Base (multiplicador: 1x)
- **Recompensa**: Base (multiplicador: 1x)
- **Chance**: 70%

### Inimigo Rápido 🟡
- **Vida**: Reduzida (multiplicador: 0.7x)
- **Velocidade**: Alta (multiplicador: 1.8x)
- **Recompensa**: Aumentada (multiplicador: 1.2x)
- **Chance**: 20%

### Inimigo Tanque ⚫
- **Vida**: Muito Alta (multiplicador: 2.5x)
- **Velocidade**: Reduzida (multiplicador: 0.6x)
- **Recompensa**: Alta (multiplicador: 1.8x)
- **Chance**: 8%

### Inimigo Elite 🔴
- **Vida**: Extrema (multiplicador: 5x)
- **Velocidade**: Moderada (multiplicador: 0.8x)
- **Recompensa**: Máxima (multiplicador: 3x)
- **Chance**: 2%

## 🌳 Árvore de Habilidades

### Ramo Vida ❤️
- **Vida Inicial +**: +1 vida por nível (máx: 5)
- **Cura Passiva**: Regenera 1 vida a cada 20s (máx: 3)
- **Defesa**: Reduz dano recebido em 10% por nível (máx: 3)

### Ramo Dano ⚔️
- **Dano Global +**: +5% dano para todas as torres (máx: 5)
- **Dano Específico**: +10% dano por tipo de torre (máx: 3)
- **Melhorias Especiais**: Velocidade, área, congelamento, encadeamento

### Ramo Especial ✨
- **Chuva de Flechas**: Aprimora a habilidade especial
- **Tempestade de Gelo**: Desbloqueia nova habilidade
- **Ouro Extra**: +10% ouro por onda
- **Torre Especial**: Desbloqueia nova torre

## 💫 Habilidades Especiais

### Chuva de Flechas 🏹
- **Cooldown**: 30 segundos
- **Efeito**: Causa dano em área selecionada
- **Melhorias**: Pode ser aprimorada na árvore de habilidades

### Tempestade de Gelo ❄️
- **Cooldown**: 45 segundos
- **Efeito**: Congela todos os inimigos na tela
- **Desbloqueio**: Disponível via árvore de habilidades

## ⚙️ Sistema de Configuração

O jogo possui um sistema completo de configuração acessível via interface:

### Configurações Gerais
- Vida inicial (padrão: 20)
- Ouro inicial (padrão: 75)
- Tamanho do grid (padrão: 40px)
- Delay entre ondas (padrão: 5s)

### Configurações de Torres
- Custo, dano, alcance e taxa de tiro
- Multiplicadores de evolução
- Efeitos especiais personalizáveis

### Configurações de Inimigos
- Vida base e progressão
- Velocidade e multiplicadores
- Recompensas e chances de spawn

### Configurações Visuais
- Tamanho do canvas
- Velocidade de projéteis
- Efeitos visuais

## 📱 Responsividade

O jogo foi otimizado para diferentes dispositivos:

- **Desktop**: Experiência completa com todas as informações
- **Tablet**: Interface adaptada com controles otimizados
- **Mobile**: Layout compacto com informações essenciais

### Otimizações Mobile
- Botões com tamanhos adequados para toque
- Painel de informações reduzido
- Cálculo dinâmico de altura disponível
- Reajuste automático no resize da tela

## 🔧 Arquitetura Técnica

### Estrutura do Projeto
```
Legado da Fortaleza/
├── index.html              # Página principal
├── game.js                 # Lógica principal do jogo
├── config.js              # Sistema de configuração
├── config.html            # Interface de configuração
├── style.css              # Estilos principais
├── skill-tree.css         # Estilos da árvore de habilidades
├── config-style.css       # Estilos da configuração
├── assets/
│   └── imagen/
│       └── favicon.ico    # Ícone do jogo
└── js/
    ├── classes/           # Classes do jogo
    │   ├── Tower.js       # Classe das torres
    │   ├── Enemy.js       # Classe dos inimigos
    │   ├── Projectile.js  # Classe dos projéteis
    │   └── DamageNumber.js # Números de dano
    ├── config/            # Configurações
    │   ├── gameConfig.js  # Configurações gerais
    │   ├── towerConfig.js # Configurações das torres
    │   └── enemyConfig.js # Configurações dos inimigos
    └── systems/           # Sistemas do jogo
        ├── GameSystem.js  # Sistema principal
        ├── RenderSystem.js # Sistema de renderização
        ├── UISystem.js    # Sistema de interface
        └── SkillTreeSystem.js # Sistema da árvore
```

### Tecnologias Utilizadas
- **HTML5 Canvas**: Renderização do jogo
- **JavaScript ES6+**: Lógica principal
- **CSS3**: Styling e responsividade
- **localStorage**: Persistência de dados
- **JSON**: Configurações e salvamento

### Principais Sistemas

#### Sistema de Jogo
- Loop principal com requestAnimationFrame
- Gerenciamento de estado global
- Sistema de ondas infinitas
- Detecção de colisões

#### Sistema de Renderização
- Renderização otimizada no Canvas
- Efeitos visuais (números de dano, explosões)
- Interface responsiva
- Animações fluidas

#### Sistema de Interface
- Painel de informações dinâmico
- Controles intuitivos
- Tooltips informativos
- Feedback visual

## 🎯 Mecânicas de Jogo

### Progressão
- **Ondas**: Dificuldade crescente exponencial
- **Ouro**: Obtido eliminando inimigos
- **Pontos**: Sistema de pontuação global
- **Habilidades**: Pontos ganhos por performance

### Balanceamento
- **Vida dos Inimigos**: Multiplicador 1.25x por onda
- **Velocidade**: Multiplicador 1.15x por onda
- **Quantidade**: +3 inimigos a cada onda
- **Recompensas**: Balanceadas por dificuldade

### Estratégias
- **Posicionamento**: Torres no caminho dos inimigos
- **Combinação**: Diferentes tipos para diferentes situações
- **Evolução**: Melhorar torres existentes vs. construir novas
- **Habilidades**: Timing correto para máximo impacto

## 🔄 Sistema de Salvamento

### Dados Salvos
- **Progresso**: Onda atual e estatísticas
- **Configurações**: Preferências personalizadas
- **Árvore de Habilidades**: Pontos e melhorias
- **Recordes**: Melhor performance

### Formato de Dados
```javascript
{
  "gameState": {
    "wave": 15,
    "gold": 500,
    "health": 18,
    "score": 12000
  },
  "skillTree": {
    "vida": 3,
    "dano": 2,
    "esp": 1
  },
  "config": {
    "initialHealth": 20,
    "initialGold": 75
  }
}
```

## 🚀 Deploy

### Vercel
O projeto está configurado para deploy automático na Vercel:

```json
{
  "version": 2,
  "rewrites": [
    {
      "source": "/",
      "destination": "/index.html"
    },
    {
      "source": "/config",
      "destination": "/config.html"
    }
  ]
}
```

### Hospedagem Local
Para servir localmente:
```bash
# Python
python -m http.server 8000

# Node.js
npx http-server -p 8000

# PHP
php -S localhost:8000
```

## 🎨 Customização

### Modificar Torres
Edite `js/config/towerConfig.js`:
```javascript
archer: {
  name: 'Arqueiro',
  cost: 50,
  range: 120,
  damage: 15,
  fireRate: 1000,
  color: '#4e73df',
  icon: '🏹'
}
```

### Modificar Inimigos
Edite `js/config/enemyConfig.js`:
```javascript
normal: {
  name: 'Normal',
  healthMultiplier: 1,
  speedMultiplier: 1,
  rewardMultiplier: 1,
  spawnChance: 70,
  color: '#dc3545'
}
```

### Modificar Habilidades
Edite a constante `SKILL_TREE` em `game.js`:
```javascript
{ 
  id: 'vida', 
  name: 'Vida Inicial +', 
  desc: '+1 de vida inicial por nível', 
  max: 5, 
  cost: 1, 
  parent: null 
}
```

## 🤝 Contribuindo

1. **Fork** o projeto
2. **Crie** uma branch para sua feature
3. **Commit** suas mudanças
4. **Push** para a branch
5. **Abra** um Pull Request

### Diretrizes
- Mantenha o código limpo e comentado
- Teste todas as funcionalidades
- Documente mudanças significativas
- Respeite a estrutura existente

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🎮 Créditos

- **Desenvolvido por**: Legado da Fortaleza Team
- **Inspirado em**: Clássicos do gênero Tower Defense
- **Finalidade**: Projeto open-source para estudo e diversão

## 🐛 Bugs Conhecidos

- Nenhum bug crítico conhecido atualmente
- Reportar issues na aba "Issues" do GitHub

## 📈 Futuras Melhorias

- [ ] Mais tipos de torres
- [ ] Boss battles
- [ ] Multiplayer
- [ ] Conquistas
- [ ] Leaderboards online
- [ ] Temas visuais
- [ ] Efeitos sonoros
- [ ] Tutorial interativo

---

**Divirta-se jogando Legado da Fortaleza!** 🏹✨ 