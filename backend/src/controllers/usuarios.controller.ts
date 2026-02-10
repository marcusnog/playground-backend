import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import { Prisma } from '@prisma/client'
import { prisma } from '../lib/prisma'
import { AppError } from '../middleware/errorHandler'

export const usuariosController = {
  async list(_req: Request, res: Response) {
    const usuarios = await prisma.usuario.findMany({
      select: {
        id: true,
        nomeCompleto: true,
        apelido: true,
        contato: true,
        usaCaixa: true,
        caixaId: true,
        bloqueado: true,
        acompanhamento: true,
        lancamento: true,
        caixaAbertura: true,
        caixaFechamento: true,
        caixaSangria: true,
        caixaSuprimento: true,
        estacionamentoCadastro: true,
        estacionamentoCaixaAbertura: true,
        estacionamentoCaixaFechamento: true,
        estacionamentoLancamento: true,
        estacionamentoAcompanhamento: true,
        relatorios: true,
        parametrosEmpresa: true,
        parametrosFormasPagamento: true,
        parametrosBrinquedos: true,
        clientes: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { nomeCompleto: 'asc' },
    })
    res.json(usuarios)
  },

  async getById(req: Request, res: Response) {
    const { id } = req.params
    const usuario = await prisma.usuario.findUnique({
      where: { id },
      select: {
        id: true,
        nomeCompleto: true,
        apelido: true,
        contato: true,
        usaCaixa: true,
        caixaId: true,
        bloqueado: true,
        acompanhamento: true,
        lancamento: true,
        caixaAbertura: true,
        caixaFechamento: true,
        caixaSangria: true,
        caixaSuprimento: true,
        estacionamentoCadastro: true,
        estacionamentoCaixaAbertura: true,
        estacionamentoCaixaFechamento: true,
        estacionamentoLancamento: true,
        estacionamentoAcompanhamento: true,
        relatorios: true,
        parametrosEmpresa: true,
        parametrosFormasPagamento: true,
        parametrosBrinquedos: true,
        clientes: true,
        createdAt: true,
        updatedAt: true,
      },
    })
    if (!usuario) {
      throw new AppError(404, 'Usuário não encontrado')
    }
    res.json(usuario)
  },

  async create(req: Request, res: Response) {
    const {
      nomeCompleto,
      apelido,
      contato,
      senha,
      usaCaixa,
      caixaId,
      bloqueado,
      acompanhamento,
      lancamento,
      caixaAbertura,
      caixaFechamento,
      caixaSangria,
      caixaSuprimento,
      estacionamentoCadastro,
      estacionamentoCaixaAbertura,
      estacionamentoCaixaFechamento,
      estacionamentoLancamento,
      estacionamentoAcompanhamento,
      relatorios,
      parametrosEmpresa,
      parametrosFormasPagamento,
      parametrosBrinquedos,
      clientes,
    } = req.body

    if (!nomeCompleto || !apelido || !senha) {
      throw new AppError(400, 'Nome completo, apelido e senha são obrigatórios')
    }

    // Verificar se apelido já existe
    const existing = await prisma.usuario.findUnique({
      where: { apelido },
    })

    if (existing) {
      throw new AppError(400, 'Apelido já está em uso')
    }

    const hashedPassword = await bcrypt.hash(senha, 10)

    const usuario = await prisma.usuario.create({
      data: {
        nomeCompleto,
        apelido,
        contato: contato || '',
        senha: hashedPassword,
        usaCaixa: usaCaixa || false,
        caixaId,
        bloqueado: !!bloqueado,
        acompanhamento: acompanhamento || false,
        lancamento: lancamento || false,
        caixaAbertura: caixaAbertura || false,
        caixaFechamento: caixaFechamento || false,
        caixaSangria: caixaSangria || false,
        caixaSuprimento: caixaSuprimento || false,
        estacionamentoCadastro: estacionamentoCadastro || false,
        estacionamentoCaixaAbertura: estacionamentoCaixaAbertura || false,
        estacionamentoCaixaFechamento: estacionamentoCaixaFechamento || false,
        estacionamentoLancamento: estacionamentoLancamento || false,
        estacionamentoAcompanhamento: estacionamentoAcompanhamento || false,
        relatorios: relatorios || false,
        parametrosEmpresa: parametrosEmpresa || false,
        parametrosFormasPagamento: parametrosFormasPagamento || false,
        parametrosBrinquedos: parametrosBrinquedos || false,
        clientes: clientes || false,
      },
      select: {
        id: true,
        nomeCompleto: true,
        apelido: true,
        contato: true,
        usaCaixa: true,
        caixaId: true,
        acompanhamento: true,
        lancamento: true,
        caixaAbertura: true,
        caixaFechamento: true,
        caixaSangria: true,
        caixaSuprimento: true,
        estacionamentoCadastro: true,
        estacionamentoCaixaAbertura: true,
        estacionamentoCaixaFechamento: true,
        estacionamentoLancamento: true,
        estacionamentoAcompanhamento: true,
        relatorios: true,
        parametrosEmpresa: true,
        parametrosFormasPagamento: true,
        parametrosBrinquedos: true,
        clientes: true,
        bloqueado: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    res.status(201).json(usuario)
  },

  async update(req: Request, res: Response) {
    const { id } = req.params
    const {
      nomeCompleto,
      apelido,
      contato,
      senha,
      usaCaixa,
      caixaId,
      bloqueado,
      acompanhamento,
      lancamento,
      caixaAbertura,
      caixaFechamento,
      caixaSangria,
      caixaSuprimento,
      estacionamentoCadastro,
      estacionamentoCaixaAbertura,
      estacionamentoCaixaFechamento,
      estacionamentoLancamento,
      estacionamentoAcompanhamento,
      relatorios,
      parametrosEmpresa,
      parametrosFormasPagamento,
      parametrosBrinquedos,
      clientes,
    } = req.body

    const updateData: Prisma.UsuarioUpdateInput = {
      nomeCompleto,
      apelido,
      contato,
      usaCaixa,
      ...(caixaId !== undefined && { caixa: caixaId ? { connect: { id: caixaId } } : { disconnect: true } }),
      ...(bloqueado !== undefined && { bloqueado: !!bloqueado }),
      acompanhamento,
      lancamento,
      caixaAbertura,
      caixaFechamento,
      caixaSangria,
      caixaSuprimento,
      estacionamentoCadastro,
      estacionamentoCaixaAbertura,
      estacionamentoCaixaFechamento,
      estacionamentoLancamento,
      estacionamentoAcompanhamento,
      relatorios,
      parametrosEmpresa,
      parametrosFormasPagamento,
      parametrosBrinquedos,
      clientes,
    }

    // Se senha foi fornecida, hash ela
    if (senha) {
      updateData.senha = await bcrypt.hash(senha, 10)
    }

    // Se apelido mudou, verificar se não está em uso
    if (apelido) {
      const existing = await prisma.usuario.findUnique({
        where: { apelido },
      })
      if (existing && existing.id !== id) {
        throw new AppError(400, 'Apelido já está em uso')
      }
    }

    const usuario = await prisma.usuario.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        nomeCompleto: true,
        apelido: true,
        contato: true,
        usaCaixa: true,
        caixaId: true,
        acompanhamento: true,
        lancamento: true,
        caixaAbertura: true,
        caixaFechamento: true,
        caixaSangria: true,
        caixaSuprimento: true,
        estacionamentoCadastro: true,
        estacionamentoCaixaAbertura: true,
        estacionamentoCaixaFechamento: true,
        estacionamentoLancamento: true,
        estacionamentoAcompanhamento: true,
        relatorios: true,
        parametrosEmpresa: true,
        parametrosFormasPagamento: true,
        parametrosBrinquedos: true,
        clientes: true,
        bloqueado: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    res.json(usuario)
  },

  async delete(req: Request, res: Response) {
    const { id } = req.params

    // Não permitir deletar o usuário admin
    const usuario = await prisma.usuario.findUnique({
      where: { id },
    })

    if (usuario?.apelido === 'admin') {
      throw new AppError(400, 'Não é possível deletar o usuário admin')
    }

    await prisma.usuario.delete({
      where: { id },
    })
    res.status(204).send()
  },
}

