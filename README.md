# 🏹 Arqueiro - Tower Defense

Um jogo Tower Defense completo desenvolvido em JavaScript puro com múltiplas torres, árvore de habilidades e sistema de progressão.

## 🎮 Características

### Torres Disponíveis
- **🏹 Arqueiro**: Torre básica com ataque rápido
- **💣 Canhão**: Torre de área com explosão
- **🔮 Mágica**: Torre com efeito de congelamento
- **⚡ Tesla**: Torre com encadeamento elétrico
- **🌟 Especial**: Torre exclusiva desbloqueável

### Sistema de Progressão
- **🌳 Árvore de Habilidades**: Desbloqueie melhorias e habilidades especiais
- **✨ Habilidades Especiais**: Chuva de Flechas e Tempestade de Gelo
- **🔄 Modo Continuar**: Continue de onde parou quando perder
- **⚙️ Configurações Avançadas**: Personalize todas as torres

### Funcionalidades
- Sistema de upgrades e vendas de torres
- Múltiplas ondas de inimigos
- Efeitos visuais e feedback
- Interface moderna e responsiva
- Sistema de pontuação e tempo

## 🚀 Como Jogar

1. **Iniciar**: Clique em "Jogar" no menu principal
2. **Colocar Torres**: Selecione uma torre e clique no grid
3. **Iniciar Ondas**: Clique em "Iniciar Onda" para começar
4. **Upgrades**: Clique nas torres para melhorá-las
5. **Habilidades**: Use habilidades especiais quando disponíveis
6. **Progressão**: Desbloqueie melhorias na árvore de habilidades

## 🛠️ Desenvolvimento

### Pré-requisitos
- Navegador moderno com suporte a ES6+
- Python 3.x (para servidor local)

### Instalação Local
```bash
# Clone o repositório
git clone https://github.com/seu-usuario/arqueiro-tower-defense.git
cd arqueiro-tower-defense

# Inicie o servidor local
python -m http.server 8000

# Abra no navegador
open http://localhost:8000
```

### Estrutura do Projeto
```
arqueiro/
├── index.html              # Página principal
├── config.html             # Configurações avançadas
├── game.js                 # Lógica principal do jogo
├── js/
│   ├── classes/            # Classes das entidades
│   ├── config/             # Configurações do jogo
│   └── systems/            # Sistemas do jogo
├── style.css               # Estilos principais
├── skill-tree.css          # Estilos da árvore de habilidades
└── config-style.css        # Estilos das configurações
```

## 🌐 Deploy

### Vercel (Recomendado)
O projeto está configurado para deploy automático no Vercel:

1. **Conecte ao GitHub**: Faça push do código para um repositório GitHub
2. **Importe no Vercel**: Acesse [vercel.com](https://vercel.com) e importe o projeto
3. **Deploy Automático**: O Vercel detectará automaticamente as configurações

### Configurações do Vercel
- `vercel.json`: Configurações de roteamento e headers
- `package.json`: Metadados do projeto
- Deploy automático a cada push

### URLs de Deploy
- **Produção**: `https://seu-projeto.vercel.app`
- **Preview**: `https://seu-projeto-git-branch.vercel.app`

## 🎯 Controles

### Mouse
- **Clique**: Colocar torre / Selecionar torre
- **Clique em torre**: Abrir painel de informações

### Teclado
- **P**: Pausar/Continuar
- **R**: Reiniciar jogo
- **ESC**: Fechar painéis

### Habilidades Especiais
- **Chuva de Flechas**: Clique no botão e depois no local desejado
- **Tempestade de Gelo**: Clique no botão para ativar

## 🔧 Configurações

Acesse as configurações avançadas para personalizar:
- **Torres**: Custo, dano, alcance, taxa de tiro
- **Inimigos**: Vida, velocidade, recompensa
- **Jogo**: Vida inicial, ouro inicial, delay entre ondas
- **Efeitos**: Cores, tamanhos, durações

## 📱 Compatibilidade

- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 13+
- ✅ Edge 80+
- ✅ Mobile (responsivo)

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🙏 Agradecimentos

- Inspirado em clássicos do gênero Tower Defense
- Desenvolvido para fins de estudo e diversão
- Projeto open-source

---

**Divirta-se jogando Arqueiro! 🏹✨** 