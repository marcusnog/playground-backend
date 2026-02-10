import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma'
import { AppError } from '../middleware/errorHandler'
import { AuthRequest } from '../middleware/auth'

export const authController = {
  async login(req: Request, res: Response) {
    const { username, password } = req.body

    if (!username || !password) {
      throw new AppError(400, 'Username e senha são obrigatórios')
    }

    // SQLite doesn't support case-insensitive mode, so we'll search normally
    // For PostgreSQL, you can add mode: 'insensitive'
    const usuario = await prisma.usuario.findFirst({
      where: {
        OR: [
          { apelido: username },
          { nomeCompleto: username },
        ],
      },
    })

    if (!usuario) {
      throw new AppError(401, 'Credenciais inválidas')
    }

    if ((usuario as { bloqueado?: boolean }).bloqueado) {
      throw new AppError(403, 'Usuário bloqueado. Contate o administrador.')
    }

    const isValidPassword = await bcrypt.compare(password, usuario.senha)
    if (!isValidPassword) {
      throw new AppError(401, 'Credenciais inválidas')
    }

    const jwtSecret = process.env.JWT_SECRET
    if (!jwtSecret) {
      throw new AppError(500, 'JWT_SECRET não configurado')
    }

    // Converter permissões do banco para o formato esperado
    const permissoes = {
      acompanhamento: usuario.acompanhamento,
      lancamento: usuario.lancamento,
      caixa: {
        abertura: usuario.caixaAbertura,
        fechamento: usuario.caixaFechamento,
        sangria: usuario.caixaSangria,
        suprimento: usuario.caixaSuprimento,
      },
      estacionamento: {
        cadastro: usuario.estacionamentoCadastro,
        caixa: {
          abertura: usuario.estacionamentoCaixaAbertura,
          fechamento: usuario.estacionamentoCaixaFechamento,
        },
        lancamento: usuario.estacionamentoLancamento,
        acompanhamento: usuario.estacionamentoAcompanhamento,
      },
      relatorios: usuario.relatorios,
      parametros: {
        empresa: usuario.parametrosEmpresa,
        formasPagamento: usuario.parametrosFormasPagamento,
        brinquedos: usuario.parametrosBrinquedos,
      },
      clientes: usuario.clientes,
    }

    const token = jwt.sign(
      {
        id: usuario.id,
        apelido: usuario.apelido,
        permissoes,
        usaCaixa: usuario.usaCaixa,
        caixaId: usuario.caixaId,
      },
      jwtSecret,
      { expiresIn: '7d' }
    )

    res.json({
      token,
      user: {
        id: usuario.id,
        username: usuario.apelido,
        apelido: usuario.apelido,
        permissoes,
        usaCaixa: usuario.usaCaixa,
        caixaId: usuario.caixaId,
      },
    })
  },

  async getMe(req: AuthRequest, res: Response) {
    if (!req.user) {
      throw new AppError(401, 'Usuário não autenticado')
    }
    const userId = req.user.id

    const usuario = await prisma.usuario.findUnique({
      where: { id: userId },
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
      },
    })

    if (!usuario) {
      throw new AppError(404, 'Usuário não encontrado')
    }

    const permissoes = {
      acompanhamento: usuario.acompanhamento,
      lancamento: usuario.lancamento,
      caixa: {
        abertura: usuario.caixaAbertura,
        fechamento: usuario.caixaFechamento,
        sangria: usuario.caixaSangria,
        suprimento: usuario.caixaSuprimento,
      },
      estacionamento: {
        cadastro: usuario.estacionamentoCadastro,
        caixa: {
          abertura: usuario.estacionamentoCaixaAbertura,
          fechamento: usuario.estacionamentoCaixaFechamento,
        },
        lancamento: usuario.estacionamentoLancamento,
        acompanhamento: usuario.estacionamentoAcompanhamento,
      },
      relatorios: usuario.relatorios,
      parametros: {
        empresa: usuario.parametrosEmpresa,
        formasPagamento: usuario.parametrosFormasPagamento,
        brinquedos: usuario.parametrosBrinquedos,
      },
      clientes: usuario.clientes,
    }

    res.json({
      id: usuario.id,
      username: usuario.apelido,
      apelido: usuario.apelido,
      permissoes,
      usaCaixa: usuario.usaCaixa,
      caixaId: usuario.caixaId,
    })
  },
}

