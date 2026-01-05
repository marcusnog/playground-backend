import { Router } from 'express'
import { clientesController } from '../controllers/clientes.controller'
import { authenticateToken } from '../middleware/auth'
import { requirePermission } from '../middleware/permissions'

export const clientesRoutes = Router()

clientesRoutes.get('/', authenticateToken, clientesController.list)
clientesRoutes.get('/:id', authenticateToken, clientesController.getById)
clientesRoutes.post(
  '/',
  authenticateToken,
  requirePermission('clientes'),
  clientesController.create
)
clientesRoutes.put(
  '/:id',
  authenticateToken,
  requirePermission('clientes'),
  clientesController.update
)
clientesRoutes.delete(
  '/:id',
  authenticateToken,
  requirePermission('clientes'),
  clientesController.delete
)
clientesRoutes.get('/search/:query', authenticateToken, clientesController.search)

