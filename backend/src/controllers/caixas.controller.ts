import { Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import { AppError } from '../middleware/errorHandler'

export const caixasController = {
  async list(_req: Request, res: Response) {
    const caixas = await prisma.caixa.findMany({
      orderBy: { data: 'desc' },
      include: {
        movimentos: {
          orderBy: { dataHora: 'desc' },
        },
        brinquedos: {
          include: { brinquedo: true },
        },
      },
    })
    res.json(caixas)
  },

  async getAberto(_req: Request, res: Response) {
    const caixa = await prisma.caixa.findFirst({
      where: { status: 'aberto' },
      include: {
        movimentos: {
          orderBy: { dataHora: 'desc' },
        },
        brinquedos: {
          include: { brinquedo: true },
        },
      },
    })
    res.json(caixa)
  },

  async getById(req: Request, res: Response) {
    const { id } = req.params
    const caixa = await prisma.caixa.findUnique({
      where: { id },
      include: {
        movimentos: {
          orderBy: { dataHora: 'desc' },
        },
        brinquedos: {
          include: { brinquedo: true },
        },
      },
    })
    if (!caixa) {
      throw new AppError(404, 'Caixa não encontrado')
    }
    res.json(caixa)
  },

  async abrir(req: Request, res: Response) {
    const { id, nome, data, valorInicial } = req.body

    // Se forneceu ID, está tentando abrir um caixa existente
    if (id) {
      const caixa = await prisma.caixa.findUnique({
        where: { id },
      })

      if (!caixa) {
        throw new AppError(404, 'Caixa não encontrado')
      }

      if (caixa.status === 'aberto') {
        throw new AppError(400, 'Caixa já está aberto')
      }

      if ((caixa as { bloqueado?: boolean }).bloqueado) {
        throw new AppError(400, 'Este caixa está bloqueado e não pode ser aberto.')
      }

      // Permitir vários caixas abertos ao mesmo tempo (um por operador/terminal)
      // Atualizar o caixa existente para aberto
      const caixaAtualizado = await prisma.caixa.update({
        where: { id },
        data: {
          status: 'aberto',
          valorInicial: valorInicial !== undefined ? valorInicial : caixa.valorInicial,
          data: data || caixa.data,
        },
      })

      return res.json(caixaAtualizado)
    }

    // Se não forneceu ID, está criando um novo caixa
    if (!nome || !data || valorInicial === undefined) {
      throw new AppError(400, 'Nome, data e valor inicial são obrigatórios')
    }

    // Permitir vários caixas abertos (criação de novo caixa)
    const caixa = await prisma.caixa.create({
      data: {
        nome,
        data,
        valorInicial,
        status: 'aberto',
      },
    })

    return res.status(201).json(caixa)
  },

  async fechar(req: Request, res: Response) {
    const { id } = req.body

    if (!id) {
      throw new AppError(400, 'ID do caixa é obrigatório')
    }

    const caixa = await prisma.caixa.findUnique({
      where: { id },
      include: {
        movimentos: true,
      },
    })

    if (!caixa) {
      throw new AppError(404, 'Caixa não encontrado')
    }

    if (caixa.status === 'fechado') {
      throw new AppError(400, 'Caixa já está fechado')
    }

    const caixaAtualizado = await prisma.caixa.update({
      where: { id },
      data: {
        status: 'fechado',
      },
    })

    res.json(caixaAtualizado)
  },

  async sangria(req: Request, res: Response) {
    const { id } = req.params
    const { valor, motivo } = req.body

    if (!valor || valor <= 0) {
      throw new AppError(400, 'Valor da sangria deve ser maior que zero')
    }

    const caixa = await prisma.caixa.findUnique({
      where: { id },
    })

    if (!caixa) {
      throw new AppError(404, 'Caixa não encontrado')
    }

    if (caixa.status !== 'aberto') {
      throw new AppError(400, 'Caixa deve estar aberto para realizar sangria')
    }

    const movimento = await prisma.movimentoCaixa.create({
      data: {
        caixaId: id,
        dataHora: new Date(),
        tipo: 'sangria',
        valor,
        motivo,
      },
    })

    res.status(201).json(movimento)
  },

  async suprimento(req: Request, res: Response) {
    const { id } = req.params
    const { valor, motivo } = req.body

    if (!valor || valor <= 0) {
      throw new AppError(400, 'Valor do suprimento deve ser maior que zero')
    }

    const caixa = await prisma.caixa.findUnique({
      where: { id },
    })

    if (!caixa) {
      throw new AppError(404, 'Caixa não encontrado')
    }

    if (caixa.status !== 'aberto') {
      throw new AppError(400, 'Caixa deve estar aberto para realizar suprimento')
    }

    const movimento = await prisma.movimentoCaixa.create({
      data: {
        caixaId: id,
        dataHora: new Date(),
        tipo: 'suprimento',
        valor,
        motivo,
      },
    })

    res.status(201).json(movimento)
  },

  async getMovimentos(req: Request, res: Response) {
    const { id } = req.params
    const movimentos = await prisma.movimentoCaixa.findMany({
      where: { caixaId: id },
      orderBy: { dataHora: 'desc' },
    })
    res.json(movimentos)
  },

  async create(req: Request, res: Response) {
    const { nome, data, bloqueado, brinquedoIds } = req.body

    if (!nome) {
      throw new AppError(400, 'Nome é obrigatório')
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

    const ids = Array.isArray(brinquedoIds) ? brinquedoIds.filter((id: unknown) => typeof id === 'string') : []
    if (ids.length > 0) {
      await prisma.caixaBrinquedo.createMany({
        data: ids.map((brinquedoId: string) => ({ caixaId: caixa.id, brinquedoId })),
      })
    }

    const created = await prisma.caixa.findUnique({
      where: { id: caixa.id },
      include: {
        movimentos: true,
        brinquedos: { include: { brinquedo: true } },
      },
    })
    res.status(201).json(created || caixa)
  },

  async update(req: Request, res: Response) {
    const { id } = req.params
    const { nome, data, bloqueado, brinquedoIds } = req.body

    const caixa = await prisma.caixa.findUnique({
      where: { id },
    })

    if (!caixa) {
      throw new AppError(404, 'Caixa não encontrado')
    }

    if (caixa.status === 'aberto') {
      throw new AppError(400, 'Não é possível editar um caixa aberto')
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
      const ids = Array.isArray(brinquedoIds) ? brinquedoIds.filter((bid: unknown) => typeof bid === 'string') : []
      if (ids.length > 0) {
        await prisma.caixaBrinquedo.createMany({
          data: ids.map((brinquedoId: string) => ({ caixaId: id, brinquedoId })),
        })
      }
    }

    const caixaAtualizado = await prisma.caixa.findUnique({
      where: { id },
      include: {
        movimentos: { orderBy: { dataHora: 'desc' } },
        brinquedos: { include: { brinquedo: true } },
      },
    })
    res.json(caixaAtualizado)
  },

  async delete(req: Request, res: Response) {
    const { id } = req.params

    const caixa = await prisma.caixa.findUnique({
      where: { id },
    })

    if (!caixa) {
      throw new AppError(404, 'Caixa não encontrado')
    }

    if (caixa.status === 'aberto') {
      throw new AppError(400, 'Não é possível excluir um caixa aberto')
    }

    await prisma.caixa.delete({
      where: { id },
    })

    res.status(204).send()
  },
}

