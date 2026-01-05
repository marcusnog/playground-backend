import { Router } from 'express'
import { caixasController } from '../controllers/caixas.controller'
import { authenticateToken } from '../middleware/auth'
import { requirePermission } from '../middleware/permissions'

export const caixasRoutes = Router()

caixasRoutes.get('/', authenticateToken, caixasController.list)
caixasRoutes.get('/aberto', authenticateToken, caixasController.getAberto)
caixasRoutes.get('/:id', authenticateToken, caixasController.getById)
caixasRoutes.post(
  '/abertura',
  authenticateToken,
  requirePermission('caixaAbertura'),
  caixasController.abrir
)
caixasRoutes.post(
  '/fechamento',
  authenticateToken,
  requirePermission('caixaFechamento'),
  caixasController.fechar
)
caixasRoutes.post(
  '/:id/sangria',
  authenticateToken,
  requirePermission('caixaSangria'),
  caixasController.sangria
)
caixasRoutes.post(
  '/:id/suprimento',
  authenticateToken,
  requirePermission('caixaSuprimento'),
  caixasController.suprimento
)
caixasRoutes.get('/:id/movimentos', authenticateToken, caixasController.getMovimentos)

