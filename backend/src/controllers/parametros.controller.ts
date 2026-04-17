import { Request, Response } from 'express'
import { prisma } from '../lib/prisma'

export const parametrosController = {
  async get(_req: Request, res: Response) {
    let parametros = await prisma.parametros.findUnique({
      where: { id: 'global' },
    })

    if (!parametros) {
      // Criar parâmetros padrão se não existirem
      parametros = await prisma.parametros.create({
        data: {
          id: 'global',
          valorInicialMinutos: 30,
          valorInicialReais: 20,
          valorCicloMinutos: 10,
          valorCicloReais: 7.5,
          cicloToleranciaMinutos: 3,
          empresaNome: 'Parque Infantil',
          empresaCnpj: '00.000.000/0000-00',
        },
      })
    }

    res.json(parametros)
  },

  async update(req: Request, res: Response) {
    const {
      valorInicialMinutos,
      valorInicialReais,
      valorCicloMinutos,
      valorCicloReais,
      cicloToleranciaMinutos,
      empresaNome,
      empresaCnpj,
      empresaLogoUrl,
      pixChave,
      pixCidade,
    } = req.body

    const parametros = await prisma.parametros.upsert({
      where: { id: 'global' },
      update: {
        valorInicialMinutos,
        valorInicialReais,
        valorCicloMinutos,
        valorCicloReais,
        cicloToleranciaMinutos,
        empresaNome,
        empresaCnpj,
        empresaLogoUrl,
        pixChave,
        pixCidade,
      },
      create: {
        id: 'global',
        valorInicialMinutos: valorInicialMinutos ?? 30,
        valorInicialReais: valorInicialReais ?? 20,
        valorCicloMinutos: valorCicloMinutos ?? 10,
        valorCicloReais: valorCicloReais ?? 7.5,
        cicloToleranciaMinutos: cicloToleranciaMinutos ?? 3,
        empresaNome,
        empresaCnpj,
        empresaLogoUrl,
        pixChave,
        pixCidade,
      },
    })

    res.json(parametros)
  },
}

