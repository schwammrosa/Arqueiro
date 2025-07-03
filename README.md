# Arqueiro - Tower Defense

## Descrição

**Arqueiro** é um jogo Tower Defense totalmente customizável, desenvolvido em JavaScript puro, onde o objetivo é defender seu território de ondas de inimigos utilizando torres com diferentes habilidades e evoluções. O projeto conta com um sistema avançado de árvore de habilidades, upgrades globais, configurações visuais e de gameplay, além de uma interface moderna e intuitiva.

---

## Funcionalidades Principais

- **Várias Torres**: Arqueiro, Canhão, Mago e Tesla, cada uma com atributos, custos e efeitos únicos.
- **Árvore de Habilidades Global**: Evolua atributos como vida, dano, defesa, habilidades especiais e desbloqueie torres exclusivas.
- **Configurações Avançadas**: Personalize vida inicial, ouro, tamanho do grid, velocidade dos projéteis, número de ondas, dificuldade dos inimigos e muito mais.
- **Habilidades Especiais**: Chuva de Flechas, Tempestade de Gelo e outras, desbloqueáveis via árvore de habilidades.
- **Sistema de Upgrades**: Evolua torres individualmente durante a partida e distribua pontos globais na árvore de habilidades.
- **Painel de Configurações**: Interface dedicada para ajustar todos os parâmetros do jogo e da árvore de habilidades.
- **Feedback Visual**: Números de dano, notificações, animações e painel de informações detalhadas das torres.
- **Salvamento Local**: Progresso, configurações e upgrades são salvos automaticamente no navegador.

---

## Como Jogar

1. **Abra o arquivo `index.html`** no seu navegador de preferência (recomendado: Chrome, Edge ou Firefox).
   - Não é necessário instalar dependências ou rodar servidor: basta abrir o arquivo diretamente.
2. **Configurações**: Clique em ⚙️ Configurações para personalizar o jogo antes de começar.
3. **Início**: Clique em "PRÓXIMA ONDA" para iniciar as ondas de inimigos.
4. **Construção de Torres**: Selecione uma torre na barra inferior e clique no grid para posicioná-la.
5. **Upgrades**: Clique em uma torre já posicionada para ver informações e evoluir ou vender.
6. **Árvore de Habilidades**: Clique em "Upgrades" para abrir o painel global e distribuir pontos de upgrade.
7. **Habilidades Especiais**: Use os botões fixos para ativar habilidades como Chuva de Flechas e Tempestade de Gelo (quando desbloqueadas).
8. **Fim de Jogo**: O jogo termina quando sua vida chega a zero ou você completa todas as ondas.

---

## Árvore de Habilidades

A árvore de habilidades é dividida em três ramos principais:

- **Vida/Suporte**: Aumenta vida inicial, defesa (reduz dano recebido) e cura passiva.
- **Dano**: Melhora dano, alcance, velocidade e efeitos especiais das torres.
- **Especial**: Desbloqueia habilidades globais (Chuva de Flechas, Tempestade de Gelo, Ouro extra por onda, Torre especial).

Cada nó pode ser evoluído com pontos de upgrade, que são acumulados ao longo das partidas. Os upgrades afetam diretamente o desempenho das torres e habilidades especiais.

---

## Estrutura do Projeto

```
Arqueiro/
├── index.html              # Ponto de entrada do jogo
├── config.html             # Painel de configurações avançadas
├── game.js                 # Lógica principal do jogo
├── config.js               # Lógica das configurações e árvore de habilidades
├── js/
│   ├── classes/            # Classes de entidades (Torre, Inimigo, Projétil, etc)
│   ├── config/             # Configurações de torres, inimigos e jogo
│   └── systems/            # Sistemas do jogo (GameSystem, RenderSystem, SkillTreeSystem, UISystem)
├── style.css               # Estilo principal do jogo
├── config-style.css        # Estilo do painel de configurações
├── skill-tree.css          # Estilo da árvore de habilidades
└── README.md               # (Este arquivo)
```

---

## Personalização

- **Configurações do Jogo**: Ajuste vida, ouro, grid, dificuldade, visuais e mais em `config.html`.
- **Árvore de Habilidades**: Distribua pontos para evoluir globalmente seu desempenho.
- **Caminho dos Inimigos**: Edite o caminho dos inimigos no painel de configuração.

---

## Requisitos

- Navegador moderno (suporte a ES6+ e módulos JS).
- Não requer instalação de dependências ou servidor.

---

## Créditos

Desenvolvido por [Seu Nome ou Equipe].  
Inspirado em clássicos do gênero Tower Defense.

---

## Licença

Este projeto é open-source. Sinta-se livre para modificar, contribuir e compartilhar! 