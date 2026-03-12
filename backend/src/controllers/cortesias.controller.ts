import { Response } from 'express'
import { prisma } from '../lib/prisma'
import { AppError } from '../middleware/errorHandler'
import type { AuthRequest } from '../middleware/auth'

function gerarCodigo8Digitos(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let codigo = ''
  for (let i = 0; i < 8; i++) {
    codigo += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return codigo
}

function normalizarWhatsapp(val: string): string {
  return String(val || '').replace(/\D/g, '')
}

export const cortesiasController = {
  async gerar(req: AuthRequest, res: Response) {
    const permissoes = req.user?.permissoes
    if (!permissoes?.cortesia) {
      throw new AppError(403, 'Permissão negada: você não pode gerar códigos de cortesia')
    }

    const { clienteId, whatsappDestino: whatsappInput, validadeDias } = (req.body || {}) as {
      clienteId?: string
      whatsappDestino?: string
      validadeDias?: number
    }

    const validadeDiasNum = typeof validadeDias === 'number' ? validadeDias : parseInt(String(validadeDias || '7'), 10)
    if (isNaN(validadeDiasNum) || validadeDiasNum < 1) {
      throw new AppError(400, 'Informe um prazo de validade em dias (mínimo 1)')
    }

    let whatsappDestino = ''

    if (clienteId) {
      const cliente = await prisma.cliente.findUnique({ where: { id: clienteId } })
      if (!cliente) {
        throw new AppError(400, 'Cliente não encontrado')
      }
      whatsappDestino = normalizarWhatsapp(cliente.telefoneWhatsapp)
    } else if (whatsappInput) {
      whatsappDestino = normalizarWhatsapp(whatsappInput)
    }

    if (whatsappDestino.length < 10) {
      throw new AppError(400, 'Informe o cliente ou o número de WhatsApp para envio da cortesia')
    }

    let codigo: string
    let tentativas = 0
    const maxTentativas = 10

    do {
      codigo = gerarCodigo8Digitos()
      const existente = await prisma.cortesia.findUnique({ where: { codigo } })
      if (!existente) break
      tentativas++
    } while (tentativas < maxTentativas)

    if (tentativas >= maxTentativas) {
      throw new AppError(500, 'Não foi possível gerar um código único. Tente novamente.')
    }

    await prisma.cortesia.create({
      data: {
        codigo,
        clienteId: clienteId || null,
        whatsappDestino,
        validadeDias: validadeDiasNum,
      },
    })

    res.status(201).json({ codigo, validadeDias: validadeDiasNum })
  },

  async validar(req: AuthRequest, res: Response) {
    const { codigo } = req.body as { codigo?: string }
    const codigoLimpo = String(codigo || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '')

    if (codigoLimpo.length !== 8) {
      throw new AppError(400, 'Código de cortesia inválido. Deve ter 8 caracteres.')
    }

    const cortesia = await prisma.cortesia.findUnique({
      where: { codigo: codigoLimpo },
    })

    if (!cortesia) {
      throw new AppError(400, 'Código de cortesia não encontrado')
    }

    if (cortesia.usado) {
      throw new AppError(400, 'Este código de cortesia já foi utilizado')
    }

    res.json({ valido: true, codigo: cortesia.codigo })
  },
}
