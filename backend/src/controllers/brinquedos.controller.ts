import { Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import { AppError } from '../middleware/errorHandler'

export const brinquedosController = {
  async list(_req: Request, res: Response) {
    const brinquedos = await prisma.brinquedo.findMany({
      orderBy: { nome: 'asc' },
    })
    res.json(brinquedos)
  },

  async getById(req: Request, res: Response) {
    const { id } = req.params
    const brinquedo = await prisma.brinquedo.findUnique({
      where: { id },
    })
    if (!brinquedo) {
      throw new AppError(404, 'Brinquedo não encontrado')
    }
    res.json(brinquedo)
  },

  async create(req: Request, res: Response) {
    const { nome, inicialMinutos, valorInicial, cicloMinutos, valorCiclo, cicloToleranciaMinutos, valorCiclo2, cicloTier2Minutos } = req.body

    if (!nome || valorInicial === undefined) {
      throw new AppError(400, 'Nome e valor inicial são obrigatórios')
    }

    const brinquedo = await prisma.brinquedo.create({
      data: {
        nome,
        inicialMinutos,
        valorInicial,
        cicloMinutos,
        valorCiclo: valorCiclo || 0,
        cicloToleranciaMinutos,
        valorCiclo2: valorCiclo2 ?? null,
        cicloTier2Minutos: cicloTier2Minutos ?? null,
      },
    })

    res.status(201).json(brinquedo)
  },

  async update(req: Request, res: Response) {
    const { id } = req.params
    const { nome, inicialMinutos, valorInicial, cicloMinutos, valorCiclo, cicloToleranciaMinutos, valorCiclo2, cicloTier2Minutos } = req.body

    const brinquedo = await prisma.brinquedo.update({
      where: { id },
      data: {
        nome,
        inicialMinutos,
        valorInicial,
        cicloMinutos,
        valorCiclo,
        cicloToleranciaMinutos,
        valorCiclo2: valorCiclo2 !== undefined ? valorCiclo2 : null,
        cicloTier2Minutos: cicloTier2Minutos !== undefined ? cicloTier2Minutos : null,
      },
    })

    res.json(brinquedo)
  },

  async delete(req: Request, res: Response) {
    const { id } = req.params
    const lancamentoAberto = await prisma.lancamento.findFirst({
      where: { brinquedoId: id, status: 'aberto' },
    })
    if (lancamentoAberto) {
      throw new AppError(400, 'Não é possível excluir brinquedo com acompanhamento em andamento. Encerre ou cancele o lançamento antes.')
    }
    await prisma.brinquedo.delete({
      where: { id },
    })
    res.status(204).send()
  },
}

