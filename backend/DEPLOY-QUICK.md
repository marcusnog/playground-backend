# 🚀 Deploy Rápido

## Pré-requisitos

- Node.js 20+
- Docker (opcional, mas recomendado)
- Arquivo `.env` configurado

## Opção 1: Deploy com Docker (Recomendado)

```bash
# 1. Configure o arquivo .env
cp env.example .env
# Edite o .env com suas configurações

# 2. Build e iniciar
docker-compose -f docker-compose.prod.yml up -d --build

# 3. Verificar logs
docker-compose -f docker-compose.prod.yml logs -f
```

## Opção 2: Deploy Manual

```bash
# 1. Configure o arquivo .env
cp env.example .env
# Edite o .env com suas configurações

# 2. Execute o script de deploy
npm run deploy

# 3. Inicie o servidor
npm start
# ou com PM2:
npm run pm2:start
```

## Opção 3: Deploy com PM2

```bash
# 1. Configure o arquivo .env
cp env.example .env
# Edite o .env com suas configurações

# 2. Execute o script de deploy
npm run deploy

# 3. Inicie com PM2
npm run pm2:start

# 4. Salvar configuração do PM2
pm2 save
pm2 startup
```

## Verificação

Após o deploy, verifique se está funcionando:

```bash
# Health check
curl http://localhost:3001/health

# Ou no navegador
open http://localhost:3001/health
```

## Variáveis de Ambiente Obrigatórias

- `JWT_SECRET` - Chave secreta (mínimo 32 caracteres)
- `DATABASE_URL` - URL do banco de dados

## Variáveis Recomendadas para Produção

- `NODE_ENV=production`
- `CORS_ORIGIN` - Origens permitidas (separadas por vírgula)

## Comandos Úteis

```bash
# Ver logs (Docker)
docker-compose -f docker-compose.prod.yml logs -f

# Ver logs (PM2)
npm run pm2:logs

# Reiniciar (Docker)
docker-compose -f docker-compose.prod.yml restart

# Reiniciar (PM2)
npm run pm2:restart

# Parar (Docker)
docker-compose -f docker-compose.prod.yml down

# Parar (PM2)
npm run pm2:stop
```

## Troubleshooting

### Erro: "Missing required environment variables"
```bash
npm run check-env
```

### Erro: "JWT_SECRET não configurado"
Configure `JWT_SECRET` no arquivo `.env` com pelo menos 32 caracteres.

### Erro de conexão com banco
Verifique se `DATABASE_URL` está correto e se o banco está acessível.

### Container não inicia
```bash
docker logs playground-backend-prod
```

