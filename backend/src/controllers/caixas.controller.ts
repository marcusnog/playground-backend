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

      // Verificar se já existe outro caixa aberto
      const caixaAberto = await prisma.caixa.findFirst({
        where: { status: 'aberto' },
      })

      if (caixaAberto) {
        throw new AppError(400, 'Já existe um caixa aberto')
      }

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

    // Verificar se já existe caixa aberto
    const caixaAberto = await prisma.caixa.findFirst({
      where: { status: 'aberto' },
    })

    if (caixaAberto) {
      throw new AppError(400, 'Já existe um caixa aberto')
    }

    const caixa = await prisma.caixa.create({
      data: {
        nome,
        data,
        valorInicial,
        status: 'aberto',
      },
    })

    res.status(201).json(caixa)
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
    const { nome, data } = req.body

    if (!nome) {
      throw new AppError(400, 'Nome é obrigatório')
    }

    const caixa = await prisma.caixa.create({
      data: {
        nome,
        data: data || new Date().toISOString().split('T')[0],
        valorInicial: 0,
        status: 'fechado',
      },
    })

    res.status(201).json(caixa)
  },

  async update(req: Request, res: Response) {
    const { id } = req.params
    const { nome, data } = req.body

    const caixa = await prisma.caixa.findUnique({
      where: { id },
    })

    if (!caixa) {
      throw new AppError(404, 'Caixa não encontrado')
    }

    if (caixa.status === 'aberto') {
      throw new AppError(400, 'Não é possível editar um caixa aberto')
    }

    const caixaAtualizado = await prisma.caixa.update({
      where: { id },
      data: {
        ...(nome && { nome }),
        ...(data && { data }),
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

