import { Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import { AppError } from '../middleware/errorHandler'

export const clientesController = {
  async list(req: Request, res: Response) {
    const clientes = await prisma.cliente.findMany({
      orderBy: { nomeCompleto: 'asc' },
    })
    res.json(clientes)
  },

  async getById(req: Request, res: Response) {
    const { id } = req.params
    const cliente = await prisma.cliente.findUnique({
      where: { id },
    })
    if (!cliente) {
      throw new AppError(404, 'Cliente não encontrado')
    }
    res.json(cliente)
  },

  async create(req: Request, res: Response) {
    const { nomeCompleto, dataNascimento, nomePai, nomeMae, telefoneWhatsapp } = req.body

    if (!nomeCompleto || !dataNascimento || !telefoneWhatsapp) {
      throw new AppError(400, 'Nome completo, data de nascimento e telefone são obrigatórios')
    }

    const cliente = await prisma.cliente.create({
      data: {
        nomeCompleto,
        dataNascimento,
        nomePai: nomePai || '',
        nomeMae: nomeMae || '',
        telefoneWhatsapp,
      },
    })

    res.status(201).json(cliente)
  },

  async update(req: Request, res: Response) {
    const { id } = req.params
    const { nomeCompleto, dataNascimento, nomePai, nomeMae, telefoneWhatsapp } = req.body

    const cliente = await prisma.cliente.update({
      where: { id },
      data: {
        nomeCompleto,
        dataNascimento,
        nomePai,
        nomeMae,
        telefoneWhatsapp,
      },
    })

    res.json(cliente)
  },

  async delete(req: Request, res: Response) {
    const { id } = req.params
    await prisma.cliente.delete({
      where: { id },
    })
    res.status(204).send()
  },

  async search(req: Request, res: Response) {
    const { query } = req.params
    const clientes = await prisma.cliente.findMany({
      where: {
        OR: [
          { nomeCompleto: { contains: query, mode: 'insensitive' } },
          { telefoneWhatsapp: { contains: query } },
        ],
      },
      take: 10,
    })
    res.json(clientes)
  },
}

