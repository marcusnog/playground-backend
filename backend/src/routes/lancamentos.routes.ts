import { Router } from 'express'
import { lancamentosController } from '../controllers/lancamentos.controller'
import { authenticateToken } from '../middleware/auth'
import { requirePermission } from '../middleware/permissions'

export const lancamentosRoutes = Router()

lancamentosRoutes.get('/', authenticateToken, lancamentosController.list)
lancamentosRoutes.get('/abertos', authenticateToken, lancamentosController.getAbertos)
lancamentosRoutes.get('/:id', authenticateToken, lancamentosController.getById)
lancamentosRoutes.post(
  '/',
  authenticateToken,
  requirePermission('lancamento'),
  lancamentosController.create
)
lancamentosRoutes.put(
  '/:id',
  authenticateToken,
  requirePermission('lancamento'),
  lancamentosController.update
)
lancamentosRoutes.post(
  '/:id/pagar',
  authenticateToken,
  requirePermission('lancamento'),
  lancamentosController.pagar
)
lancamentosRoutes.post(
  '/:id/cancelar',
  authenticateToken,
  requirePermission('lancamento'),
  lancamentosController.cancelar
)

