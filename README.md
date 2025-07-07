# 🏰 Legado da Fortaleza

Um jogo de Tower Defense moderno e completo desenvolvido em JavaScript puro, com sistema de árvore de habilidades, múltiplos tipos de torres e inimigos, e interface responsiva.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Características](#características)
- [Tecnologias](#tecnologias)
- [Instalação](#instalação)
- [Como Jogar](#como-jogar)
- [Sistema de Torres](#sistema-de-torres)
- [Sistema de Inimigos](#sistema-de-inimigos)
- [Árvore de Habilidades](#árvore-de-habilidades)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Configurações](#configurações)
- [Contribuição](#contribuição)
- [Licença](#licença)

## 🎮 Visão Geral

**Legado da Fortaleza** é um jogo de Tower Defense que combina estratégia clássica com elementos modernos de RPG. Os jogadores devem defender sua fortaleza contra ondas crescentes de inimigos, construindo e evoluindo torres estratégicas, desbloqueando habilidades especiais e gerenciando recursos.

### 🎯 Objetivo
Sobreviver ao máximo de ondas possível, construindo a defesa mais eficiente e desbloqueando upgrades que fortalecem suas torres e habilidades.

## ✨ Características

### 🏗️ Sistema de Torres
- **4 tipos de torres**: Arqueiro, Canhão, Mágica e Tesla
- **Sistema de evolução**: Cada torre pode ser evoluída até 5 níveis
- **Habilidades únicas**: Cada torre possui efeitos especiais
- **Torre Especial**: Desbloqueável através da árvore de habilidades

### 👹 Sistema de Inimigos
- **4 tipos de inimigos**: Normal, Rápido, Tanque e Elite
- **Progressão dinâmica**: Inimigos ficam mais fortes a cada onda
- **Sistema de pontuação**: Diferentes tipos dão diferentes pontos
- **Sprites animados**: Cada tipo possui animações únicas

### 🌟 Árvore de Habilidades
- **3 ramos principais**: Vida, Dano e Especial
- **Sistema de pontos**: Ganhe pontos ao completar ondas
- **Upgrades globais**: Melhorias que afetam todas as torres
- **Habilidades especiais**: Chuva de Flechas e Tempestade de Gelo

### 🎨 Interface Moderna
- **Design responsivo**: Funciona em desktop, tablet e mobile
- **Tema escuro**: Interface moderna com cores vibrantes
- **Animações suaves**: Transições e efeitos visuais
- **Tooltips informativos**: Informações detalhadas sobre elementos

### ⚙️ Sistema de Configurações
- **Configurações personalizáveis**: Ajuste dificuldade e parâmetros
- **Sistema de salvamento**: Progresso salvo automaticamente
- **Modo continuar**: Retome de onde parou
- **Exportar/Importar**: Compartilhe configurações

## 🛠️ Tecnologias

- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Canvas**: Renderização 2D para o jogo
- **LocalStorage**: Persistência de dados
- **CSS Grid/Flexbox**: Layout responsivo
- **SVG**: Conexões da árvore de habilidades

## 🚀 Instalação

### Pré-requisitos
- Navegador moderno (Chrome, Firefox, Safari, Edge)
- Python 3.x (para servidor local) ou qualquer servidor HTTP

### Passos para instalação

1. **Clone o repositório**
   ```bash
   git clone https://github.com/seu-usuario/legado-da-fortaleza.git
   cd legado-da-fortaleza
   ```

2. **Inicie o servidor local**
   ```bash
   # Usando Python
   python -m http.server 8000
   
   # Ou usando npm (se disponível)
   npm start
   ```

3. **Acesse o jogo**
   ```
   http://localhost:8000
   ```

## 🎯 Como Jogar

### Controles Básicos
- **Clique esquerdo**: Selecionar torre para construir
- **Clique direito**: Cancelar seleção
- **Clique na torre**: Ver informações e evoluir/vender
- **Botões de controle**: Pausar, velocidade, próxima onda

### Estratégia
1. **Construa torres** nos pontos estratégicos do mapa
2. **Evolua torres** para aumentar dano e alcance
3. **Use habilidades especiais** em momentos críticos
4. **Invista na árvore de habilidades** para melhorias globais
5. **Gerencie recursos** (vida e ouro) eficientemente

## 🏗️ Sistema de Torres

### Arqueiro 🏹
- **Custo**: 50 ouro
- **Dano**: 15
- **Alcance**: 120px
- **Velocidade**: 1.0s
- **Especial**: Ataque único de alta precisão

### Canhão 🚀
- **Custo**: 75 ouro
- **Dano**: 25
- **Alcance**: 100px
- **Velocidade**: 1.5s
- **Especial**: Dano em área (explosão)

### Mágica 🔮
- **Custo**: 95 ouro
- **Dano**: 20
- **Alcance**: 140px
- **Velocidade**: 1.0s
- **Especial**: Reduz velocidade dos inimigos em 60%

### Tesla ⚡
- **Custo**: 95 ouro
- **Dano**: 20
- **Alcance**: 120px
- **Velocidade**: 1.0s
- **Especial**: Ataque em cadeia (até 5 inimigos)

### Torre Especial 🌟
- **Custo**: 300 ouro
- **Dano**: 40
- **Alcance**: 200px
- **Velocidade**: 0.5s
- **Especial**: Ataca todos os inimigos simultaneamente

## 👹 Sistema de Inimigos

### Normal
- **Vida**: Base
- **Velocidade**: 1.0x
- **Recompensa**: 8 ouro
- **Chance**: 70%

### Rápido
- **Vida**: 0.7x
- **Velocidade**: 1.8x
- **Recompensa**: 10 ouro
- **Chance**: 20%

### Tanque
- **Vida**: 2.5x
- **Velocidade**: 0.6x
- **Recompensa**: 14 ouro
- **Chance**: 8%

### Elite
- **Vida**: 5.0x
- **Velocidade**: 0.8x
- **Recompensa**: 24 ouro
- **Chance**: 2%

## 🌟 Árvore de Habilidades

### Ramo da Vida ❤️
- **Vida Inicial +**: Aumenta vida inicial
- **Cura Passiva**: Regenera vida automaticamente
- **Defesa**: Reduz dano recebido

### Ramo do Dano ⚔️
- **Dano Global +**: Aumenta dano de todas as torres
- **Especializações**: Melhorias específicas por tipo de torre
- **Velocidade**: Aumenta velocidade de ataque

### Ramo Especial ✨
- **Chuva de Flechas +**: Aprimora habilidade especial
- **Tempestade de Gelo**: Nova habilidade de congelamento
- **Ouro Extra**: Bônus de ouro por onda
- **Torre Especial**: Desbloqueia torre exclusiva

## 📁 Estrutura do Projeto

```
legado-da-fortaleza/
├── assets/
│   ├── imagen/
│   │   ├── cena/           # Elementos do cenário
│   │   │   ├── cena1.png
│   │   │   ├── cena2.png
│   │   │   └── cena3.png
│   │   │
│   │   │   └── favicon.ico
│   │   └── monstros/
│   │       ├── Elite/          # Sprites de inimigos elite
│   │       │   └── elite.png
│   │       ├── Normal/         # Sprites de inimigos normais
│   │       │   └── normal.png
│   │       ├── Rapido/         # Sprites de inimigos rápidos
│   │       │   └── rapido.png
│   │       └── Tanque/         # Sprites de inimigos tanque
│   │           └── tanque.png
│   ├── js/
│   │   ├── classes/            # Classes principais do jogo
│   │   │   ├── Enemy.js        # Classe dos inimigos
│   │   │   │   └── Enemy.js
│   │   │   ├── Tower.js        # Classe das torres
│   │   │   │   └── Tower.js
│   │   │   ├── Projectile.js   # Classe dos projéteis
│   │   │   │   └── Projectile.js
│   │   │   └── DamageNumber.js # Classe dos números de dano
│   │   │       └── DamageNumber.js
│   │   ├── config/             # Configurações do jogo
│   │   │   ├── gameConfig.js   # Configurações gerais
│   │   │   │   └── gameConfig.js
│   │   │   ├── towerConfig.js  # Configurações das torres
│   │   │   │   └── towerConfig.js
│   │   │   ├── enemyConfig.js  # Configurações dos inimigos
│   │   │   │   └── enemyConfig.js
│   │   │   └── index.js        # Exportações
│   │   │       └── index.js
│   │   └── systems/            # Sistemas do jogo
│   │       ├── GameSystem.js   # Sistema principal do jogo
│   │       │   └── GameSystem.js
│   │       ├── RenderSystem.js # Sistema de renderização
│   │       │   └── RenderSystem.js
│   │       ├── UISystem.js     # Sistema de interface
│   │       │   └── UISystem.js
│   │       ├── ImageManager.js # Gerenciador de imagens
│   │       │   └── ImageManager.js
│   │       └── SkillTreeSystem.js # Sistema da árvore de habilidades
│   │           └── SkillTreeSystem.js
│   ├── index.html              # Página principal
│   │   └── index.html
│   ├── game.js                 # Arquivo principal do jogo
│   │   └── game.js
│   ├── config.html             # Página de configurações
│   │   └── config.html
│   ├── config.js               # Script das configurações
│   │   └── config.js
│   ├── style.css               # Estilos principais
│   │   └── style.css
│   ├── skill-tree.css          # Estilos da árvore de habilidades
│   │   └── skill-tree.css
│   ├── config-style.css        # Estilos das configurações
│   │   └── config-style.css
│   ├── package.json            # Configurações do projeto
│   │   └── package.json
│   └── vercel.json             # Configuração para deploy
│       └── vercel.json
```

## ⚙️ Configurações

### Configurações do Jogo
- **Vida inicial**: 20
- **Ouro inicial**: 75
- **Tamanho do grid**: 40px
- **Delay entre ondas**: 3 segundos
- **Multiplicadores**: Vida, velocidade e recompensa dos inimigos

### Configurações das Torres
- **Custos**: Personalizáveis por tipo
- **Estatísticas**: Dano, alcance, velocidade de ataque
- **Efeitos especiais**: Configuráveis por torre

### Configurações dos Inimigos
- **Tipos**: 4 tipos com diferentes características
- **Chances de spawn**: Configuráveis por tipo
- **Progressão**: Multiplicadores por onda

## 🎨 Personalização

### Adicionando Novas Torres
1. Adicione configuração em `js/config/towerConfig.js`
2. Crie sprite em `assets/imagen/Torres/`
3. Implemente lógica na classe `Tower.js`

### Adicionando Novos Inimigos
1. Adicione configuração em `js/config/enemyConfig.js`
2. Crie sprites em `assets/monstros/`
3. Implemente lógica na classe `Enemy.js`

### Modificando a Árvore de Habilidades
1. Edite `SKILL_TREE` em `game.js`
2. Adicione ícones em `SKILL_ICONS`
3. Implemente efeitos em `applySkillTreeEffects`

## 🐛 Solução de Problemas

### Problemas Comuns
- **Jogo não carrega**: Verifique se está usando um servidor HTTP
- **Sprites não aparecem**: Verifique caminhos das imagens
- **Configurações não salvam**: Verifique se localStorage está habilitado
- **Performance lenta**: Reduza velocidade do jogo ou feche outras abas

### Debug
- Abra o console do navegador (F12) para ver erros
- Use `localStorage.clear()` para resetar dados
- Verifique arquivos de teste em `test_*.html`

## 🤝 Contribuição

1. **Fork** o projeto
2. Crie uma **branch** para sua feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. **Push** para a branch (`git push origin feature/AmazingFeature`)
5. Abra um **Pull Request**

### Diretrizes de Contribuição
- Mantenha o código limpo e bem documentado
- Teste suas mudanças em diferentes navegadores
- Siga o padrão de nomenclatura existente
- Adicione comentários para funcionalidades complexas

## 📝 Changelog

### Versão 1.0.0 (Dezembro 2024)
- ✅ Sistema completo de Tower Defense
- ✅ 4 tipos de torres com evolução
- ✅ 4 tipos de inimigos com sprites animados
- ✅ Árvore de habilidades com 3 ramos
- ✅ Interface responsiva para mobile
- ✅ Sistema de configurações personalizáveis
- ✅ Modo continuar com salvamento automático
- ✅ Habilidades especiais (Chuva de Flechas, Tempestade de Gelo)
- ✅ Sistema de pontuação e progressão
- ✅ Otimizações de performance

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 👥 Autores

- **Legado da Fortaleza Team** - *Desenvolvimento inicial*

## 🙏 Agradecimentos

- Comunidade de Tower Defense
- Contribuidores de sprites e assets
- Testadores e feedback da comunidade

## 📞 Suporte

- **Issues**: [GitHub Issues](https://github.com/seu-usuario/legado-da-fortaleza/issues)
- **Discord**: [Servidor da Comunidade](link-do-discord)
- **Email**: suporte@legadodafortaleza.com

---

⭐ **Se este projeto te ajudou, considere dar uma estrela no repositório!** 