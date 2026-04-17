import { Response } from 'express'
import { Prisma } from '@prisma/client'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { AppError } from '../middleware/errorHandler'
import { AuthRequest } from '../middleware/auth'
import { getSessionReference, resolveCaixaAbertura } from '../lib/caixaAbertura'

const normalizeString = (value: unknown) => {
  if (value == null) return ''
  return String(value).trim()
}

const requiredWhatsappSchema = z.preprocess(
  normalizeString,
  z.string()
)

const lancamentoCreateSchema = z.object({
  nomeCrianca: z.string().min(1, 'Nome da crianca e obrigatorio').max(150).trim(),
  nomeResponsavel: z.preprocess(normalizeString, z.string().max(150)),
  tipoParente: z.string().max(50).trim().optional().nullable(),
  whatsappResponsavel: requiredWhatsappSchema,
  numeroPulseira: z.string().max(20).optional().nullable(),
  criancasAdicionaisJson: z.string().optional().nullable(),
  tempoSolicitadoMin: z.number().int().min(0).max(600).optional().nullable(),
  tempoInicialMin: z.number().int().min(0).max(600).optional().nullable(),
  tempoAdicionalMin: z.number().int().min(0).max(600).optional().nullable(),
  quantidade: z.number().int().min(1).max(100).optional(),
  brinquedoId: z.string().uuid().optional(),
  clienteId: z.string().uuid().optional(),
  valorCalculado: z.number().min(0, 'Valor invalido').max(99999.99),
  dataHora: z.string().optional(),
})

async function resolveSessionForLancamento(
  req: AuthRequest,
  payload: Record<string, unknown>,
  existingCaixaAberturaId?: string | null
) {
  const refs = getSessionReference(payload)

  try {
    const abertura = await resolveCaixaAbertura(prisma, {
      aberturaId: refs.aberturaId,
      caixaId: refs.caixaId,
      userCaixaId: req.user?.caixaId,
      fallbackUserId: req.user?.id,
      requireOpen: true,
      fallbackToSingleOpen: !refs.aberturaId && !refs.caixaId,
    })
    return abertura.id
  } catch (error) {
    if (existingCaixaAberturaId) return existingCaixaAberturaId
    throw error
  }
}

export const lancamentosController = {
  async list(req: AuthRequest, res: Response) {
    const { status, data, caixaAberturaId } = req.query
    const where: Prisma.LancamentoWhereInput = {}
    if (status) where.status = Array.isArray(status) ? status[0] as string : status as string
    if (caixaAberturaId) {
      where.caixaAberturaId = Array.isArray(caixaAberturaId) ? caixaAberturaId[0] as string : caixaAberturaId as string
    }
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

  async getAbertos(_req: AuthRequest, res: Response) {
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

  async getById(req: AuthRequest, res: Response) {
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
      throw new AppError(404, 'Lancamento nao encontrado')
    }
    res.json(lancamento)
  },

  async create(req: AuthRequest, res: Response) {
    const parsed = lancamentoCreateSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new AppError(400, parsed.error.issues.map((i) => i.message).join(', '))
    }
    const {
      dataHora,
      nomeCrianca,
      nomeResponsavel,
      tipoParente,
      whatsappResponsavel,
      numeroPulseira,
      criancasAdicionaisJson,
      tempoSolicitadoMin,
      tempoInicialMin,
      tempoAdicionalMin,
      quantidade,
      brinquedoId,
      clienteId,
      valorCalculado,
    } = parsed.data

    const hasTempoInicialOuAdicional = tempoInicialMin != null || tempoAdicionalMin != null
    const tempoTotal = hasTempoInicialOuAdicional
      ? ((tempoInicialMin ?? 0) + (tempoAdicionalMin ?? 0))
      : tempoSolicitadoMin

    const caixaAberturaId = await resolveSessionForLancamento(req, req.body as Record<string, unknown>)

    const lancamento = await prisma.lancamento.create({
      data: {
        dataHora: dataHora ? new Date(dataHora) : new Date(),
        nomeCrianca,
        nomeResponsavel,
        tipoParente: tipoParente ?? null,
        whatsappResponsavel,
        numeroPulseira: numeroPulseira ?? null,
        criancasAdicionaisJson: criancasAdicionaisJson ?? null,
        tempoSolicitadoMin: tempoTotal ?? null,
        tempoInicialMin: tempoInicialMin ?? undefined,
        tempoAdicionalMin: tempoAdicionalMin ?? undefined,
        quantidade: quantidade ?? undefined,
        brinquedoId: brinquedoId ?? undefined,
        clienteId: clienteId ?? undefined,
        status: 'aberto',
        valorCalculado,
        caixaAberturaId,
      },
      include: {
        brinquedo: true,
        cliente: true,
      },
    })

    res.status(201).json(lancamento)
  },

  async update(req: AuthRequest, res: Response) {
    const { id } = req.params
    const {
      nomeCrianca,
      nomeResponsavel,
      tipoParente,
      whatsappResponsavel,
      numeroPulseira,
      criancasAdicionaisJson,
      tempoSolicitadoMin,
      tempoInicialMin,
      tempoAdicionalMin,
      quantidade,
      brinquedoId,
      clienteId,
      valorCalculado,
      valorDesconto,
      dataHora,
      caixaAberturaId,
    } = req.body as Record<string, unknown>

    const updateData: Record<string, unknown> = {}
    if (nomeCrianca !== undefined) updateData.nomeCrianca = nomeCrianca
    if (nomeResponsavel !== undefined) updateData.nomeResponsavel = nomeResponsavel
    if (tipoParente !== undefined) updateData.tipoParente = tipoParente
    if (whatsappResponsavel !== undefined) updateData.whatsappResponsavel = whatsappResponsavel
    if (numeroPulseira !== undefined) updateData.numeroPulseira = numeroPulseira
    if (criancasAdicionaisJson !== undefined) updateData.criancasAdicionaisJson = criancasAdicionaisJson
    if (tempoSolicitadoMin !== undefined) updateData.tempoSolicitadoMin = tempoSolicitadoMin
    if (tempoInicialMin !== undefined) updateData.tempoInicialMin = tempoInicialMin
    if (tempoAdicionalMin !== undefined) updateData.tempoAdicionalMin = tempoAdicionalMin
    if (quantidade !== undefined) updateData.quantidade = quantidade
    if (brinquedoId !== undefined) updateData.brinquedoId = brinquedoId
    if (clienteId !== undefined) updateData.clienteId = clienteId
    if (valorCalculado !== undefined) updateData.valorCalculado = valorCalculado
    if (valorDesconto !== undefined) updateData.valorDesconto = valorDesconto
    if (dataHora !== undefined) updateData.dataHora = new Date(String(dataHora))
    if (typeof caixaAberturaId === 'string') updateData.caixaAberturaId = caixaAberturaId

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

  async pagar(req: AuthRequest, res: Response): Promise<void> {
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
      throw new AppError(404, 'Lancamento nao encontrado')
    }

    if (lancamento.status !== 'aberto') {
      throw new AppError(400, 'Apenas lancamentos abertos podem ser pagos')
    }

    const resolvedCaixaAberturaId = await resolveSessionForLancamento(
      req,
      req.body as Record<string, unknown>,
      lancamento.caixaAberturaId
    )

    if (Array.isArray(pagamentos) && pagamentos.length > 0) {
      const limpos = pagamentos
        .filter((p) => p && typeof p.formaPagamentoId === 'string' && typeof p.valor === 'number')
        .map((p) => ({ formaPagamentoId: p.formaPagamentoId, valor: Number(p.valor) }))
        .filter((p) => p.formaPagamentoId && Number.isFinite(p.valor) && p.valor >= 0)

      if (limpos.length === 0) {
        throw new AppError(400, 'Informe ao menos uma forma de pagamento valida')
      }

      const soma = limpos.reduce((acc, item) => acc + item.valor, 0)
      const esperado = typeof valorCalculado === 'number' ? valorCalculado : lancamento.valorCalculado
      if (Math.abs(soma - esperado) > 0.01) {
        throw new AppError(400, `A soma das formas de pagamento (R$ ${soma.toFixed(2)}) deve ser igual ao valor do pagamento (R$ ${esperado.toFixed(2)})`)
      }

      const formas = await prisma.formaPagamento.findMany({
        where: { id: { in: limpos.map((p) => p.formaPagamentoId) } },
        select: { id: true, descricao: true },
      })
      const map = new Map(formas.map((f) => [f.id, f.descricao]))
      if (formas.length !== new Set(limpos.map((p) => p.formaPagamentoId)).size) {
        throw new AppError(400, 'Uma ou mais formas de pagamento nao foram encontradas')
      }

      const pagamentosJson = JSON.stringify(
        limpos.map((p) => ({ formaPagamentoId: p.formaPagamentoId, descricao: map.get(p.formaPagamentoId) || p.formaPagamentoId, valor: p.valor }))
      )

      const updateData: {
        status: string
        formaPagamentoId?: string
        pagamentosJson?: string
        valorCalculado?: number
        valorDesconto?: number
        valorRecebido?: number
        caixaAberturaId: string
      } = {
        status: 'pago',
        pagamentosJson,
        caixaAberturaId: resolvedCaixaAberturaId,
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
        throw new AppError(400, 'Informe o codigo de cortesia de 8 digitos')
      }
      const cortesia = await prisma.cortesia.findUnique({ where: { codigo } })
      if (!cortesia) {
        throw new AppError(400, 'Codigo de cortesia nao encontrado')
      }
      if (cortesia.usado) {
        throw new AppError(400, 'Este codigo de cortesia ja foi utilizado')
      }
      await prisma.cortesia.update({
        where: { id: cortesia.id },
        data: { usado: true, lancamentoId: id },
      })
    }

    const updateData: { status: string; formaPagamentoId: string; valorCalculado?: number; valorDesconto?: number; caixaAberturaId: string } = {
      status: 'pago',
      formaPagamentoId,
      caixaAberturaId: resolvedCaixaAberturaId,
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
  },

  async pagarMultiplos(req: AuthRequest, res: Response): Promise<void> {
    const { ids, pagamentos, valorTotal } = req.body as {
      ids?: unknown
      pagamentos?: unknown
      valorTotal?: unknown
    }

    if (!Array.isArray(ids) || ids.length < 2) {
      throw new AppError(400, 'Informe ao menos 2 IDs de lancamentos')
    }
    if (!Array.isArray(pagamentos) || pagamentos.length === 0) {
      throw new AppError(400, 'Informe ao menos uma forma de pagamento')
    }
    if (typeof valorTotal !== 'number' || valorTotal < 0) {
      throw new AppError(400, 'Valor total invalido')
    }

    const linhas = (pagamentos as Array<{ formaPagamentoId: unknown; valor: unknown }>)
      .filter((p) => typeof p.formaPagamentoId === 'string' && typeof p.valor === 'number')
      .map((p) => ({ formaPagamentoId: String(p.formaPagamentoId), valor: Number(p.valor) }))
      .filter((p) => p.formaPagamentoId && Number.isFinite(p.valor) && p.valor >= 0)

    if (linhas.length === 0) {
      throw new AppError(400, 'Nenhuma forma de pagamento valida informada')
    }

    const soma = linhas.reduce((acc, l) => acc + l.valor, 0)
    if (Math.abs(soma - valorTotal) > 0.01) {
      throw new AppError(400, `A soma dos pagamentos (R$ ${soma.toFixed(2)}) nao confere com o valor total (R$ ${valorTotal.toFixed(2)})`)
    }

    const formaIds = [...new Set(linhas.map((l) => l.formaPagamentoId))]
    const formasDb = await prisma.formaPagamento.findMany({
      where: { id: { in: formaIds } },
      select: { id: true, descricao: true },
    })
    if (formasDb.length !== formaIds.length) {
      throw new AppError(400, 'Uma ou mais formas de pagamento nao foram encontradas')
    }
    const formaMap = new Map(formasDb.map((f) => [f.id, f.descricao]))
    const lancamentos = await prisma.lancamento.findMany({
      where: { id: { in: ids as string[] } },
    })

    if (lancamentos.length !== ids.length) {
      throw new AppError(404, 'Um ou mais lancamentos nao foram encontrados')
    }

    const naoAbertos = lancamentos.filter((l) => l.status !== 'aberto')
    if (naoAbertos.length > 0) {
      throw new AppError(400, `Os seguintes lancamentos nao estao abertos: ${naoAbertos.map((l) => l.id).join(', ')}`)
    }

    const resolvedCaixaAberturaId = await resolveSessionForLancamento(
      req,
      req.body as Record<string, unknown>,
      lancamentos[0].caixaAberturaId
    )

    const updated = await prisma.$transaction(
      lancamentos.map((lancamento) => {
        // Distribui o pagamento proporcionalmente pelo valorCalculado de cada lancamento
        const proporcao = valorTotal > 0 ? lancamento.valorCalculado / valorTotal : 1 / lancamentos.length
        const pagamentosJsonProporcional = JSON.stringify(
          linhas.map((p) => ({
            formaPagamentoId: p.formaPagamentoId,
            descricao: formaMap.get(p.formaPagamentoId) ?? p.formaPagamentoId,
            valor: Math.round(p.valor * proporcao * 100) / 100,
          }))
        )
        return prisma.lancamento.update({
          where: { id: lancamento.id },
          data: {
            status: 'pago',
            pagamentosJson: pagamentosJsonProporcional,
            valorCalculado: lancamento.valorCalculado,
            caixaAberturaId: resolvedCaixaAberturaId,
          },
          include: { brinquedo: true, cliente: true, formaPagamento: true },
        })
      })
    )

    res.json({ lancamentos: updated, total: updated.length })
  },

  async cancelar(req: AuthRequest, res: Response) {
    const { id } = req.params

    const lancamento = await prisma.lancamento.findUnique({
      where: { id },
    })

    if (!lancamento) {
      throw new AppError(404, 'Lancamento nao encontrado')
    }

    if (lancamento.status !== 'aberto') {
      throw new AppError(400, 'Apenas lancamentos abertos podem ser cancelados')
    }

    const caixaAberturaId = await resolveSessionForLancamento(
      req,
      req.body as Record<string, unknown>,
      lancamento.caixaAberturaId
    )

    const lancamentoAtualizado = await prisma.lancamento.update({
      where: { id },
      data: {
        status: 'cancelado',
        valorCalculado: 0,
        caixaAberturaId,
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
