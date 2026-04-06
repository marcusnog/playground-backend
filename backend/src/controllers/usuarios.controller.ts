import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import { Prisma } from '@prisma/client'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { AppError } from '../middleware/errorHandler'

const permissionsSchema = z.object({
  usaCaixa: z.boolean().optional(),
  bloqueado: z.boolean().optional(),
  acompanhamento: z.boolean().optional(),
  lancamento: z.boolean().optional(),
  caixaAbertura: z.boolean().optional(),
  caixaFechamento: z.boolean().optional(),
  caixaSangria: z.boolean().optional(),
  caixaSuprimento: z.boolean().optional(),
  estacionamentoCadastro: z.boolean().optional(),
  estacionamentoCaixaAbertura: z.boolean().optional(),
  estacionamentoCaixaFechamento: z.boolean().optional(),
  estacionamentoLancamento: z.boolean().optional(),
  estacionamentoAcompanhamento: z.boolean().optional(),
  relatorios: z.boolean().optional(),
  parametrosEmpresa: z.boolean().optional(),
  parametrosFormasPagamento: z.boolean().optional(),
  parametrosBrinquedos: z.boolean().optional(),
  clientes: z.boolean().optional(),
  descontoAutorizado: z.boolean().optional(),
  cortesia: z.boolean().optional(),
  caixaId: z.string().uuid().optional().nullable(),
})

const usuarioCreateSchema = z.object({
  nomeCompleto: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(150).trim(),
  apelido: z.string().min(2, 'Apelido deve ter pelo menos 2 caracteres').max(50).trim().regex(/^[a-zA-Z0-9_.\- ]+$/, 'Apelido contém caracteres inválidos'),
  contato: z.string().max(100).optional(),
  senha: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres').max(200),
}).merge(permissionsSchema)

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
        descontoAutorizado: true,
        cortesia: true,
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
        cortesia: true,
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
    const parsed = usuarioCreateSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new AppError(400, parsed.error.issues.map((i) => i.message).join(', '))
    }
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
      descontoAutorizado,
      cortesia,
    } = parsed.data

    // Verificar se apelido já existe
    const existing = await prisma.usuario.findUnique({
      where: { apelido },
    })

    if (existing) {
      throw new AppError(400, 'Apelido já está em uso')
    }

    const hashedPassword = await bcrypt.hash(senha, 12)

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
        descontoAutorizado: descontoAutorizado || false,
        cortesia: cortesia || false,
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
        descontoAutorizado: true,
        cortesia: true,
        bloqueado: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    res.status(201).json(usuario)
  },

  async update(req: Request, res: Response) {
    const { id } = req.params
    const updateSchema = usuarioCreateSchema.partial().extend({
      senha: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres').max(200).optional(),
    })
    const parsed = updateSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new AppError(400, parsed.error.issues.map((i) => i.message).join(', '))
    }
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
      descontoAutorizado,
      cortesia,
    } = parsed.data

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
      descontoAutorizado,
      cortesia,
    }

    // Se senha foi fornecida, hash ela
    if (senha) {
      updateData.senha = await bcrypt.hash(senha, 12)
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
        descontoAutorizado: true,
        cortesia: true,
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

