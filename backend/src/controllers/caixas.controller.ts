import { Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import { AppError } from '../middleware/errorHandler'
import { AuthRequest } from '../middleware/auth'
import {
  getCaixaSnapshotInclude,
  getSessionReference,
  resolveCaixaAbertura,
  serializeCaixaSnapshot,
} from '../lib/caixaAbertura'

function getAuthenticatedUserId(req: AuthRequest): string {
  if (!req.user?.id) {
    throw new AppError(401, 'UsuÃ¡rio nÃ£o autenticado')
  }
  return req.user.id
}

function resolveLegacyDataAbertura(data: string, fallback: Date) {
  const normalized = data.length === 10 ? `${data}T00:00:00` : data
  const parsed = new Date(normalized)
  return Number.isNaN(parsed.getTime()) ? fallback : parsed
}

export const caixasController = {
  async list(_req: Request, res: Response) {
    const caixas = await prisma.caixa.findMany({
      orderBy: { data: 'desc' },
      include: getCaixaSnapshotInclude(),
    })
    res.json(caixas.map((caixa) => serializeCaixaSnapshot(caixa)))
  },

  async getAberto(_req: Request, res: Response) {
    const abertura = await prisma.caixaAbertura.findFirst({
      where: { status: 'aberto' },
      orderBy: { dataAbertura: 'desc' },
      include: {
        caixa: {
          include: getCaixaSnapshotInclude(),
        },
      },
    })

    if (abertura) {
      res.json(serializeCaixaSnapshot(abertura.caixa))
      return
    }

    const caixaLegacy = await prisma.caixa.findFirst({
      where: { status: 'aberto' },
      orderBy: { updatedAt: 'desc' },
      include: getCaixaSnapshotInclude(),
    })

    res.json(caixaLegacy ? serializeCaixaSnapshot(caixaLegacy) : null)
  },

  async getById(req: Request, res: Response) {
    const { id } = req.params
    const caixa = await prisma.caixa.findUnique({
      where: { id },
      include: getCaixaSnapshotInclude(),
    })
    if (!caixa) {
      throw new AppError(404, 'Caixa nÃ£o encontrado')
    }
    res.json(serializeCaixaSnapshot(caixa))
  },

  async abrir(req: AuthRequest, res: Response) {
    const userId = getAuthenticatedUserId(req)
    const { nome, valorInicial } = req.body as { nome?: string; valorInicial?: number }
    const { caixaId } = getSessionReference(req.body as Record<string, unknown>)
    const dataHoraServidor = new Date()

    if (valorInicial !== undefined && (typeof valorInicial !== 'number' || valorInicial < 0)) {
      throw new AppError(400, 'O valor inicial nÃ£o pode ser negativo.')
    }

    const opened = await prisma.$transaction(async (tx) => {
      let caixa = null

      if (caixaId) {
        caixa = await tx.caixa.findUnique({
          where: { id: caixaId },
        })

        if (!caixa) {
          throw new AppError(404, 'Caixa nÃ£o encontrado')
        }

        if (caixa.bloqueado) {
          throw new AppError(400, 'Este caixa estÃ¡ bloqueado e nÃ£o pode ser aberto.')
        }

        if (caixa.status === 'aberto') {
          throw new AppError(400, 'JÃ¡ existe uma abertura ativa para este caixa')
        }

        const aberturaExistente = await tx.caixaAbertura.findFirst({
          where: { caixaId: caixa.id, status: 'aberto' },
        })

        if (aberturaExistente) {
          throw new AppError(400, 'JÃ¡ existe uma abertura ativa para este caixa')
        }
      } else {
        if (!nome || valorInicial === undefined) {
          throw new AppError(400, 'Nome e valor inicial sÃ£o obrigatÃ³rios')
        }

        caixa = await tx.caixa.create({
          data: {
            nome,
            data: dataHoraServidor.toISOString(),
            valorInicial,
            status: 'fechado',
          },
        })
      }

      const abertura = await tx.caixaAbertura.create({
        data: {
          caixaId: caixa.id,
          usuarioAberturaId: userId,
          dataAbertura: dataHoraServidor,
          valorInicial: valorInicial !== undefined ? valorInicial : caixa.valorInicial,
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
        throw new AppError(404, 'Caixa nÃ£o encontrado apÃ³s abertura')
      }

      return { caixaAtualizado, abertura, isNewCaixa: !caixaId }
    })

    const payload = {
      ...serializeCaixaSnapshot(opened.caixaAtualizado),
      aberturaId: opened.abertura.id,
      sessaoAtualId: opened.abertura.id,
      dataAbertura: opened.abertura.dataAbertura,
    }

    return res.status(opened.isNewCaixa ? 201 : 200).json(payload)
  },

  async fechar(req: AuthRequest, res: Response) {
    const userId = getAuthenticatedUserId(req)
    const refs = getSessionReference(req.body as Record<string, unknown>)

    const resultado = await prisma.$transaction(async (tx) => {
      const dataFechamento = new Date()
      let aberturaId: string | null = null
      let caixaIdParaFechar: string

      try {
        const abertura = await resolveCaixaAbertura(tx, {
          aberturaId: refs.aberturaId,
          caixaId: refs.caixaId,
          userCaixaId: req.user?.caixaId,
          fallbackUserId: req.user?.id,
          requireOpen: true,
          fallbackToSingleOpen: !refs.aberturaId && !refs.caixaId,
        })

        aberturaId = abertura.id
        caixaIdParaFechar = abertura.caixaId

        await tx.caixaAbertura.update({
          where: { id: abertura.id },
          data: {
            status: 'fechado',
            dataFechamento,
            usuarioFechamentoId: userId,
          },
        })
      } catch (error) {
        const isNoActiveSessionError =
          error instanceof AppError &&
          error.statusCode === 400 &&
          error.message === 'Nenhuma abertura ativa encontrada para este caixa'

        if (!isNoActiveSessionError || !refs.caixaId) {
          throw error
        }

        const caixaLegado = await tx.caixa.findUnique({
          where: { id: refs.caixaId },
        })

        if (!caixaLegado) {
          throw new AppError(404, 'Caixa nÃ£o encontrado')
        }

        caixaIdParaFechar = caixaLegado.id

        if (caixaLegado.status === 'aberto') {
          const aberturaLegada = await tx.caixaAbertura.create({
            data: {
              caixaId: caixaLegado.id,
              usuarioAberturaId: userId,
              usuarioFechamentoId: userId,
              dataAbertura: resolveLegacyDataAbertura(caixaLegado.data, caixaLegado.createdAt),
              dataFechamento,
              valorInicial: caixaLegado.valorInicial,
              status: 'fechado',
            },
          })

          aberturaId = aberturaLegada.id
        }
      }

      await tx.caixa.update({
        where: { id: caixaIdParaFechar },
        data: {
          status: 'fechado',
        },
      })

      const caixaAtualizado = await tx.caixa.findUnique({
        where: { id: caixaIdParaFechar },
        include: getCaixaSnapshotInclude(),
      })

      if (!caixaAtualizado) {
        throw new AppError(404, 'Caixa nÃ£o encontrado apÃ³s fechamento')
      }

      return { aberturaId, caixaAtualizado, dataFechamento }
    })

    res.json({
      ...serializeCaixaSnapshot(resultado.caixaAtualizado),
      aberturaId: resultado.aberturaId,
      sessaoAtualId: null,
      dataFechamento: resultado.dataFechamento,
    })
  },

  async sangria(req: AuthRequest, res: Response) {
    const { id } = req.params
    const { valor, motivo } = req.body as { valor?: number; motivo?: string }

    if (!valor || valor <= 0) {
      throw new AppError(400, 'Valor da sangria deve ser maior que zero')
    }

    const refs = getSessionReference(req.body as Record<string, unknown>, id)
    const abertura = await resolveCaixaAbertura(prisma, {
      aberturaId: refs.aberturaId,
      caixaId: refs.caixaId,
      userCaixaId: req.user?.caixaId,
      fallbackUserId: req.user?.id,
      requireOpen: true,
      fallbackToSingleOpen: !refs.aberturaId && !refs.caixaId,
    })

    const movimento = await prisma.movimentoCaixa.create({
      data: {
        caixaId: abertura.caixaId,
        caixaAberturaId: abertura.id,
        dataHora: new Date(),
        tipo: 'sangria',
        valor,
        motivo,
      },
    })

    res.status(201).json(movimento)
  },

  async suprimento(req: AuthRequest, res: Response) {
    const { id } = req.params
    const { valor, motivo } = req.body as { valor?: number; motivo?: string }

    if (!valor || valor <= 0) {
      throw new AppError(400, 'Valor do suprimento deve ser maior que zero')
    }

    const refs = getSessionReference(req.body as Record<string, unknown>, id)
    const abertura = await resolveCaixaAbertura(prisma, {
      aberturaId: refs.aberturaId,
      caixaId: refs.caixaId,
      userCaixaId: req.user?.caixaId,
      fallbackUserId: req.user?.id,
      requireOpen: true,
      fallbackToSingleOpen: !refs.aberturaId && !refs.caixaId,
    })

    const movimento = await prisma.movimentoCaixa.create({
      data: {
        caixaId: abertura.caixaId,
        caixaAberturaId: abertura.id,
        dataHora: new Date(),
        tipo: 'suprimento',
        valor,
        motivo,
      },
    })

    res.status(201).json(movimento)
  },

  async getMovimentos(req: AuthRequest, res: Response) {
    const { id } = req.params
    const refs = getSessionReference(req.query as Record<string, unknown>, id)

    const abertura = await resolveCaixaAbertura(prisma, {
      aberturaId: refs.aberturaId,
      caixaId: refs.caixaId,
      userCaixaId: req.user?.caixaId,
      fallbackUserId: req.user?.id,
      requireOpen: false,
      fallbackToSingleOpen: !refs.aberturaId && !refs.caixaId,
    })

    const movimentos = await prisma.movimentoCaixa.findMany({
      where: { caixaAberturaId: abertura.id },
      orderBy: { dataHora: 'desc' },
    })
    res.json(movimentos)
  },

  async create(req: Request, res: Response) {
    const { nome, data, bloqueado, brinquedoIds } = req.body as {
      nome?: string
      data?: string
      bloqueado?: boolean
      brinquedoIds?: string[]
    }

    if (!nome) {
      throw new AppError(400, 'Nome Ã© obrigatÃ³rio')
    }

    const caixa = await prisma.caixa.create({
      data: {
        nome,
        data: data || new Date().toISOString().split('T')[0],
        valorInicial: 0,
        status: 'fechado',
        bloqueado: !!bloqueado,
      },
    })

    const ids = Array.isArray(brinquedoIds) ? brinquedoIds.filter((item): item is string => typeof item === 'string') : []
    if (ids.length > 0) {
      await prisma.caixaBrinquedo.createMany({
        data: ids.map((brinquedoId) => ({ caixaId: caixa.id, brinquedoId })),
      })
    }

    const created = await prisma.caixa.findUnique({
      where: { id: caixa.id },
      include: getCaixaSnapshotInclude(),
    })

    res.status(201).json(created ? serializeCaixaSnapshot(created) : caixa)
  },

  async update(req: Request, res: Response) {
    const { id } = req.params
    const { nome, data, bloqueado, brinquedoIds } = req.body as {
      nome?: string
      data?: string
      bloqueado?: boolean
      brinquedoIds?: string[]
    }

    const caixa = await prisma.caixa.findUnique({
      where: { id },
      include: {
        aberturas: {
          where: { status: 'aberto' },
          take: 1,
        },
      },
    })

    if (!caixa) {
      throw new AppError(404, 'Caixa nÃ£o encontrado')
    }

    if (caixa.status === 'aberto' || caixa.aberturas.length > 0) {
      throw new AppError(400, 'NÃ£o Ã© possÃ­vel editar um caixa com abertura ativa')
    }

    const dataUpdate: { nome?: string; data?: string; bloqueado?: boolean } = {}
    if (nome !== undefined) dataUpdate.nome = nome
    if (data !== undefined) dataUpdate.data = data
    if (bloqueado !== undefined) dataUpdate.bloqueado = !!bloqueado

    await prisma.caixa.update({
      where: { id },
      data: dataUpdate,
    })

    if (brinquedoIds !== undefined) {
      await prisma.caixaBrinquedo.deleteMany({ where: { caixaId: id } })
      const ids = Array.isArray(brinquedoIds) ? brinquedoIds.filter((item): item is string => typeof item === 'string') : []
      if (ids.length > 0) {
        await prisma.caixaBrinquedo.createMany({
          data: ids.map((brinquedoId) => ({ caixaId: id, brinquedoId })),
        })
      }
    }

    const caixaAtualizado = await prisma.caixa.findUnique({
      where: { id },
      include: getCaixaSnapshotInclude(),
    })

    if (!caixaAtualizado) {
      throw new AppError(404, 'Caixa nÃ£o encontrado apÃ³s atualizaÃ§Ã£o')
    }

    res.json(serializeCaixaSnapshot(caixaAtualizado))
  },

  async delete(req: Request, res: Response) {
    const { id } = req.params

    const caixa = await prisma.caixa.findUnique({
      where: { id },
      include: {
        aberturas: {
          where: { status: 'aberto' },
          take: 1,
        },
      },
    })

    if (!caixa) {
      throw new AppError(404, 'Caixa nÃ£o encontrado')
    }

    if (caixa.status === 'aberto' || caixa.aberturas.length > 0) {
      throw new AppError(400, 'NÃ£o Ã© possÃ­vel excluir um caixa com abertura ativa')
    }

    await prisma.caixa.delete({
      where: { id },
    })

    res.status(204).send()
  },
}
