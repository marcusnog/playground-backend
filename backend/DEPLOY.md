# 🚀 Guia de Deploy - Backend

Este guia explica como fazer deploy do backend em diferentes ambientes.

## 📋 Pré-requisitos

- Node.js 20+ instalado
- npm ou yarn
- Banco de dados configurado (SQLite ou PostgreSQL)
- Variáveis de ambiente configuradas

## 🔧 Preparação

### 1. Configurar Variáveis de Ambiente

```bash
cp env.example .env
```

Edite o `.env` e configure:

**Obrigatórias:**
- `JWT_SECRET` - Chave secreta para JWT (mínimo 32 caracteres)
  ```bash
  # Gerar uma chave segura:
  openssl rand -base64 32
  ```
- `DATABASE_URL` - URL do banco de dados

**Recomendadas para Produção:**
- `NODE_ENV=production`
- `CORS_ORIGIN` - Origens permitidas (separadas por vírgula)
  ```
  CORS_ORIGIN=https://seusite.com,https://www.seusite.com
  ```

### 2. Verificar Configuração

```bash
npm run check-env
```

Este comando verifica se todas as variáveis necessárias estão configuradas.

## 🐳 Deploy com Docker (Recomendado)

### Build da Imagem

```bash
docker build -t playground-backend:latest .
```

### Executar Container

```bash
docker run -d \
  --name playground-backend \
  -p 3001:3001 \
  --env-file .env \
  -v $(pwd)/data:/app/data \
  --restart unless-stopped \
  playground-backend:latest
```

### Usando Docker Compose

```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 📦 Deploy Manual

### 1. Preparar Ambiente

```bash
# Instalar dependências
npm ci

# Gerar Prisma Client
npm run prisma:generate

# Executar migrações
npm run prisma:migrate:deploy

# Build
npm run build
```

### 2. Executar Servidor

**Opção A: Node direto**
```bash
npm start
```

**Opção B: PM2 (Recomendado para produção)**
```bash
# Instalar PM2 globalmente
npm install -g pm2

# Iniciar aplicação
pm2 start dist/server.js --name playground-backend

# Salvar configuração
pm2 save

# Configurar para iniciar no boot
pm2 startup
```

**Opção C: systemd (Linux)**
```bash
# Criar arquivo /etc/systemd/system/playground-backend.service
[Unit]
Description=Playground Backend API
After=network.target

[Service]
Type=simple
User=nodejs
WorkingDirectory=/app/backend
Environment=NODE_ENV=production
ExecStart=/usr/bin/node dist/server.js
Restart=on-failure

[Install]
WantedBy=multi-user.target

# Habilitar e iniciar
sudo systemctl enable playground-backend
sudo systemctl start playground-backend
```

## ☁️ Deploy em Plataformas Cloud

### Railway

1. Conecte seu repositório GitHub
2. Configure variáveis de ambiente:
   - `JWT_SECRET`
   - `DATABASE_URL`
   - `NODE_ENV=production`
   - `CORS_ORIGIN`
3. Railway detectará automaticamente e fará o build

### Render

**Opção 1: Usando Dockerfile (Recomendado)**

1. Certifique-se de que o `Dockerfile` está na **raiz** do repositório
2. Crie um novo Web Service no Render
3. Conecte seu repositório
4. Configure:
   - **Environment**: `Docker`
   - **Dockerfile Path**: `Dockerfile`
5. Adicione variáveis de ambiente (veja `RENDER-DEPLOY.md` para detalhes)

**Opção 2: Usando Build Commands**

1. Crie um novo Web Service
2. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `npm ci && npm run prisma:generate && npm run build`
   - **Start Command**: `npm run prisma:migrate:deploy && npm start`
3. Adicione variáveis de ambiente

📚 **Guia completo**: Veja `RENDER-DEPLOY.md` na raiz do projeto

### Heroku

```bash
# Instalar Heroku CLI
heroku login

# Criar app
heroku create seu-app-name

# Adicionar buildpack do Node.js
heroku buildpacks:set heroku/nodejs

# Configurar variáveis
heroku config:set JWT_SECRET=seu-jwt-secret
heroku config:set DATABASE_URL=sua-database-url
heroku config:set NODE_ENV=production

# Deploy
git push heroku main
```

### DigitalOcean App Platform

1. Conecte seu repositório
2. Configure:
   - **Build Command**: `npm ci && npm run prisma:generate && npm run build`
   - **Run Command**: `npm start`
3. Adicione variáveis de ambiente
4. Configure banco de dados PostgreSQL (recomendado)

## 🗄️ Banco de Dados

### SQLite (Desenvolvimento)

O banco será criado automaticamente em `./data/dev.db`

### PostgreSQL (Produção Recomendado)

1. Crie um banco PostgreSQL
2. Atualize `DATABASE_URL`:
   ```
   DATABASE_URL="postgresql://user:password@host:5432/playground?schema=public"
   ```
3. Execute migrações:
   ```bash
   npm run prisma:migrate:deploy
   ```
4. Execute seed (opcional):
   ```bash
   npm run prisma:seed
   ```

## 🔒 Segurança

### Checklist de Segurança

- [ ] `JWT_SECRET` com pelo menos 32 caracteres
- [ ] `CORS_ORIGIN` configurado com origens específicas
- [ ] `NODE_ENV=production` definido
- [ ] Banco de dados com credenciais fortes
- [ ] HTTPS habilitado (via reverse proxy)
- [ ] Firewall configurado
- [ ] Logs monitorados
- [ ] Backups automáticos do banco

### Reverse Proxy (Nginx)

```nginx
server {
    listen 80;
    server_name api.seudominio.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 📊 Monitoramento

### Health Check

O endpoint `/health` retorna:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600,
  "environment": "production",
  "version": "1.0.0"
}
```

### Logs

Os logs são estruturados em JSON em produção:
```json
{
  "level": "info",
  "message": "Request received",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "data": {
    "method": "GET",
    "path": "/api/health"
  }
}
```

## 🔄 Atualizações

### Processo de Atualização

1. Fazer backup do banco de dados
2. Pull do código atualizado
3. Instalar dependências: `npm ci`
4. Executar migrações: `npm run prisma:migrate:deploy`
5. Build: `npm run build`
6. Reiniciar serviço

### Com PM2

```bash
pm2 restart playground-backend
```

### Com Docker

```bash
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d --build
```

## 🐛 Troubleshooting

### Erro: "Missing required environment variables"

Execute `npm run check-env` para verificar variáveis faltantes.

### Erro: "JWT_SECRET não configurado"

Configure `JWT_SECRET` no arquivo `.env`.

### Erro de conexão com banco

Verifique:
- `DATABASE_URL` está correto
- Banco está acessível
- Credenciais estão corretas

### Container não inicia

Verifique logs:
```bash
docker logs playground-backend
```

### Porta já em uso

Altere `PORT` no `.env` ou pare o processo que está usando a porta.

## 📝 Checklist de Deploy

- [ ] Variáveis de ambiente configuradas
- [ ] `npm run check-env` passou sem erros
- [ ] Banco de dados configurado e acessível
- [ ] Migrações executadas
- [ ] Build executado com sucesso
- [ ] Health check respondendo
- [ ] CORS configurado corretamente
- [ ] Logs sendo gerados
- [ ] Backup do banco configurado
- [ ] Monitoramento configurado

## 🆘 Suporte

Para mais informações, consulte:
- [README.md](./README.md) - Documentação geral
- [DOCKER.md](./DOCKER.md) - Guia de Docker
- [QUICKSTART.md](./QUICKSTART.md) - Início rápido

