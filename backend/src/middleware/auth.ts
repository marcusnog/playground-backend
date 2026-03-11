import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { AppError } from './errorHandler'
import { PermissoesModulo } from '../types/permissions'

export interface AuthRequest extends Request {
  user?: {
    id: string
    apelido: string
    permissoes: PermissoesModulo
    usaCaixa: boolean
    caixaId?: string
  }
}

export function authenticateToken(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

  if (!token) {
    throw new AppError(401, 'Token de autenticação não fornecido')
  }

  const jwtSecret = process.env.JWT_SECRET
  if (!jwtSecret) {
    throw new AppError(500, 'JWT_SECRET não configurado')
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as AuthRequest['user']
    if (!decoded) {
      throw new AppError(401, 'Token inválido')
    }
    req.user = decoded
    next()
  } catch (error: unknown) {
    if (error instanceof AppError) {
      throw error
    }
    const isExpired = error && typeof error === 'object' && 'name' in error && (error as { name?: string }).name === 'TokenExpiredError'
    throw new AppError(401, isExpired ? 'Token expirado. Faça login novamente.' : 'Token inválido.')
  }
}

