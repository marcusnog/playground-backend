#!/bin/bash

# Script de deploy para produção
set -e

echo "🚀 Iniciando deploy do backend..."

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
  echo "❌ Erro: Execute este script a partir do diretório backend/"
  exit 1
fi

# Verificar variáveis de ambiente
if [ ! -f ".env" ]; then
  echo "⚠️  Arquivo .env não encontrado. Copiando de env.example..."
  cp env.example .env
  echo "⚠️  IMPORTANTE: Edite o arquivo .env e configure as variáveis antes de continuar!"
  exit 1
fi

# Verificar se JWT_SECRET está configurado
if grep -q "your-super-secret-jwt-key-change-in-production" .env; then
  echo "⚠️  AVISO: JWT_SECRET está usando o valor padrão. Configure uma chave segura!"
  if [ -z "$CI" ]; then
    read -p "Continuar mesmo assim? (s/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
      exit 1
    fi
  else
    echo "❌ Erro: JWT_SECRET não pode usar valor padrão em CI/CD"
    exit 1
  fi
fi

# Verificar Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
  echo "⚠️  AVISO: Node.js 20+ é recomendado. Versão atual: $(node -v)"
fi

# Verificar se npm está instalado
if ! command -v npm &> /dev/null; then
  echo "❌ Erro: npm não está instalado"
  exit 1
fi

# Instalar dependências
echo "📦 Instalando dependências..."
npm ci --prefer-offline --no-audit

# Gerar Prisma Client
echo "🔧 Gerando Prisma Client..."
npm run prisma:generate

# Verificar conexão com banco de dados
echo "🔍 Verificando conexão com banco de dados..."
if npm run check-env 2>&1 | grep -q "Missing required"; then
  echo "❌ Erro: Variáveis de ambiente obrigatórias não configuradas"
  exit 1
fi

# Executar migrações
echo "🗄️  Executando migrações..."
npm run prisma:migrate:deploy || {
  echo "⚠️  Aviso: Migrações falharam. Verifique a conexão com o banco de dados."
  exit 1
}

# Build do TypeScript
echo "🔨 Compilando TypeScript..."
npm run build

# Verificar se o build foi bem-sucedido
if [ ! -d "dist" ]; then
  echo "❌ Erro: Build falhou. Diretório dist não encontrado."
  exit 1
fi

if [ ! -f "dist/server.js" ]; then
  echo "❌ Erro: Build falhou. Arquivo dist/server.js não encontrado."
  exit 1
fi

# Criar diretório de logs se não existir
mkdir -p logs

echo "✅ Deploy preparado com sucesso!"
echo ""
echo "Para iniciar o servidor:"
echo "  npm start"
echo ""
echo "Ou usando PM2:"
echo "  pm2 start ecosystem.config.js"
echo ""
echo "Ou usando Docker:"
echo "  docker-compose -f docker-compose.prod.yml up -d"

