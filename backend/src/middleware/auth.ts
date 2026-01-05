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
  res: Response,
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
      throw new AppError(403, 'Token inválido')
    }
    req.user = decoded
    next()
  } catch (error) {
    if (error instanceof AppError) {
      throw error
    }
    throw new AppError(403, 'Token inválido ou expirado')
  }
}

