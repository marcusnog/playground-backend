import { Prisma, PrismaClient } from '@prisma/client'
import { AppError } from '../middleware/errorHandler'

type DbClient = PrismaClient | Prisma.TransactionClient

const caixaInclude = {
  movimentos: {
    orderBy: { dataHora: 'desc' as const },
  },
  brinquedos: {
    include: { brinquedo: true },
  },
  aberturas: {
    orderBy: { dataAbertura: 'desc' as const },
    take: 1,
    include: {
      movimentos: {
        orderBy: { dataHora: 'desc' as const },
      },
    },
  },
} satisfies Prisma.CaixaInclude

export type CaixaSnapshot = Prisma.CaixaGetPayload<{
  include: typeof caixaInclude
}>

export function getCaixaSnapshotInclude() {
  return caixaInclude
}

export function getSessionReference(data?: Record<string, unknown> | null, fallbackCaixaId?: string | null) {
  const aberturaIdRaw = data?.aberturaId ?? data?.caixaAberturaId
  const caixaIdRaw = data?.caixaId ?? data?.id ?? fallbackCaixaId ?? null

  const aberturaId = typeof aberturaIdRaw === 'string' && aberturaIdRaw.trim() ? aberturaIdRaw.trim() : undefined
  const caixaId = typeof caixaIdRaw === 'string' && caixaIdRaw.trim() ? caixaIdRaw.trim() : undefined

  return { aberturaId, caixaId }
}

export async function resolveCaixaAbertura(
  db: DbClient,
  input: {
    aberturaId?: string
    caixaId?: string
    userCaixaId?: string
    requireOpen?: boolean
    fallbackToSingleOpen?: boolean
  }
) {
  const requireOpen = input.requireOpen ?? true

  if (input.aberturaId) {
    const abertura = await db.caixaAbertura.findUnique({
      where: { id: input.aberturaId },
    })

    if (!abertura) {
      throw new AppError(404, 'Abertura de caixa não encontrada')
    }

    if (requireOpen && abertura.status !== 'aberto') {
      throw new AppError(400, 'A abertura de caixa informada já está fechada')
    }

    return abertura
  }

  const caixaId = input.caixaId ?? input.userCaixaId
  if (caixaId) {
    const abertura = await db.caixaAbertura.findFirst({
      where: {
        caixaId,
        ...(requireOpen ? { status: 'aberto' } : {}),
      },
      orderBy: { dataAbertura: 'desc' },
    })

    if (!abertura) {
      throw new AppError(400, requireOpen ? 'Nenhuma abertura ativa encontrada para este caixa' : 'Nenhuma abertura encontrada para este caixa')
    }

    if (requireOpen && abertura.status !== 'aberto') {
      throw new AppError(400, 'Nenhuma abertura ativa encontrada para este caixa')
    }

    return abertura
  }

  if (input.fallbackToSingleOpen) {
    const abertas = await db.caixaAbertura.findMany({
      where: { status: 'aberto' },
      orderBy: { dataAbertura: 'desc' },
      take: 2,
    })

    if (abertas.length === 1) return abertas[0]
    if (abertas.length > 1) {
      throw new AppError(400, 'Há mais de um caixa aberto. Informe o caixa ou a abertura explicitamente.')
    }
  }

  throw new AppError(400, 'Não foi possível resolver a abertura do caixa para esta operação')
}

export function serializeCaixaSnapshot(caixa: CaixaSnapshot) {
  const ultimaAbertura = caixa.aberturas[0] ?? null
  const sessaoAtual = ultimaAbertura?.status === 'aberto' ? ultimaAbertura : null
  const movimentos = ultimaAbertura?.movimentos ?? caixa.movimentos
  const data = ultimaAbertura ? ultimaAbertura.dataAbertura.toISOString() : caixa.data
  const valorInicial = ultimaAbertura ? ultimaAbertura.valorInicial : caixa.valorInicial
  const updatedAt = ultimaAbertura?.dataFechamento ?? ultimaAbertura?.updatedAt ?? caixa.updatedAt
  const status = ultimaAbertura?.status ?? caixa.status

  return {
    ...caixa,
    data,
    valorInicial,
    status,
    updatedAt,
    movimentos,
    sessaoAtualId: sessaoAtual?.id ?? null,
    aberturaId: ultimaAbertura?.id ?? null,
    ultimaAberturaId: ultimaAbertura?.id ?? null,
  }
}
