#!/bin/bash

# Script de inicialização para produção
set -e

echo "🚀 Iniciando servidor em modo produção..."

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
  echo "❌ Erro: Execute este script a partir do diretório backend/"
  exit 1
fi

# Verificar se o build existe
if [ ! -d "dist" ] || [ ! -f "dist/server.js" ]; then
  echo "❌ Erro: Build não encontrado. Execute 'npm run deploy' primeiro."
  exit 1
fi

# Verificar variáveis de ambiente
if [ ! -f ".env" ]; then
  echo "❌ Erro: Arquivo .env não encontrado."
  exit 1
fi

# Verificar conexão com banco
echo "🔍 Verificando conexão com banco de dados..."
npm run check-env || {
  echo "❌ Erro: Verificação de ambiente falhou."
  exit 1
}

# Executar migrações antes de iniciar
echo "🗄️  Verificando migrações..."
npm run prisma:migrate:deploy || {
  echo "⚠️  Aviso: Migrações falharam. Continuando mesmo assim..."
}

# Iniciar servidor
echo "✅ Iniciando servidor..."
exec node dist/server.js

