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

function resolveLegacyCaixaData(data: string, fallback: Date) {
  const normalized = data.length === 10 ? `${data}T00:00:00` : data
  const parsed = new Date(normalized)
  return Number.isNaN(parsed.getTime()) ? fallback : parsed
}

async function ensureLegacyCaixaAbertura(
  db: DbClient,
  input: {
    caixaId: string
    fallbackUserId?: string
  }
) {
  if (!input.fallbackUserId) return null

  const aberturaExistente = await db.caixaAbertura.findFirst({
    where: { caixaId: input.caixaId, status: 'aberto' },
    orderBy: { dataAbertura: 'desc' },
  })

  if (aberturaExistente) return aberturaExistente

  const caixa = await db.caixa.findUnique({
    where: { id: input.caixaId },
  })

  if (!caixa || caixa.status !== 'aberto') return null

  return db.caixaAbertura.create({
    data: {
      caixaId: caixa.id,
      usuarioAberturaId: input.fallbackUserId,
      dataAbertura: resolveLegacyCaixaData(caixa.data, caixa.createdAt),
      valorInicial: caixa.valorInicial,
      status: 'aberto',
    },
  })
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
    fallbackUserId?: string
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
      throw new AppError(404, 'Abertura de caixa nÃ£o encontrada')
    }

    if (requireOpen && abertura.status !== 'aberto') {
      throw new AppError(400, 'A abertura de caixa informada jÃ¡ estÃ¡ fechada')
    }

    return abertura
  }

  const caixaId = input.caixaId ?? input.userCaixaId
  if (caixaId) {
    let abertura = await db.caixaAbertura.findFirst({
      where: {
        caixaId,
        ...(requireOpen ? { status: 'aberto' } : {}),
      },
      orderBy: { dataAbertura: 'desc' },
    })

    if (!abertura && requireOpen) {
      abertura = await ensureLegacyCaixaAbertura(db, {
        caixaId,
        fallbackUserId: input.fallbackUserId,
      })
    }

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
      throw new AppError(400, 'HÃ¡ mais de um caixa aberto. Informe o caixa ou a abertura explicitamente.')
    }

    if (requireOpen) {
      const caixasAbertos = await db.caixa.findMany({
        where: { status: 'aberto' },
        orderBy: { updatedAt: 'desc' },
        take: 2,
      })

      if (caixasAbertos.length === 1) {
        const aberturaLegacy = await ensureLegacyCaixaAbertura(db, {
          caixaId: caixasAbertos[0].id,
          fallbackUserId: input.fallbackUserId,
        })

        if (aberturaLegacy) return aberturaLegacy
      }

      if (caixasAbertos.length > 1) {
        throw new AppError(400, 'HÃ¡ mais de um caixa aberto. Informe o caixa ou a abertura explicitamente.')
      }
    }
  }

  throw new AppError(400, 'NÃ£o foi possÃ­vel resolver a abertura do caixa para esta operaÃ§Ã£o')
}

export function serializeCaixaSnapshot(caixa: CaixaSnapshot) {
  const ultimaAbertura = caixa.aberturas[0] ?? null
  const sessaoAtual = ultimaAbertura?.status === 'aberto' ? ultimaAbertura : null
  const movimentos = ultimaAbertura
    ? (() => {
        const inicioSessao = ultimaAbertura.dataAbertura.getTime()
        const fimSessao = ultimaAbertura.dataFechamento?.getTime() ?? Number.POSITIVE_INFINITY
        const movimentosLegacy = caixa.movimentos.filter((movimento) => {
          if (movimento.caixaAberturaId) return false
          const dataHora = new Date(movimento.dataHora).getTime()
          return dataHora >= inicioSessao && dataHora <= fimSessao
        })
        const ids = new Set(ultimaAbertura.movimentos.map((movimento) => movimento.id))

        return [...ultimaAbertura.movimentos, ...movimentosLegacy.filter((movimento) => !ids.has(movimento.id))]
          .sort((a, b) => new Date(b.dataHora).getTime() - new Date(a.dataHora).getTime())
      })()
    : caixa.movimentos
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
