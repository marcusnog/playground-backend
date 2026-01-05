import { Router } from 'express'
import { authController } from '../controllers/auth.controller'
import { authenticateToken } from '../middleware/auth'

export const authRoutes = Router()

authRoutes.post('/login', authController.login)
authRoutes.get('/me', authenticateToken, authController.getMe)

