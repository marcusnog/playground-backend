import { Router } from 'express'
import { estacionamentosController } from '../controllers/estacionamentos.controller'
import { authenticateToken } from '../middleware/auth'
import { requirePermission } from '../middleware/permissions'

export const estacionamentosRoutes = Router()

// Estacionamentos
estacionamentosRoutes.get('/', authenticateToken, estacionamentosController.list)
estacionamentosRoutes.get('/:id', authenticateToken, estacionamentosController.getById)
estacionamentosRoutes.post(
  '/',
  authenticateToken,
  requirePermission('estacionamentoCadastro'),
  estacionamentosController.create
)
estacionamentosRoutes.put(
  '/:id',
  authenticateToken,
  requirePermission('estacionamentoCadastro'),
  estacionamentosController.update
)
estacionamentosRoutes.delete(
  '/:id',
  authenticateToken,
  requirePermission('estacionamentoCadastro'),
  estacionamentosController.delete
)

// Lançamentos de estacionamento
estacionamentosRoutes.get(
  '/lancamentos/abertos',
  authenticateToken,
  estacionamentosController.getLancamentosAbertos
)
estacionamentosRoutes.get(
  '/lancamentos',
  authenticateToken,
  estacionamentosController.getLancamentos
)
estacionamentosRoutes.get(
  '/lancamentos/:id',
  authenticateToken,
  estacionamentosController.getLancamentoById
)
estacionamentosRoutes.post(
  '/lancamentos',
  authenticateToken,
  requirePermission('estacionamentoLancamento'),
  estacionamentosController.createLancamento
)
estacionamentosRoutes.post(
  '/lancamentos/:id/pagar',
  authenticateToken,
  requirePermission('estacionamentoLancamento'),
  estacionamentosController.pagarLancamento
)
estacionamentosRoutes.post(
  '/lancamentos/:id/cancelar',
  authenticateToken,
  requirePermission('estacionamentoLancamento'),
  estacionamentosController.cancelarLancamento
)

// Caixa de estacionamento
estacionamentosRoutes.get(
  '/caixa/abertura',
  authenticateToken,
  requirePermission('estacionamentoCaixaAbertura'),
  estacionamentosController.getCaixaAbertura
)
estacionamentosRoutes.post(
  '/caixa/abertura',
  authenticateToken,
  requirePermission('estacionamentoCaixaAbertura'),
  estacionamentosController.abrirCaixa
)
estacionamentosRoutes.post(
  '/caixa/fechamento',
  authenticateToken,
  requirePermission('estacionamentoCaixaFechamento'),
  estacionamentosController.fecharCaixa
)

