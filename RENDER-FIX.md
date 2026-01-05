# 🔧 Correção Rápida - Render Deploy

## ✅ Build Funcionou!

O build do Docker foi concluído com sucesso! O problema agora é apenas configuração de variáveis de ambiente.

## ❌ Erro Atual

```
Error: Environment variable not found: DATABASE_URL.
```

## 🔧 Solução Rápida

### 1. Criar Banco de Dados PostgreSQL no Render

1. No Render Dashboard, clique em **"New +"** → **"PostgreSQL"**
2. Configure:
   - **Name**: `playground-db` (ou outro nome)
   - **Database**: `playground` (ou outro nome)
   - **User**: (será gerado automaticamente)
   - **Region**: Escolha a mesma região do seu Web Service
   - **PostgreSQL Version**: Use a mais recente
   - **Plan**: Free (ou pago)
3. Clique em **"Create Database"**
4. Aguarde alguns minutos para o banco ser criado

### 2. Obter a URL do Banco

1. Após criar o banco, vá para a página do banco de dados
2. Na seção **"Connections"**, você verá:
   - **Internal Database URL** ← **USE ESTA!**
   - External Database URL (não use esta)
3. Copie a **Internal Database URL**

Exemplo de formato:
```
postgresql://usuario:senha@dpg-xxxxx-a.oregon-postgres.render.com/playground_xxxx
```

### 3. Configurar Variáveis de Ambiente no Web Service

1. Vá para o seu **Web Service** no Render Dashboard
2. Clique em **"Environment"** no menu lateral
3. Adicione as seguintes variáveis:

#### Variáveis Obrigatórias:

```env
DATABASE_URL=postgresql://usuario:senha@host:5432/database?schema=public
```

Cole a **Internal Database URL** que você copiou.

#### Outras Variáveis Necessárias:

```env
NODE_ENV=production
JWT_SECRET=<sua-chave-secreta-forte>
CORS_ORIGIN=https://seu-frontend.com
```

**Como gerar JWT_SECRET:**
```bash
openssl rand -base64 32
```

### 4. Redeploy

Após configurar as variáveis:

1. Vá para **"Manual Deploy"** no menu do Web Service
2. Clique em **"Deploy latest commit"**
3. Aguarde o deploy completar

## 📝 Checklist Completo

- [ ] Banco PostgreSQL criado no Render
- [ ] Internal Database URL copiada
- [ ] Variável `DATABASE_URL` configurada no Web Service
- [ ] Variável `JWT_SECRET` configurada (mínimo 32 caracteres)
- [ ] Variável `NODE_ENV=production` configurada
- [ ] Variável `CORS_ORIGIN` configurada (se tiver frontend)
- [ ] Deploy executado

## 🔍 Verificação

Após o deploy, teste:

```bash
# Health check
curl https://seu-app.onrender.com/health

# Deve retornar:
{
  "status": "ok",
  "timestamp": "...",
  "uptime": ...,
  "environment": "production",
  "version": "1.0.0"
}
```

## ⚠️ Importante

- Use sempre a **Internal Database URL** (não a External)
- O banco e o Web Service devem estar na **mesma região**
- O `JWT_SECRET` deve ser único e seguro
- Não commite o `JWT_SECRET` no código

## 🐛 Se Ainda Der Erro

1. Verifique se todas as variáveis estão configuradas
2. Verifique se o banco está na mesma região
3. Verifique os logs do deploy no Render
4. Certifique-se de que o banco está "Available" (não "Creating")

## 📚 Próximos Passos

Após o deploy funcionar:

1. Execute as migrações (já estão no Dockerfile, mas você pode verificar)
2. Execute o seed se necessário:
   ```bash
   # Via Render Shell ou localmente com DATABASE_URL configurada
   npm run prisma:seed
   ```
3. Teste os endpoints da API

