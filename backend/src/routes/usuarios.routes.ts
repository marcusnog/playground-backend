import { Router } from 'express'
import { usuariosController } from '../controllers/usuarios.controller'
import { authenticateToken } from '../middleware/auth'
import { requirePermission } from '../middleware/permissions'

export const usuariosRoutes = Router()

usuariosRoutes.get('/', authenticateToken, requirePermission('parametrosEmpresa'), usuariosController.list)
usuariosRoutes.get('/:id', authenticateToken, requirePermission('parametrosEmpresa'), usuariosController.getById)
usuariosRoutes.post('/', authenticateToken, requirePermission('parametrosEmpresa'), usuariosController.create)
usuariosRoutes.put('/:id', authenticateToken, requirePermission('parametrosEmpresa'), usuariosController.update)
usuariosRoutes.delete('/:id', authenticateToken, requirePermission('parametrosEmpresa'), usuariosController.delete)

