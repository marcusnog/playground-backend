# 🚀 Deploy no Render.com

Guia completo para fazer deploy da aplicação no Render.

## 📋 Pré-requisitos

1. Conta no [Render.com](https://render.com)
2. Repositório Git (GitHub, GitLab ou Bitbucket)
3. Banco de dados PostgreSQL (Render oferece banco gratuito)

## 🔧 Configuração no Render

### Opção 1: Usando Dockerfile (Recomendado)

O Render detectará automaticamente o `Dockerfile` na raiz do projeto.

1. **Criar novo Web Service**
   - Acesse [Render Dashboard](https://dashboard.render.com)
   - Clique em **"New +"** → **"Web Service"**
   - Conecte seu repositório

2. **Configurações do Serviço**
   - **Name**: `playground-backend`
   - **Environment**: `Docker`
   - **Region**: Escolha a região mais próxima
   - **Branch**: `main` (ou sua branch principal)
   - **Root Directory**: Deixe vazio (raiz)
   - **Dockerfile Path**: `Dockerfile` (deve estar na raiz)

3. **Variáveis de Ambiente**
   Configure as seguintes variáveis:
   
   ```
   NODE_ENV=production
   PORT=3001
   JWT_SECRET=<gere-uma-chave-secreta-forte>
   DATABASE_URL=<url-do-postgresql-do-render>
   CORS_ORIGIN=https://seu-frontend.com
   ```

   **Como gerar JWT_SECRET:**
   ```bash
   openssl rand -base64 32
   ```

4. **Configurar Banco de Dados PostgreSQL**
   - No Render Dashboard, clique em **"New +"** → **"PostgreSQL"**
   - Escolha o plano gratuito (ou pago)
   - Copie a **Internal Database URL**
   - Cole no campo `DATABASE_URL` do seu Web Service

### Opção 2: Usando Build Command (Alternativa)

Se preferir não usar Docker:

1. **Criar novo Web Service**
   - **Environment**: `Node`
   - **Build Command**: 
     ```bash
     cd backend && npm ci && npm run prisma:generate && npm run build
     ```
   - **Start Command**: 
     ```bash
     cd backend && npm run prisma:migrate:deploy && npm start
     ```
   - **Root Directory**: `backend`

2. **Variáveis de Ambiente** (mesmas da Opção 1)

## 🔐 Variáveis de Ambiente Necessárias

Configure todas estas variáveis no painel do Render:

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `NODE_ENV` | Ambiente | `production` |
| `PORT` | Porta (Render define automaticamente) | `3001` |
| `JWT_SECRET` | Chave secreta JWT | `K8j3mN9pQ2rT5vW8xY1zA4bC6dE7fG9hI0jK2lM3nO4pQ5rS6tU7vW8xY9z` |
| `DATABASE_URL` | URL do PostgreSQL | `postgresql://user:pass@host:5432/dbname` |
| `CORS_ORIGIN` | Origens permitidas | `https://meusite.com` |

## 📝 Passo a Passo Detalhado

### 1. Preparar o Repositório

Certifique-se de que o `Dockerfile` está na raiz:
```bash
# Verificar estrutura
ls -la Dockerfile
```

### 2. Criar Banco de Dados PostgreSQL

1. No Render Dashboard → **"New +"** → **"PostgreSQL"**
2. Nome: `playground-db`
3. Plano: Free (ou pago)
4. Após criar, copie a **Internal Database URL**

### 3. Criar Web Service

1. **New +** → **Web Service**
2. Conecte seu repositório
3. Configure:
   - **Name**: `playground-backend`
   - **Environment**: `Docker`
   - **Region**: Escolha a região
   - **Branch**: `main`
   - **Root Directory**: (deixe vazio)
   - **Dockerfile Path**: `Dockerfile`

### 4. Configurar Variáveis

Na seção **Environment Variables**, adicione:

```env
NODE_ENV=production
JWT_SECRET=<sua-chave-secreta>
DATABASE_URL=<url-do-postgresql>
CORS_ORIGIN=https://seu-frontend.com
```

**Importante**: 
- O Render define `PORT` automaticamente
- Use a **Internal Database URL** do PostgreSQL (não a pública)

### 5. Deploy

1. Clique em **"Create Web Service"**
2. O Render iniciará o build automaticamente
3. Aguarde o deploy completar
4. Verifique os logs se houver erros

## 🔍 Verificação

Após o deploy:

1. **Health Check**:
   ```bash
   curl https://seu-app.onrender.com/health
   ```

2. **Testar Login**:
   ```bash
   curl -X POST https://seu-app.onrender.com/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"admin"}'
   ```

## 🐛 Troubleshooting

### Erro: "Dockerfile not found"
- **Causa**: Dockerfile não está na raiz
- **Solução**: Certifique-se de que o `Dockerfile` está na raiz do repositório

### Erro: "Prisma schema not found"
- **Causa**: Caminhos incorretos no Dockerfile
- **Solução**: Verifique se o Dockerfile referencia `backend/` corretamente

### Erro: "Database connection failed"
- **Causa**: `DATABASE_URL` incorreta ou banco não acessível
- **Solução**: 
  - Use a **Internal Database URL** (não a pública)
  - Verifique se o banco está no mesmo ambiente (region)

### Erro: "Migration failed"
- **Causa**: Migrações não executadas
- **Solução**: O Dockerfile já executa `prisma migrate deploy` automaticamente

### Build muito lento
- **Causa**: Build sem cache
- **Solução**: O Dockerfile usa multi-stage build para otimizar

## 📊 Monitoramento

O Render oferece:
- **Logs em tempo real**
- **Métricas de performance**
- **Health checks automáticos**
- **Deploys automáticos** (quando você faz push)

## 🔄 Atualizações

O Render faz deploy automático quando você faz push para a branch configurada.

Para deploy manual:
1. Vá para o serviço no Dashboard
2. Clique em **"Manual Deploy"**
3. Escolha a branch e commit

## 💰 Custos

- **Plano Free**: 
  - Web Service dorme após 15min de inatividade
  - PostgreSQL gratuito (limitações)
- **Plano Starter**: $7/mês
  - Sempre ativo
  - Melhor performance

## 📚 Recursos Adicionais

- [Documentação Render](https://render.com/docs)
- [Render Docker Guide](https://render.com/docs/docker)
- [Render Environment Variables](https://render.com/docs/environment-variables)

## ✅ Checklist de Deploy

- [ ] Dockerfile na raiz do repositório
- [ ] Banco PostgreSQL criado no Render
- [ ] Web Service criado
- [ ] Todas as variáveis de ambiente configuradas
- [ ] Build completado com sucesso
- [ ] Health check respondendo
- [ ] Login funcionando
- [ ] CORS configurado corretamente

## 🆘 Suporte

Se encontrar problemas:
1. Verifique os logs no Render Dashboard
2. Verifique se todas as variáveis estão configuradas
3. Teste localmente primeiro
4. Consulte a documentação do Render

