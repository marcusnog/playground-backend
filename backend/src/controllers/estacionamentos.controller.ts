import { Request, Response } from 'express'
import { Prisma } from '@prisma/client'
import { prisma } from '../lib/prisma'
import { AppError } from '../middleware/errorHandler'

export const estacionamentosController = {
  // Estacionamentos
  async list(_req: Request, res: Response) {
    const estacionamentos = await prisma.estacionamento.findMany({
      include: {
        caixa: true,
      },
      orderBy: { nome: 'asc' },
    })
    res.json(estacionamentos)
  },

  async getById(req: Request, res: Response) {
    const { id } = req.params
    const estacionamento = await prisma.estacionamento.findUnique({
      where: { id },
      include: {
        caixa: true,
      },
    })
    if (!estacionamento) {
      throw new AppError(404, 'Estacionamento não encontrado')
    }
    res.json(estacionamento)
  },

  async create(req: Request, res: Response) {
    const { nome, caixaId, valor } = req.body

    if (!nome || !caixaId || valor === undefined) {
      throw new AppError(400, 'Nome, caixa e valor são obrigatórios')
    }

    const estacionamento = await prisma.estacionamento.create({
      data: {
        nome,
        caixaId,
        valor,
      },
      include: {
        caixa: true,
      },
    })

    res.status(201).json(estacionamento)
  },

  async update(req: Request, res: Response) {
    const { id } = req.params
    const { nome, caixaId, valor } = req.body

    const estacionamento = await prisma.estacionamento.update({
      where: { id },
      data: {
        nome,
        caixaId,
        valor,
      },
      include: {
        caixa: true,
      },
    })

    res.json(estacionamento)
  },

  async delete(req: Request, res: Response) {
    const { id } = req.params
    await prisma.estacionamento.delete({
      where: { id },
    })
    res.status(204).send()
  },

  // Lançamentos
  async getLancamentos(req: Request, res: Response) {
    const { status, data, estacionamentoId } = req.query
    const where: Prisma.LancamentoEstacionamentoWhereInput = {}
    if (status) where.status = status as string
    if (estacionamentoId) where.estacionamentoId = Array.isArray(estacionamentoId) ? estacionamentoId[0] as string : estacionamentoId as string
    if (data) {
      const startDate = new Date(data as string)
      startDate.setHours(0, 0, 0, 0)
      const endDate = new Date(data as string)
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

  async getLancamentosAbertos(_req: Request, res: Response) {
    const lancamentos = await prisma.lancamentoEstacionamento.findMany({
      where: { status: 'aberto' },
      include: {
        estacionamento: true,
      },
      orderBy: { dataHora: 'desc' },
    })
    res.json(lancamentos)
  },

  async getLancamentoById(req: Request, res: Response) {
    const { id } = req.params
    const lancamento = await prisma.lancamentoEstacionamento.findUnique({
      where: { id },
      include: {
        estacionamento: true,
        formaPagamento: true,
      },
    })
    if (!lancamento) {
      throw new AppError(404, 'Lançamento não encontrado')
    }
    res.json(lancamento)
  },

  async createLancamento(req: Request, res: Response) {
    const { estacionamentoId, placa, modelo, telefoneContato, dataHora, valor } = req.body

    if (!estacionamentoId || !placa || valor === undefined) {
      throw new AppError(400, 'Estacionamento, placa e valor são obrigatórios')
    }

    const estacionamento = await prisma.estacionamento.findUnique({
      where: { id: estacionamentoId },
    })

    if (!estacionamento) {
      throw new AppError(404, 'Estacionamento não encontrado')
    }

    const lancamento = await prisma.lancamentoEstacionamento.create({
      data: {
        estacionamentoId,
        placa,
        modelo,
        telefoneContato,
        dataHora: dataHora ? new Date(dataHora) : new Date(),
        valor: valor || estacionamento.valor,
        status: 'aberto',
      },
      include: {
        estacionamento: true,
      },
    })

    res.status(201).json(lancamento)
  },

  async pagarLancamento(req: Request, res: Response) {
    const { id } = req.params
    const { formaPagamentoId } = req.body

    const lancamento = await prisma.lancamentoEstacionamento.findUnique({
      where: { id },
    })

    if (!lancamento) {
      throw new AppError(404, 'Lançamento não encontrado')
    }

    if (lancamento.status !== 'aberto') {
      throw new AppError(400, 'Apenas lançamentos abertos podem ser pagos')
    }

    const lancamentoAtualizado = await prisma.lancamentoEstacionamento.update({
      where: { id },
      data: {
        status: 'pago',
        formaPagamentoId,
      },
      include: {
        estacionamento: true,
        formaPagamento: true,
      },
    })

    res.json(lancamentoAtualizado)
  },

  async cancelarLancamento(req: Request, res: Response) {
    const { id } = req.params

    const lancamento = await prisma.lancamentoEstacionamento.findUnique({
      where: { id },
    })

    if (!lancamento) {
      throw new AppError(404, 'Lançamento não encontrado')
    }

    if (lancamento.status !== 'aberto') {
      throw new AppError(400, 'Apenas lançamentos abertos podem ser cancelados')
    }

    const lancamentoAtualizado = await prisma.lancamentoEstacionamento.update({
      where: { id },
      data: {
        status: 'cancelado',
      },
      include: {
        estacionamento: true,
        formaPagamento: true,
      },
    })

    res.json(lancamentoAtualizado)
  },

  // Caixa
  async getCaixaAbertura(_req: Request, res: Response) {
    // Retorna informações sobre abertura de caixa de estacionamento
    // Por enquanto, retorna os estacionamentos disponíveis
    const estacionamentos = await prisma.estacionamento.findMany({
      include: {
        caixa: true,
      },
    })
    res.json({ estacionamentos })
  },

  async abrirCaixa(_req: Request, res: Response) {
    // Abertura de caixa de estacionamento usa o mesmo sistema de caixas
    // Esta rota pode ser usada para lógica específica de estacionamento
    res.json({ message: 'Use a rota de abertura de caixa geral' })
  },

  async fecharCaixa(_req: Request, res: Response) {
    // Fechamento de caixa de estacionamento
    // Esta rota pode ser usada para lógica específica de estacionamento
    res.json({ message: 'Use a rota de fechamento de caixa geral' })
  },
}

