import { Router } from 'express'
import { formasPagamentoController } from '../controllers/formasPagamento.controller'
import { authenticateToken } from '../middleware/auth'
import { requirePermission } from '../middleware/permissions'

export const formasPagamentoRoutes = Router()

formasPagamentoRoutes.get('/', authenticateToken, formasPagamentoController.list)
formasPagamentoRoutes.get('/:id', authenticateToken, formasPagamentoController.getById)
formasPagamentoRoutes.post(
  '/',
  authenticateToken,
  requirePermission('parametrosFormasPagamento'),
  formasPagamentoController.create
)
formasPagamentoRoutes.put(
  '/:id',
  authenticateToken,
  requirePermission('parametrosFormasPagamento'),
  formasPagamentoController.update
)
formasPagamentoRoutes.delete(
  '/:id',
  authenticateToken,
  requirePermission('parametrosFormasPagamento'),
  formasPagamentoController.delete
)

