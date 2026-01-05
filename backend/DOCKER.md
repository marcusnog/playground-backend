# 🐳 Docker - Guia de Uso

Este guia explica como executar o backend usando Docker.

## 📋 Pré-requisitos

- Docker instalado
- Docker Compose instalado

## 🚀 Desenvolvimento

### Opção 1: Script Automatizado (Mais Fácil)

```bash
./docker-start.sh
```

Este script:
- Cria o arquivo `.env` se não existir
- Cria o diretório `data` para o banco
- Constrói e inicia os containers
- Executa o seed automaticamente na primeira vez

### Opção 2: Usando Make (Recomendado)

```bash
# Ver comandos disponíveis
make help

# Iniciar
make up

# Executar seed (primeira vez)
make seed

# Ver logs
make logs
```

### Opção 3: Docker Compose Manual

1. **Configure as variáveis de ambiente:**
```bash
cp env.example .env
# Edite o .env e defina JWT_SECRET
```

2. **Inicie o container:**
```bash
docker-compose up -d
```

3. **Execute o seed (primeira vez):**
```bash
docker-compose exec backend npm run prisma:seed
```

4. **Visualize os logs:**
```bash
docker-compose logs -f backend
```

5. **Pare o container:**
```bash
docker-compose down
```

### Comandos Úteis

**Usando Make (recomendado):**
```bash
make help          # Ver todos os comandos
make build         # Rebuild da imagem
make up            # Iniciar containers
make down          # Parar containers
make logs          # Ver logs
make shell         # Abrir shell no container
make seed          # Executar seed
make migrate       # Executar migrações
make studio        # Abrir Prisma Studio
make clean         # Limpar tudo
make restart       # Reiniciar containers
```

**Ou usando Docker Compose diretamente:**
```bash
# Rebuild da imagem
docker-compose build

# Executar comandos no container
docker-compose exec backend npm run prisma:studio
docker-compose exec backend npm run prisma:migrate

# Acessar shell no container
docker-compose exec backend sh

# Ver logs em tempo real
docker-compose logs -f backend

# Parar e remover volumes
docker-compose down -v
```

## 🏭 Produção

### Usando Docker Compose

1. **Configure as variáveis de ambiente:**
```bash
export JWT_SECRET="sua-chave-secreta-forte-aqui"
```

2. **Inicie o container:**
```bash
docker-compose -f docker-compose.prod.yml up -d
```

3. **Execute o seed (primeira vez):**
```bash
docker-compose -f docker-compose.prod.yml exec backend npm run prisma:seed
```

### Build Manual da Imagem

```bash
# Build da imagem
docker build -t playground-backend .

# Executar container
docker run -d \
  --name playground-backend \
  -p 3001:3001 \
  -v $(pwd)/data:/app/data \
  -e JWT_SECRET="sua-chave-secreta" \
  -e DATABASE_URL="file:./data/dev.db" \
  playground-backend
```

## 📁 Estrutura de Volumes

O Docker Compose monta os seguintes volumes:

- `./src:/app/src` - Código fonte (desenvolvimento)
- `./prisma:/app/prisma` - Schema Prisma
- `./data:/app/data` - Banco de dados SQLite (persistente)

## 🔧 Variáveis de Ambiente

As seguintes variáveis podem ser configuradas:

- `PORT` - Porta do servidor (padrão: 3001)
- `JWT_SECRET` - Chave secreta para JWT (obrigatório)
- `DATABASE_URL` - URL do banco de dados (padrão: `file:./data/dev.db`)
- `NODE_ENV` - Ambiente (development/production)

## 🗄️ Banco de Dados

O banco de dados SQLite é persistido no diretório `./data` do host. Isso significa que os dados são mantidos mesmo quando o container é removido.

### Backup do Banco

```bash
# Copiar o arquivo do banco
docker-compose exec backend cp data/dev.db data/dev.db.backup
```

### Restaurar Banco

```bash
# Copiar backup para o volume
docker cp backup.db $(docker-compose ps -q backend):/app/data/dev.db
```

## 🐛 Troubleshooting

### Container não inicia

Verifique os logs:
```bash
docker-compose logs backend
```

### Erro de permissões

Se houver problemas de permissão com o banco de dados:
```bash
docker-compose exec backend chmod -R 777 data
```

### Rebuild completo

```bash
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

### Limpar tudo

```bash
# Remove containers, volumes e imagens
docker-compose down -v --rmi all
```

## 🔍 Health Check

O container inclui um health check que verifica se a API está respondendo:

```bash
# Verificar status
docker-compose ps
```

## 📝 Prisma Studio no Docker

Para abrir o Prisma Studio:

```bash
docker-compose exec backend npm run prisma:studio
```

O Prisma Studio estará disponível em `http://localhost:5555` (se configurado corretamente).

## 🔄 Migrações

As migrações são executadas automaticamente ao iniciar o container. Para executar manualmente:

```bash
docker-compose exec backend npm run prisma:migrate
```

## 🚢 Deploy

Para produção, use `docker-compose.prod.yml`:

```bash
docker-compose -f docker-compose.prod.yml up -d
```

A imagem de produção é otimizada com multi-stage build e não inclui dependências de desenvolvimento.

