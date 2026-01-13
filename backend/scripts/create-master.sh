?#!/bin/bash

# Script para criar usuário master no banco de dados
# Uso: ./scripts/create-master.sh [apelido] [senha] [nome-completo]

set -e

APELIDO="${1:-master}"
SENHA="${2:-master123}"
NOME_COMPLETO="${3:-Usuário Master}"

echo "🔐 Criando usuário master..."

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
  echo "❌ Erro: Execute este script a partir do diretório backend/"
  exit 1
fi

# Verificar se .env existe
if [ ! -f ".env" ]; then
  echo "❌ Erro: Arquivo .env não encontrado."
  exit 1
fi

# Criar script Node.js temporário
cat > /tmp/create-master-user.js << EOF
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('${SENHA}', 10)
  
  const usuario = await prisma.usuario.upsert({
    where: { apelido: '${APELIDO}' },
    update: {
      senha: hashedPassword,
      nomeCompleto: '${NOME_COMPLETO}',
      acompanhamento: true,
      lancamento: true,
      caixaAbertura: true,
      caixaFechamento: true,
      caixaSangria: true,
      caixaSuprimento: true,
      estacionamentoCadastro: true,
      estacionamentoCaixaAbertura: true,
      estacionamentoCaixaFechamento: true,
      estacionamentoLancamento: true,
      estacionamentoAcompanhamento: true,
      relatorios: true,
      parametrosEmpresa: true,
      parametrosFormasPagamento: true,
      parametrosBrinquedos: true,
      clientes: true,
    },
    create: {
      nomeCompleto: '${NOME_COMPLETO}',
      apelido: '${APELIDO}',
      contato: '${APELIDO}@playground.com',
      senha: hashedPassword,
      acompanhamento: true,
      lancamento: true,
      caixaAbertura: true,
      caixaFechamento: true,
      caixaSangria: true,
      caixaSuprimento: true,
      estacionamentoCadastro: true,
      estacionamentoCaixaAbertura: true,
      estacionamentoCaixaFechamento: true,
      estacionamentoLancamento: true,
      estacionamentoAcompanhamento: true,
      relatorios: true,
      parametrosEmpresa: true,
      parametrosFormasPagamento: true,
      parametrosBrinquedos: true,
      clientes: true,
    },
  })

  console.log('✅ Usuário master criado com sucesso!')
  console.log(\`   Apelido: \${usuario.apelido}\`)
  console.log(\`   Nome: \${usuario.nomeCompleto}\`)
  console.log(\`   Senha: ${SENHA}\`)
  console.log('⚠️  IMPORTANTE: Altere a senha após o primeiro login!')
}

main()
  .catch((e) => {
    console.error('❌ Erro:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.\$disconnect()
  })
EOF

# Executar o script
node /tmp/create-master-user.js

# Limpar arquivo temporário
rm /tmp/create-master-user.js

echo ""
echo "✅ Usuário master criado!"
echo ""
echo "Credenciais:"
echo "  Apelido: $APELIDO"
echo "  Senha: $SENHA"
echo ""
echo "⚠️  IMPORTANTE: Altere a senha após o primeiro login!"

