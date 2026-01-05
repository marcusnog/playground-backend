#!/bin/bash

# Script para verificar variáveis de ambiente

echo "🔍 Verificando variáveis de ambiente..."

if [ ! -f ".env" ]; then
  echo "❌ Arquivo .env não encontrado!"
  exit 1
fi

source .env

ERRORS=0
WARNINGS=0

# Verificar variáveis obrigatórias
if [ -z "$JWT_SECRET" ]; then
  echo "❌ JWT_SECRET não está definido"
  ERRORS=$((ERRORS + 1))
elif [ "$JWT_SECRET" = "your-super-secret-jwt-key-change-in-production" ]; then
  echo "⚠️  JWT_SECRET está usando o valor padrão"
  WARNINGS=$((WARNINGS + 1))
elif [ ${#JWT_SECRET} -lt 32 ]; then
  echo "⚠️  JWT_SECRET deve ter pelo menos 32 caracteres (atual: ${#JWT_SECRET})"
  WARNINGS=$((WARNINGS + 1))
fi

if [ -z "$DATABASE_URL" ]; then
  echo "❌ DATABASE_URL não está definido"
  ERRORS=$((ERRORS + 1))
fi

# Verificar CORS em produção
if [ "$NODE_ENV" = "production" ]; then
  if [ -z "$CORS_ORIGIN" ]; then
    echo "⚠️  CORS_ORIGIN não está definido. CORS rejeitará todas as requisições."
    WARNINGS=$((WARNINGS + 1))
  fi
fi

# Resumo
echo ""
if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
  echo "✅ Todas as variáveis estão configuradas corretamente!"
  exit 0
elif [ $ERRORS -eq 0 ]; then
  echo "⚠️  $WARNINGS aviso(s) encontrado(s)"
  exit 0
else
  echo "❌ $ERRORS erro(s) encontrado(s)"
  exit 1
fi

