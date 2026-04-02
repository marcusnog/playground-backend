import { Response } from 'express'
import { Prisma } from '@prisma/client'
import { prisma } from '../lib/prisma'
import { AppError } from '../middleware/errorHandler'
import { AuthRequest } from '../middleware/auth'
import {
  getCaixaSnapshotInclude,
  getSessionReference,
  resolveCaixaAbertura,
  serializeCaixaSnapshot,
} from '../lib/caixaAbertura'

async function resolveSessionForEstacionamento(
  req: AuthRequest,
  payload: Record<string, unknown>,
  estacionamentoId?: string | null,
  existingCaixaAberturaId?: string | null
) {
  const refs = getSessionReference(payload)
  let resolvedCaixaId = refs.caixaId

  if (!resolvedCaixaId && estacionamentoId) {
    const estacionamento = await prisma.estacionamento.findUnique({
      where: { id: estacionamentoId },
      select: { caixaId: true },
    })

    if (!estacionamento) {
      throw new AppError(404, 'Estacionamento nao encontrado')
    }

    resolvedCaixaId = estacionamento.caixaId
  }

  try {
    const abertura = await resolveCaixaAbertura(prisma, {
      aberturaId: refs.aberturaId,
      caixaId: resolvedCaixaId,
      userCaixaId: req.user?.caixaId,
      requireOpen: true,
      fallbackToSingleOpen: !refs.aberturaId && !resolvedCaixaId,
    })

    return abertura.id
  } catch (error) {
    if (existingCaixaAberturaId) return existingCaixaAberturaId
    throw error
  }
}

function getAuthenticatedUserId(req: AuthRequest) {
  if (!req.user?.id) {
    throw new AppError(401, 'Usuario nao autenticado')
  }

  return req.user.id
}

export const estacionamentosController = {
  async list(_req: AuthRequest, res: Response) {
    const estacionamentos = await prisma.estacionamento.findMany({
      include: {
        caixa: {
          include: getCaixaSnapshotInclude(),
        },
      },
      orderBy: { nome: 'asc' },
    })

    res.json(
      estacionamentos.map((estacionamento) => ({
        ...estacionamento,
        caixa: serializeCaixaSnapshot(estacionamento.caixa),
      }))
    )
  },

  async getById(req: AuthRequest, res: Response) {
    const { id } = req.params
    const estacionamento = await prisma.estacionamento.findUnique({
      where: { id },
      include: {
        caixa: {
          include: getCaixaSnapshotInclude(),
        },
      },
    })

    if (!estacionamento) {
      throw new AppError(404, 'Estacionamento nao encontrado')
    }

    res.json({
      ...estacionamento,
      caixa: serializeCaixaSnapshot(estacionamento.caixa),
    })
  },

  async create(req: AuthRequest, res: Response) {
    const { nome, caixaId, valor } = req.body as {
      nome?: string
      caixaId?: string
      valor?: number
    }

    if (!nome || !caixaId || typeof valor !== 'number' || Number.isNaN(valor)) {
      throw new AppError(400, 'Nome, caixa e valor sao obrigatorios')
    }

    const estacionamento = await prisma.estacionamento.create({
      data: {
        nome: nome.trim(),
        caixaId,
        valor,
      },
      include: {
        caixa: {
          include: getCaixaSnapshotInclude(),
        },
      },
    })

    res.status(201).json({
      ...estacionamento,
      caixa: serializeCaixaSnapshot(estacionamento.caixa),
    })
  },

  async update(req: AuthRequest, res: Response) {
    const { id } = req.params
    const { nome, caixaId, valor } = req.body as {
      nome?: string
      caixaId?: string
      valor?: number
    }

    const updateData: Prisma.EstacionamentoUpdateInput = {}
    if (typeof nome === 'string') updateData.nome = nome.trim()
    if (typeof valor === 'number' && !Number.isNaN(valor)) updateData.valor = valor
    if (typeof caixaId === 'string' && caixaId.trim()) {
      updateData.caixa = { connect: { id: caixaId } }
    }

    const estacionamento = await prisma.estacionamento.update({
      where: { id },
      data: updateData,
      include: {
        caixa: {
          include: getCaixaSnapshotInclude(),
        },
      },
    })

    res.json({
      ...estacionamento,
      caixa: serializeCaixaSnapshot(estacionamento.caixa),
    })
  },

  async delete(req: AuthRequest, res: Response) {
    const { id } = req.params

    const vinculos = await prisma.lancamentoEstacionamento.count({
      where: { estacionamentoId: id },
    })

    if (vinculos > 0) {
      throw new AppError(400, 'Nao e possivel excluir um estacionamento com lancamentos associados')
    }

    await prisma.estacionamento.delete({
      where: { id },
    })

    res.status(204).send()
  },

  async getLancamentos(req: AuthRequest, res: Response) {
    const { status, data, estacionamentoId, caixaAberturaId } = req.query
    const where: Prisma.LancamentoEstacionamentoWhereInput = {}

    if (status) where.status = Array.isArray(status) ? status[0] : status
    if (estacionamentoId) {
      where.estacionamentoId = Array.isArray(estacionamentoId) ? estacionamentoId[0] : estacionamentoId
    }
    if (caixaAberturaId) {
      where.caixaAberturaId = Array.isArray(caixaAberturaId) ? caixaAberturaId[0] : caixaAberturaId
    }
    if (data) {
      const dataValue = Array.isArray(data) ? String(data[0]) : String(data)
      const startDate = new Date(dataValue)
      startDate.setHours(0, 0, 0, 0)
      const endDate = new Date(dataValue)
      endDate.setHours(23, 59, 59, 999)
      where.dataHora = {
        gte: startDate,
        lte: endDate,
      }
    }

    const lancamentos = await prisma.lancamentoEstacionamento.findMany({
      where,
      include: {
        estacionamento: true,
        formaPagamento: true,
      },
      orderBy: { dataHora: 'desc' },
    })

    res.json(lancamentos)
  },

  async getLancamentosAbertos(_req: AuthRequest, res: Response) {
    const lancamentos = await prisma.lancamentoEstacionamento.findMany({
      where: { status: 'aberto' },
      include: {
        estacionamento: true,
      },
      orderBy: { dataHora: 'desc' },
    })

    res.json(lancamentos)
  },

  async getLancamentoById(req: AuthRequest, res: Response) {
    const { id } = req.params
    const lancamento = await prisma.lancamentoEstacionamento.findUnique({
      where: { id },
      include: {
        estacionamento: true,
        formaPagamento: true,
      },
    })

    if (!lancamento) {
      throw new AppError(404, 'Lancamento nao encontrado')
    }

    res.json(lancamento)
  },

  async createLancamento(req: AuthRequest, res: Response) {
    const { estacionamentoId, placa, modelo, telefoneContato, dataHora, valor } = req.body as {
      estacionamentoId?: string
      placa?: string
      modelo?: string
      telefoneContato?: string
      dataHora?: string
      valor?: number
    }

    if (!estacionamentoId || !placa || typeof valor !== 'number' || Number.isNaN(valor)) {
      throw new AppError(400, 'Estacionamento, placa e valor sao obrigatorios')
    }

    const caixaAberturaId = await resolveSessionForEstacionamento(
      req,
      req.body as Record<string, unknown>,
      estacionamentoId
    )

    const lancamento = await prisma.lancamentoEstacionamento.create({
      data: {
        estacionamentoId,
        placa: placa.trim().toUpperCase(),
        modelo: modelo?.trim() || null,
        telefoneContato: telefoneContato?.trim() || null,
        dataHora: dataHora ? new Date(dataHora) : new Date(),
        valor,
        status: 'aberto',
        caixaAberturaId,
      },
      include: {
        estacionamento: true,
      },
    })

    res.status(201).json(lancamento)
  },

  async pagarLancamento(req: AuthRequest, res: Response) {
    const { id } = req.params
    const { formaPagamentoId } = req.body as { formaPagamentoId?: string }

    if (!formaPagamentoId) {
      throw new AppError(400, 'Informe a forma de pagamento')
    }

    const lancamento = await prisma.lancamentoEstacionamento.findUnique({
      where: { id },
      include: {
        estacionamento: {
          select: { caixaId: true },
        },
      },
    })

    if (!lancamento) {
      throw new AppError(404, 'Lancamento nao encontrado')
    }

    if (lancamento.status !== 'aberto') {
      throw new AppError(400, 'Apenas lancamentos abertos podem ser pagos')
    }

    const caixaAberturaId = await resolveSessionForEstacionamento(
      req,
      req.body as Record<string, unknown>,
      lancamento.estacionamentoId,
      lancamento.caixaAberturaId
    )

    const lancamentoAtualizado = await prisma.lancamentoEstacionamento.update({
      where: { id },
      data: {
        formaPagamentoId,
        status: 'pago',
        caixaAberturaId,
      },
      include: {
        estacionamento: true,
        formaPagamento: true,
      },
    })

    res.json(lancamentoAtualizado)
  },

  async cancelarLancamento(req: AuthRequest, res: Response) {
    const { id } = req.params

    const lancamento = await prisma.lancamentoEstacionamento.findUnique({
      where: { id },
    })

    if (!lancamento) {
      throw new AppError(404, 'Lancamento nao encontrado')
    }

    if (lancamento.status !== 'aberto') {
      throw new AppError(400, 'Apenas lancamentos abertos podem ser cancelados')
    }

    const caixaAberturaId = await resolveSessionForEstacionamento(
      req,
      req.body as Record<string, unknown>,
      lancamento.estacionamentoId,
      lancamento.caixaAberturaId
    )

    const lancamentoAtualizado = await prisma.lancamentoEstacionamento.update({
      where: { id },
      data: {
        status: 'cancelado',
        caixaAberturaId,
      },
      include: {
        estacionamento: true,
        formaPagamento: true,
      },
    })

    res.json(lancamentoAtualizado)
  },

  async getCaixaAbertura(req: AuthRequest, res: Response) {
    const estacionamentoId = typeof req.query.estacionamentoId === 'string' ? req.query.estacionamentoId : undefined

    let caixaId = typeof req.query.caixaId === 'string' ? req.query.caixaId : undefined
    if (!caixaId && estacionamentoId) {
      const estacionamento = await prisma.estacionamento.findUnique({
        where: { id: estacionamentoId },
        select: { caixaId: true, nome: true },
      })

      if (!estacionamento) {
        throw new AppError(404, 'Estacionamento nao encontrado')
      }

      caixaId = estacionamento.caixaId
    }

    const abertura = await resolveCaixaAbertura(prisma, {
      caixaId,
      userCaixaId: req.user?.caixaId,
      requireOpen: true,
      fallbackToSingleOpen: !caixaId,
    })

    const caixa = await prisma.caixa.findUnique({
      where: { id: abertura.caixaId },
      include: getCaixaSnapshotInclude(),
    })

    if (!caixa) {
      throw new AppError(404, 'Caixa nao encontrado')
    }

    res.json({
      ...serializeCaixaSnapshot(caixa),
      aberturaId: abertura.id,
      sessaoAtualId: abertura.id,
    })
  },

  async abrirCaixa(req: AuthRequest, res: Response) {
    const userId = getAuthenticatedUserId(req)
    const { estacionamentoId, valorInicial } = req.body as {
      estacionamentoId?: string
      valorInicial?: number
    }

    if (!estacionamentoId) {
      throw new AppError(400, 'Informe o estacionamento')
    }

    const dataHoraServidor = new Date()

    const resultado = await prisma.$transaction(async (tx) => {
      const estacionamento = await tx.estacionamento.findUnique({
        where: { id: estacionamentoId },
      })

      if (!estacionamento) {
        throw new AppError(404, 'Estacionamento nao encontrado')
      }

      const caixa = await tx.caixa.findUnique({
        where: { id: estacionamento.caixaId },
      })

      if (!caixa) {
        throw new AppError(404, 'Caixa nao encontrado')
      }

      if (caixa.bloqueado) {
        throw new AppError(400, 'Este caixa esta bloqueado e nao pode ser aberto')
      }

      const aberturaExistente = await tx.caixaAbertura.findFirst({
        where: { caixaId: caixa.id, status: 'aberto' },
      })

      if (aberturaExistente) {
        throw new AppError(400, 'Ja existe uma abertura ativa para este caixa')
      }

      const abertura = await tx.caixaAbertura.create({
        data: {
          caixaId: caixa.id,
          usuarioAberturaId: userId,
          dataAbertura: dataHoraServidor,
          valorInicial: typeof valorInicial === 'number' ? valorInicial : caixa.valorInicial,
          status: 'aberto',
        },
      })

      await tx.caixa.update({
        where: { id: caixa.id },
        data: {
          status: 'aberto',
          data: dataHoraServidor.toISOString(),
          valorInicial: abertura.valorInicial,
        },
      })

      const caixaAtualizado = await tx.caixa.findUnique({
        where: { id: caixa.id },
        include: getCaixaSnapshotInclude(),
      })

      if (!caixaAtualizado) {
        throw new AppError(404, 'Caixa nao encontrado apos abertura')
      }

      return { estacionamento, abertura, caixaAtualizado }
    })

    res.status(200).json({
      estacionamentoId: resultado.estacionamento.id,
      estacionamentoNome: resultado.estacionamento.nome,
      ...serializeCaixaSnapshot(resultado.caixaAtualizado),
      aberturaId: resultado.abertura.id,
      sessaoAtualId: resultado.abertura.id,
      dataAbertura: resultado.abertura.dataAbertura,
    })
  },

  async fecharCaixa(req: AuthRequest, res: Response) {
    const userId = getAuthenticatedUserId(req)
    const { estacionamentoId } = req.body as { estacionamentoId?: string }
    const refs = getSessionReference(req.body as Record<string, unknown>)

    const resultado = await prisma.$transaction(async (tx) => {
      let caixaId = refs.caixaId

      if (!caixaId && estacionamentoId) {
        const estacionamento = await tx.estacionamento.findUnique({
          where: { id: estacionamentoId },
          select: { caixaId: true, nome: true },
        })

        if (!estacionamento) {
          throw new AppError(404, 'Estacionamento nao encontrado')
        }

        caixaId = estacionamento.caixaId
      }

      const abertura = await resolveCaixaAbertura(tx, {
        aberturaId: refs.aberturaId,
        caixaId,
        userCaixaId: req.user?.caixaId,
        requireOpen: true,
        fallbackToSingleOpen: !refs.aberturaId && !caixaId,
      })

      const dataFechamento = new Date()

      await tx.caixaAbertura.update({
        where: { id: abertura.id },
        data: {
          status: 'fechado',
          dataFechamento,
          usuarioFechamentoId: userId,
        },
      })

      await tx.caixa.update({
        where: { id: abertura.caixaId },
        data: { status: 'fechado' },
      })

      const caixaAtualizado = await tx.caixa.findUnique({
        where: { id: abertura.caixaId },
        include: getCaixaSnapshotInclude(),
      })

      if (!caixaAtualizado) {
        throw new AppError(404, 'Caixa nao encontrado apos fechamento')
      }

      return { abertura, caixaAtualizado, dataFechamento }
    })

    res.json({
      ...serializeCaixaSnapshot(resultado.caixaAtualizado),
      aberturaId: resultado.abertura.id,
      sessaoAtualId: null,
      dataFechamento: resultado.dataFechamento,
    })
  },
}
