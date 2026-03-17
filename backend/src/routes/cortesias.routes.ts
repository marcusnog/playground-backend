import { Router } from 'express'
import { cortesiasController } from '../controllers/cortesias.controller'
import { authenticateToken } from '../middleware/auth'

export const cortesiasRoutes = Router()

cortesiasRoutes.get('/', authenticateToken, cortesiasController.list)
cortesiasRoutes.post('/gerar', authenticateToken, cortesiasController.gerar)
cortesiasRoutes.post('/validar', authenticateToken, cortesiasController.validar)
