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
      tempoInicialMin,
      tempoAdicionalMin,
      quantidade,
      brinquedoId,
      clienteId,
      valorCalculado,
    } = req.body

    if (!nomeCrianca || !nomeResponsavel || !whatsappResponsavel || valorCalculado === undefined) {
      throw new AppError(400, 'Campos obrigatórios não fornecidos')
    }

    const hasTempoInicialOuAdicional = tempoInicialMin != null || tempoAdicionalMin != null
    const tempoTotal = hasTempoInicialOuAdicional
      ? (tempoInicialMin ?? 0) + (tempoAdicionalMin ?? 0)
      : tempoSolicitadoMin

    const lancamento = await prisma.lancamento.create({
      data: {
        dataHora: dataHora ? new Date(dataHora) : new Date(),
        nomeCrianca,
        nomeResponsavel,
        tipoParente,
        whatsappResponsavel,
        numeroPulseira,
        tempoSolicitadoMin: tempoTotal,
        tempoInicialMin: tempoInicialMin ?? undefined,
        tempoAdicionalMin: tempoAdicionalMin ?? undefined,
        quantidade,
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
      tempoInicialMin,
      tempoAdicionalMin,
      quantidade,
      brinquedoId,
      clienteId,
      valorCalculado,
      valorDesconto,
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
    if (tempoInicialMin !== undefined) updateData.tempoInicialMin = tempoInicialMin
    if (tempoAdicionalMin !== undefined) updateData.tempoAdicionalMin = tempoAdicionalMin
    if (quantidade !== undefined) updateData.quantidade = quantidade
    if (brinquedoId !== undefined) updateData.brinquedoId = brinquedoId
    if (clienteId !== undefined) updateData.clienteId = clienteId
    if (valorCalculado !== undefined) updateData.valorCalculado = valorCalculado
    if (valorDesconto !== undefined) updateData.valorDesconto = valorDesconto
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

  async pagar(req: Request, res: Response): Promise<void> {
    const { id } = req.params
    const { formaPagamentoId, valorCalculado, valorDesconto, valorRecebido, codigoCortesia, pagamentos } = req.body as {
      formaPagamentoId?: string
      valorCalculado?: number
      valorDesconto?: number
      valorRecebido?: number
      codigoCortesia?: string
      pagamentos?: Array<{ formaPagamentoId: string; valor: number }>
    }

    const lancamento = await prisma.lancamento.findUnique({
      where: { id },
    })

    if (!lancamento) {
      throw new AppError(404, 'Lançamento não encontrado')
    }

    if (lancamento.status !== 'aberto') {
      throw new AppError(400, 'Apenas lançamentos abertos podem ser pagos')
    }

    // Quando informado, usa múltiplas formas (split payment)
    if (Array.isArray(pagamentos) && pagamentos.length > 0) {
      const limpos = pagamentos
        .filter(p => p && typeof p.formaPagamentoId === 'string' && typeof p.valor === 'number')
        .map(p => ({ formaPagamentoId: p.formaPagamentoId, valor: Number(p.valor) }))
        .filter(p => p.formaPagamentoId && isFinite(p.valor) && p.valor >= 0)

      if (limpos.length === 0) {
        throw new AppError(400, 'Informe ao menos uma forma de pagamento válida')
      }

      const soma = limpos.reduce((s, p) => s + p.valor, 0)
      const esperado = typeof valorCalculado === 'number' ? valorCalculado : lancamento.valorCalculado
      if (Math.abs(soma - esperado) > 0.01) {
        throw new AppError(400, `A soma das formas de pagamento (R$ ${soma.toFixed(2)}) deve ser igual ao valor do pagamento (R$ ${esperado.toFixed(2)})`)
      }

      const formas = await prisma.formaPagamento.findMany({
        where: { id: { in: limpos.map(p => p.formaPagamentoId) } },
        select: { id: true, descricao: true },
      })
      const map = new Map(formas.map(f => [f.id, f.descricao]))
      if (formas.length !== new Set(limpos.map(p => p.formaPagamentoId)).size) {
        throw new AppError(400, 'Uma ou mais formas de pagamento não foram encontradas')
      }

      const pagamentosJson = JSON.stringify(
        limpos.map(p => ({ formaPagamentoId: p.formaPagamentoId, descricao: map.get(p.formaPagamentoId) || p.formaPagamentoId, valor: p.valor }))
      )

      const updateData: { status: string; formaPagamentoId?: string; pagamentosJson?: string; valorCalculado?: number; valorDesconto?: number; valorRecebido?: number } = {
        status: 'pago',
        pagamentosJson,
      }
      if (typeof valorCalculado === 'number') updateData.valorCalculado = valorCalculado
      if (typeof valorDesconto === 'number') updateData.valorDesconto = valorDesconto
      if (typeof valorRecebido === 'number') updateData.valorRecebido = valorRecebido

      const lancamentoAtualizado = await prisma.lancamento.update({
        where: { id },
        data: updateData,
        include: {
          brinquedo: true,
          cliente: true,
          formaPagamento: true,
        },
      })

      res.json(lancamentoAtualizado)
      return
    }

    if (!formaPagamentoId) {
      throw new AppError(400, 'Informe a forma de pagamento')
    }

    const formaPag = await prisma.formaPagamento.findUnique({
      where: { id: formaPagamentoId },
    })
    const isCortesia = formaPag?.descricao?.toLowerCase().includes('cortesia')

    if (isCortesia) {
      const codigo = String(codigoCortesia || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '')
      if (codigo.length !== 8) {
        throw new AppError(400, 'Informe o código de cortesia de 8 dígitos')
      }
      const cortesia = await prisma.cortesia.findUnique({ where: { codigo } })
      if (!cortesia) {
        throw new AppError(400, 'Código de cortesia não encontrado')
      }
      if (cortesia.usado) {
        throw new AppError(400, 'Este código de cortesia já foi utilizado')
      }
      await prisma.cortesia.update({
        where: { id: cortesia.id },
        data: { usado: true, lancamentoId: id },
      })
    }

    const updateData: { status: string; formaPagamentoId: string; valorCalculado?: number; valorDesconto?: number } = {
      status: 'pago',
      formaPagamentoId,
    }
    if (valorCalculado !== undefined) updateData.valorCalculado = valorCalculado
    if (valorDesconto !== undefined) updateData.valorDesconto = valorDesconto

    const lancamentoAtualizado = await prisma.lancamento.update({
      where: { id },
      data: updateData,
      include: {
        brinquedo: true,
        cliente: true,
        formaPagamento: true,
      },
    })

    res.json(lancamentoAtualizado)
    return
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
        valorCalculado: 0,
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

