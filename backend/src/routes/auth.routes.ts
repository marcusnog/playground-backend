import { Router } from 'express'
import { rateLimit } from 'express-rate-limit'
import { authController } from '../controllers/auth.controller'
import { authenticateToken } from '../middleware/auth'

export const authRoutes = Router()

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas tentativas de login. Tente novamente em 15 minutos.' },
  keyGenerator: (req) => req.ip ?? 'unknown',
})

const validarLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas tentativas de validação. Aguarde 5 minutos.' },
  keyGenerator: (req) => req.ip ?? 'unknown',
})

authRoutes.post('/login', loginLimiter, authController.login)
authRoutes.get('/me', authenticateToken, authController.getMe)
authRoutes.post('/validar-desconto', validarLimiter, authController.validarDesconto)
authRoutes.post('/validar-admin', validarLimiter, authController.validarAdmin)

