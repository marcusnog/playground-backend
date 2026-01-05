# 🚀 Quick Start - Docker Compose

Guia rápido para iniciar o backend com Docker Compose.

## ⚡ Início Rápido

### 1. Configure o ambiente (primeira vez)

```bash
cd backend
cp env.example .env
```

Edite o `.env` e defina `JWT_SECRET` (ou use o padrão para desenvolvimento).

### 2. Inicie com Docker Compose

**Opção A: Script automatizado**
```bash
./docker-start.sh
```

**Opção B: Comando direto**
```bash
docker compose up -d --build
```

**Opção C: Com docker-compose (versão antiga)**
```bash
docker-compose up -d --build
```

### 3. Execute o seed (primeira vez)

```bash
docker compose exec backend npm run prisma:seed
```

## ✅ Verificar se está funcionando

```bash
# Verificar status
docker compose ps

# Ver logs
docker compose logs -f backend

# Testar API
curl http://localhost:3001/health
```

## 📋 Comandos Úteis

```bash
# Iniciar
docker compose up -d

# Parar
docker compose down

# Ver logs
docker compose logs -f backend

# Rebuild
docker compose up -d --build

# Executar comandos no container
docker compose exec backend npm run prisma:studio
docker compose exec backend sh

# Limpar tudo (remove volumes)
docker compose down -v
```

## 🔧 Troubleshooting

### Container não inicia

```bash
# Ver logs detalhados
docker compose logs backend

# Verificar se a porta está livre
lsof -i :3001
```

### Erro de permissões no banco

```bash
docker compose exec backend chmod -R 777 data
```

### Rebuild completo

```bash
docker compose down -v
docker compose build --no-cache
docker compose up -d
```

## 🔑 Credenciais Padrão

Após executar o seed:
- **Apelido:** `admin`
- **Senha:** `admin`

## 📚 Mais Informações

- [DOCKER.md](./DOCKER.md) - Documentação completa
- [README.md](./README.md) - Documentação geral
- [SETUP.md](./SETUP.md) - Setup sem Docker

