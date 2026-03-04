import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...')

  // Criar formas de pagamento padrão
  const formasPagamento = await Promise.all([
    prisma.formaPagamento.upsert({
      where: { id: 'dinheiro' },
      update: {},
      create: {
        id: 'dinheiro',
        descricao: 'Dinheiro',
        status: 'ativo',
      },
    }),
    prisma.formaPagamento.upsert({
      where: { id: 'pix' },
      update: {},
      create: {
        id: 'pix',
        descricao: 'PIX',
        status: 'ativo',
      },
    }),
    prisma.formaPagamento.upsert({
      where: { id: 'debito' },
      update: {},
      create: {
        id: 'debito',
        descricao: 'Débito',
        status: 'ativo',
      },
    }),
  ])

  console.log(`✅ Criadas ${formasPagamento.length} formas de pagamento`)

  // Criar parâmetros padrão
  const parametros = await prisma.parametros.upsert({
    where: { id: 'global' },
    update: {},
    create: {
      id: 'global',
      valorInicialMinutos: 30,
      valorInicialReais: 20,
      valorCicloMinutos: 15,
      valorCicloReais: 10,
      cicloToleranciaMinutos: 3,
      empresaNome: 'Parque Infantil',
      empresaCnpj: '00.000.000/0000-00',
      empresaLogoUrl: '',
      pixChave: '',
      pixCidade: 'Sua Cidade',
    },
  })

  console.log('✅ Parâmetros criados')

  // Criar usuário master (administrador com todas as permissões)
  const masterPassword = process.env.MASTER_PASSWORD || 'master123'
  const hashedMasterPassword = await bcrypt.hash(masterPassword, 10)
  const master = await prisma.usuario.upsert({
    where: { apelido: 'master' },
    update: {
      senha: hashedMasterPassword,
      // Garantir que master sempre tenha todas as permissões
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
      nomeCompleto: 'Usuário Master',
      apelido: 'master',
      contato: 'master@playground.com',
      senha: hashedMasterPassword,
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

  console.log(`✅ Usuário master criado/atualizado (apelido: master, senha: ${masterPassword})`)
  if (process.env.NODE_ENV === 'production') {
    console.log('📝 Usuário master disponível para testes em produção')
  } else {
    console.log('⚠️  IMPORTANTE: Altere a senha do master em produção!')
  }

  // Criar usuário admin (compatibilidade)
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin'
  const hashedAdminPassword = await bcrypt.hash(adminPassword, 10)
  const admin = await prisma.usuario.upsert({
    where: { apelido: 'admin' },
    update: {
      senha: hashedAdminPassword,
      // Garantir que admin sempre tenha todas as permissões
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
      nomeCompleto: 'Administrador',
      apelido: 'admin',
      contato: 'admin@playground.com',
      senha: hashedAdminPassword,
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

  console.log(`✅ Usuário admin criado (apelido: admin, senha: ${adminPassword})`)

  console.log('🎉 Seed concluído com sucesso!')
}

main()
  .catch((e) => {
    console.error('❌ Erro ao executar seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

