import { Router } from 'express'
import { parametrosController } from '../controllers/parametros.controller'
import { authenticateToken } from '../middleware/auth'
import { requirePermission } from '../middleware/permissions'

export const parametrosRoutes = Router()

parametrosRoutes.get('/', authenticateToken, parametrosController.get)
parametrosRoutes.put(
  '/',
  authenticateToken,
  requirePermission('parametrosEmpresa'),
  parametrosController.update
)

