import { Router } from 'express'
import { brinquedosController } from '../controllers/brinquedos.controller'
import { authenticateToken } from '../middleware/auth'
import { requirePermission } from '../middleware/permissions'

export const brinquedosRoutes = Router()

brinquedosRoutes.get('/', authenticateToken, brinquedosController.list)
brinquedosRoutes.get('/:id', authenticateToken, brinquedosController.getById)
brinquedosRoutes.post(
  '/',
  authenticateToken,
  requirePermission('parametrosBrinquedos'),
  brinquedosController.create
)
brinquedosRoutes.put(
  '/:id',
  authenticateToken,
  requirePermission('parametrosBrinquedos'),
  brinquedosController.update
)
brinquedosRoutes.delete(
  '/:id',
  authenticateToken,
  requirePermission('parametrosBrinquedos'),
  brinquedosController.delete
)

