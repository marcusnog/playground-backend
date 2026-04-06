import { Request, Response } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { AppError } from '../middleware/errorHandler'

const clienteSchema = z.object({
  nomeCompleto: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(150).trim(),
  dataNascimento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD'),
  nomePai: z.string().max(150).trim().optional(),
  nomeMae: z.string().max(150).trim().optional(),
  telefoneWhatsapp: z.string().min(10, 'Telefone inválido').max(20).regex(/^\+?[\d\s\-()+]+$/, 'Telefone inválido'),
})

export const clientesController = {
  async list(_req: Request, res: Response) {
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
    const parsed = clienteSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new AppError(400, parsed.error.issues.map((i) => i.message).join(', '))
    }
    const { nomeCompleto, dataNascimento, nomePai, nomeMae, telefoneWhatsapp } = parsed.data

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
    const parsed = clienteSchema.partial().safeParse(req.body)
    if (!parsed.success) {
      throw new AppError(400, parsed.error.issues.map((i) => i.message).join(', '))
    }
    const { nomeCompleto, dataNascimento, nomePai, nomeMae, telefoneWhatsapp } = parsed.data

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
    const lancamentoAberto = await prisma.lancamento.findFirst({
      where: { clienteId: id, status: 'aberto' },
    })
    if (lancamentoAberto) {
      throw new AppError(400, 'Não é possível excluir cliente com acompanhamento em andamento. Encerre ou cancele o lançamento antes.')
    }
    await prisma.cliente.delete({
      where: { id },
    })
    res.status(204).send()
  },

  async search(req: Request, res: Response) {
    const rawQuery = req.params.query
    if (!rawQuery || rawQuery.trim().length === 0) {
      return res.json([])
    }
    const query = rawQuery.trim().slice(0, 100)
    // SQLite doesn't support case-insensitive mode
    const clientes = await prisma.cliente.findMany({
      where: {
        OR: [
          { nomeCompleto: { contains: query } },
          { telefoneWhatsapp: { contains: query } },
        ],
      },
      take: 10,
    })
    return res.json(clientes)
  },
}

