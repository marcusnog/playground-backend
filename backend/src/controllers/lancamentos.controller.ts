import { Request, Response } from 'express'
import { Prisma } from '@prisma/client'
import { prisma } from '../lib/prisma'
import { AppError } from '../middleware/errorHandler'

export const lancamentosController = {
  async list(req: Request, res: Response) {
    const { status, data } = req.query
    const where: Prisma.LancamentoWhereInput = {}
    if (status) where.status = Array.isArray(status) ? status[0] as string : status as string
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

    const lancamentos = await prisma.lancamento.findMany({
      where,
      include: {
        brinquedo: true,
        cliente: true,
        formaPagamento: true,
      },
      orderBy: { dataHora: 'desc' },
    })
    res.json(lancamentos)
  },

  async getAbertos(_req: Request, res: Response) {
    const lancamentos = await prisma.lancamento.findMany({
      where: { status: 'aberto' },
      include: {
        brinquedo: true,
        cliente: true,
      },
      orderBy: { dataHora: 'desc' },
    })
    res.json(lancamentos)
  },

  async getById(req: Request, res: Response) {
    const { id } = req.params
    const lancamento = await prisma.lancamento.findUnique({
      where: { id },
      include: {
        brinquedo: true,
        cliente: true,
        formaPagamento: true,
      },
    })
    if (!lancamento) {
      throw new AppError(404, 'Lançamento não encontrado')
    }
    res.json(lancamento)
  },

  async create(req: Request, res: Response) {
    const {
      dataHora,
      nomeCrianca,
      nomeResponsavel,
      tipoParente,
      whatsappResponsavel,
      numeroPulseira,
      tempoSolicitadoMin,
      brinquedoId,
      clienteId,
      valorCalculado,
    } = req.body

    if (!nomeCrianca || !nomeResponsavel || !whatsappResponsavel || valorCalculado === undefined) {
      throw new AppError(400, 'Campos obrigatórios não fornecidos')
    }

    const lancamento = await prisma.lancamento.create({
      data: {
        dataHora: dataHora ? new Date(dataHora) : new Date(),
        nomeCrianca,
        nomeResponsavel,
        tipoParente,
        whatsappResponsavel,
        numeroPulseira,
        tempoSolicitadoMin,
        brinquedoId,
        clienteId,
        status: 'aberto',
        valorCalculado,
      },
      include: {
        brinquedo: true,
        cliente: true,
      },
    })

    res.status(201).json(lancamento)
  },

  async update(req: Request, res: Response) {
    const { id } = req.params
    const {
      nomeCrianca,
      nomeResponsavel,
      tipoParente,
      whatsappResponsavel,
      numeroPulseira,
      tempoSolicitadoMin,
      brinquedoId,
      clienteId,
      valorCalculado,
      dataHora,
    } = req.body

    // Preparar dados para atualização
    const updateData: any = {}
    if (nomeCrianca !== undefined) updateData.nomeCrianca = nomeCrianca
    if (nomeResponsavel !== undefined) updateData.nomeResponsavel = nomeResponsavel
    if (tipoParente !== undefined) updateData.tipoParente = tipoParente
    if (whatsappResponsavel !== undefined) updateData.whatsappResponsavel = whatsappResponsavel
    if (numeroPulseira !== undefined) updateData.numeroPulseira = numeroPulseira
    if (tempoSolicitadoMin !== undefined) updateData.tempoSolicitadoMin = tempoSolicitadoMin
    if (brinquedoId !== undefined) updateData.brinquedoId = brinquedoId
    if (clienteId !== undefined) updateData.clienteId = clienteId
    if (valorCalculado !== undefined) updateData.valorCalculado = valorCalculado
    if (dataHora !== undefined) updateData.dataHora = new Date(dataHora)

    const lancamento = await prisma.lancamento.update({
      where: { id },
      data: updateData,
      include: {
        brinquedo: true,
        cliente: true,
        formaPagamento: true,
      },
    })

    res.json(lancamento)
  },

  async pagar(req: Request, res: Response) {
    const { id } = req.params
    const { formaPagamentoId } = req.body

    const lancamento = await prisma.lancamento.findUnique({
      where: { id },
    })

    if (!lancamento) {
      throw new AppError(404, 'Lançamento não encontrado')
    }

    if (lancamento.status !== 'aberto') {
      throw new AppError(400, 'Apenas lançamentos abertos podem ser pagos')
    }

    const lancamentoAtualizado = await prisma.lancamento.update({
      where: { id },
      data: {
        status: 'pago',
        formaPagamentoId,
      },
      include: {
        brinquedo: true,
        cliente: true,
        formaPagamento: true,
      },
    })

    res.json(lancamentoAtualizado)
  },

  async cancelar(req: Request, res: Response) {
    const { id } = req.params

    const lancamento = await prisma.lancamento.findUnique({
      where: { id },
    })

    if (!lancamento) {
      throw new AppError(404, 'Lançamento não encontrado')
    }

    if (lancamento.status !== 'aberto') {
      throw new AppError(400, 'Apenas lançamentos abertos podem ser cancelados')
    }

    const lancamentoAtualizado = await prisma.lancamento.update({
      where: { id },
      data: {
        status: 'cancelado',
      },
      include: {
        brinquedo: true,
        cliente: true,
        formaPagamento: true,
      },
    })

    res.json(lancamentoAtualizado)
  },
}

