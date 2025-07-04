# 🚀 Guia de Deploy - Arqueiro Tower Defense

Este guia explica como fazer o deploy do jogo Arqueiro no Vercel.

## 📋 Pré-requisitos

1. **Conta no GitHub**: Para hospedar o código
2. **Conta no Vercel**: Para fazer o deploy
3. **Git instalado**: Para versionamento

## 🔧 Passo a Passo

### 1. Preparar o Repositório

```bash
# Inicializar git (se ainda não foi feito)
git init

# Adicionar todos os arquivos
git add .

# Fazer o primeiro commit
git commit -m "Initial commit: Arqueiro Tower Defense"

# Criar repositório no GitHub e conectar
git remote add origin https://github.com/seu-usuario/arqueiro-tower-defense.git
git branch -M main
git push -u origin main
```

### 2. Deploy no Vercel

1. **Acesse [vercel.com](https://vercel.com)**
2. **Faça login** com sua conta GitHub
3. **Clique em "New Project"**
4. **Importe o repositório** `arqueiro-tower-defense`
5. **Configure o projeto**:
   - **Framework Preset**: Other
   - **Root Directory**: `./` (padrão)
   - **Build Command**: Deixe vazio
   - **Output Directory**: Deixe vazio
6. **Clique em "Deploy"**

### 3. Configurações Automáticas

O Vercel detectará automaticamente:
- ✅ `vercel.json` - Configurações de roteamento
- ✅ `package.json` - Metadados do projeto
- ✅ `_headers` - Headers de segurança
- ✅ `.gitignore` - Arquivos ignorados

### 4. URLs Geradas

Após o deploy, você terá:
- **Produção**: `https://seu-projeto.vercel.app`
- **Preview**: `https://seu-projeto-git-branch.vercel.app`

## 🔄 Deploy Automático

A cada push para o repositório:
1. **Vercel detecta** as mudanças automaticamente
2. **Faz build** do projeto
3. **Deploy** para produção
4. **Notifica** via email/Discord

## 🛠️ Configurações Avançadas

### Variáveis de Ambiente (se necessário)
```bash
# No painel do Vercel > Settings > Environment Variables
NODE_ENV=production
```

### Domínio Customizado
1. **Vercel Dashboard** > Settings > Domains
2. **Adicione seu domínio**
3. **Configure DNS** conforme instruções

### Branch de Preview
- **main**: Deploy automático para produção
- **develop**: Deploy para preview
- **feature/***: Deploy para preview

## 🐛 Troubleshooting

### Erro: Módulos ES6 não carregam
**Solução**: Verifique se o `vercel.json` está configurado corretamente.

### Erro: Página não encontrada
**Solução**: Verifique se o `index.html` está na raiz do projeto.

### Erro: Assets não carregam
**Solução**: Verifique se os caminhos dos arquivos estão corretos.

## 📱 Teste Pós-Deploy

1. **Acesse a URL** gerada pelo Vercel
2. **Teste todas as funcionalidades**:
   - ✅ Menu principal
   - ✅ Jogo básico
   - ✅ Configurações
   - ✅ Árvore de habilidades
   - ✅ Sistema de continuar
3. **Teste em diferentes dispositivos**:
   - ✅ Desktop
   - ✅ Mobile
   - ✅ Tablet

## 🔒 Segurança

O projeto inclui headers de segurança:
- **X-Frame-Options**: Previne clickjacking
- **X-Content-Type-Options**: Previne MIME sniffing
- **Referrer-Policy**: Controla informações de referência
- **Permissions-Policy**: Restringe permissões do navegador

## 📊 Monitoramento

No Vercel Dashboard você pode monitorar:
- **Performance**: Tempo de carregamento
- **Erros**: Logs de erro
- **Analytics**: Visitas e uso
- **Functions**: Execução de funções (se houver)

## 🎯 Próximos Passos

Após o deploy bem-sucedido:
1. **Compartilhe a URL** com amigos
2. **Colete feedback** dos usuários
3. **Monitore performance** no Vercel
4. **Faça melhorias** baseadas no feedback
5. **Deploy automático** a cada atualização

---

**🎮 Seu jogo estará online e acessível para todos!** 