import { Router } from 'express'
import { usuariosController } from '../controllers/usuarios.controller'
import { authenticateToken } from '../middleware/auth'

export const usuariosRoutes = Router()

usuariosRoutes.get('/', authenticateToken, usuariosController.list)
usuariosRoutes.get('/:id', authenticateToken, usuariosController.getById)
usuariosRoutes.post('/', authenticateToken, usuariosController.create)
usuariosRoutes.put('/:id', authenticateToken, usuariosController.update)
usuariosRoutes.delete('/:id', authenticateToken, usuariosController.delete)

