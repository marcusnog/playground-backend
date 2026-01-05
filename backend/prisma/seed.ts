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
      empresaNome: 'Parque Infantil',
      empresaCnpj: '00.000.000/0000-00',
      empresaLogoUrl: '',
      pixChave: '',
      pixCidade: 'Sua Cidade',
    },
  })

  console.log('✅ Parâmetros criados')

  // Criar usuário admin
  const hashedPassword = await bcrypt.hash('admin', 10)
  const admin = await prisma.usuario.upsert({
    where: { apelido: 'admin' },
    update: {
      senha: hashedPassword,
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
      id: 'admin',
      nomeCompleto: 'Administrador',
      apelido: 'admin',
      contato: 'admin@exemplo.com',
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

  console.log('✅ Usuário admin criado (apelido: admin, senha: admin)')

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

