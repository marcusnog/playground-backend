#!/bin/bash

# Script para iniciar o backend com Docker

set -e

# Detectar se usa docker-compose ou docker compose
if command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE="docker-compose"
elif docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
else
    echo "❌ Erro: docker-compose ou docker compose não encontrado"
    exit 1
fi

echo "🐳 Iniciando backend com Docker..."
echo "📦 Usando: $DOCKER_COMPOSE"

# Verificar se .env existe
if [ ! -f .env ]; then
  echo "📝 Criando arquivo .env a partir do exemplo..."
  cp env.example .env
  echo "⚠️  Por favor, edite o arquivo .env e defina JWT_SECRET antes de continuar"
  echo "   Você pode gerar uma chave segura com: openssl rand -base64 32"
  read -p "Pressione Enter para continuar ou Ctrl+C para cancelar..."
fi

# Criar diretório data se não existir
mkdir -p data

# Build e start
echo "🔨 Construindo e iniciando containers..."
$DOCKER_COMPOSE up -d --build

# Aguardar o container estar pronto
echo "⏳ Aguardando container estar pronto..."
sleep 8

# Verificar se o container está rodando
if ! $DOCKER_COMPOSE ps | grep -q "playground-backend.*Up"; then
  echo "❌ Erro: Container não está rodando. Verifique os logs:"
  $DOCKER_COMPOSE logs backend
  exit 1
fi

# Verificar se precisa executar seed
if [ ! -f data/dev.db ]; then
  echo "🌱 Banco de dados não encontrado. Executando seed..."
  $DOCKER_COMPOSE exec -T backend npm run prisma:seed || echo "⚠️  Seed pode ter falhado, mas continuando..."
  echo "✅ Seed executado!"
  echo ""
  echo "🔑 Credenciais padrão:"
  echo "   Apelido: admin"
  echo "   Senha: admin"
  echo ""
else
  echo "✅ Banco de dados já existe. Pulando seed."
fi

echo ""
echo "✅ Backend está rodando!"
echo "📍 API: http://localhost:3001"
echo "📊 Health: http://localhost:3001/health"
echo ""
echo "📝 Comandos úteis:"
echo "   Ver logs: $DOCKER_COMPOSE logs -f backend"
echo "   Parar: $DOCKER_COMPOSE down"
echo "   Prisma Studio: $DOCKER_COMPOSE exec backend npm run prisma:studio"
echo "   Shell: $DOCKER_COMPOSE exec backend sh"

