# 🐳 Docker Compose - Guia de Uso

## 🚀 Início Rápido

### 1. Primeira Configuração

```bash
# Copiar arquivo de ambiente
cp env.example .env

# Editar .env e definir JWT_SECRET (opcional para dev)
# Para gerar uma chave: openssl rand -base64 32
```

### 2. Iniciar o Backend

**Opção mais simples:**
```bash
./docker-start.sh
```

**Ou manualmente:**
```bash
docker compose up -d --build
```

**Ou com Make:**
```bash
make up-build
```

### 3. Executar Seed (Primeira Vez)

```bash
docker compose exec backend npm run prisma:seed
```

## 📋 Comandos Principais

### Iniciar/Parar

```bash
# Iniciar em background
docker compose up -d

# Iniciar com rebuild
docker compose up -d --build

# Parar
docker compose down

# Parar e remover volumes
docker compose down -v
```

### Logs e Status

```bash
# Ver logs em tempo real
docker compose logs -f backend

# Ver status dos containers
docker compose ps

# Verificar health
curl http://localhost:3001/health
```

### Executar Comandos

```bash
# Abrir shell no container
docker compose exec backend sh

# Executar seed
docker compose exec backend npm run prisma:seed

# Executar migrações
docker compose exec backend npm run prisma:migrate

# Abrir Prisma Studio
docker compose exec backend npm run prisma:studio
```

## 🔧 Configuração

### Variáveis de Ambiente

O docker-compose.yml usa variáveis do arquivo `.env` ou valores padrão:

- `JWT_SECRET` - Chave secreta para JWT (padrão: valor de desenvolvimento)
- `PORT` - Porta do servidor (padrão: 3001)
- `DATABASE_URL` - URL do banco (padrão: `file:./data/dev.db`)

### Volumes

- `./src` → Código fonte (hot reload)
- `./prisma` → Schema Prisma
- `./data` → Banco de dados SQLite (persistente)
- `/app/node_modules` → Node modules (não montado do host)

## 🐛 Troubleshooting

### Container não inicia

```bash
# Ver logs detalhados
docker compose logs backend

# Verificar se porta está em uso
lsof -i :3001
```

### Erro de permissões

```bash
# Dar permissões ao diretório data
docker compose exec backend chmod -R 777 data
```

### Rebuild completo

```bash
docker compose down -v
docker compose build --no-cache
docker compose up -d
```

### Banco de dados corrompido

```bash
# Remover banco e recriar
docker compose down -v
rm -rf data
docker compose up -d
docker compose exec backend npm run prisma:seed
```

## 🔄 Migrações Automáticas

O container executa migrações automaticamente ao iniciar:
1. Tenta executar `prisma migrate deploy` (produção)
2. Se falhar, executa `prisma migrate dev` (desenvolvimento)

## 📊 Health Check

O container inclui health check que verifica se a API está respondendo:

```bash
# Ver status do health check
docker compose ps
```

## 🚢 Produção

Para produção, use o arquivo `docker-compose.prod.yml`:

```bash
docker compose -f docker-compose.prod.yml up -d
```

## 📝 Notas

- O banco de dados é persistido no diretório `./data`
- O código fonte é montado como volume para hot reload em desenvolvimento
- As migrações são executadas automaticamente na inicialização
- O seed precisa ser executado manualmente na primeira vez

