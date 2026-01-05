import { Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import { AppError } from '../middleware/errorHandler'

export const formasPagamentoController = {
  async list(_req: Request, res: Response) {
    const formas = await prisma.formaPagamento.findMany({
      orderBy: { descricao: 'asc' },
    })
    res.json(formas)
  },

  async getById(req: Request, res: Response) {
    const { id } = req.params
    const forma = await prisma.formaPagamento.findUnique({
      where: { id },
    })
    if (!forma) {
      throw new AppError(404, 'Forma de pagamento não encontrada')
    }
    res.json(forma)
  },

  async create(req: Request, res: Response) {
    const { descricao, status, pixChave, pixConta } = req.body

    if (!descricao || !status) {
      throw new AppError(400, 'Descrição e status são obrigatórios')
    }

    const forma = await prisma.formaPagamento.create({
      data: {
        descricao,
        status,
        pixChave,
        pixConta,
      },
    })

    res.status(201).json(forma)
  },

  async update(req: Request, res: Response) {
    const { id } = req.params
    const { descricao, status, pixChave, pixConta } = req.body

    const forma = await prisma.formaPagamento.update({
      where: { id },
      data: {
        descricao,
        status,
        pixChave,
        pixConta,
      },
    })

    res.json(forma)
  },

  async delete(req: Request, res: Response) {
    const { id } = req.params
    await prisma.formaPagamento.delete({
      where: { id },
    })
    res.status(204).send()
  },
}

