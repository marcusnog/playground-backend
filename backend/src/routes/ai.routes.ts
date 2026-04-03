import { Router, Request, Response } from 'express'
import Anthropic from '@anthropic-ai/sdk'

const router = Router()

// Only initialize if API key is configured
let anthropic: Anthropic | null = null
if (process.env.ANTHROPIC_API_KEY) {
	anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
}

const SYSTEM_PROMPT = `Você é um assistente inteligente do sistema de gestão de playground.
Você ajuda os operadores com dúvidas sobre o sistema, análise de dados, sugestões operacionais e suporte geral.
Responda sempre em português, de forma clara e concisa.
Você tem conhecimento sobre: lançamentos, caixas, brinquedos, clientes, estacionamento, formas de pagamento e relatórios.`

interface ChatMessage {
	role: 'user' | 'assistant'
	content: string
}

// POST /api/ai/chat
router.post('/chat', async (req: Request, res: Response) => {
	if (!anthropic) {
		return res.status(503).json({
			error: 'Assistente IA não configurado. Adicione ANTHROPIC_API_KEY no servidor.'
		})
	}

	const { messages } = req.body as { messages: ChatMessage[] }

	if (!Array.isArray(messages) || messages.length === 0) {
		return res.status(400).json({ error: 'messages é obrigatório' })
	}

	// Only user/assistant roles for Anthropic
	const filtered = messages
		.filter(m => m.role === 'user' || m.role === 'assistant')
		.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }))

	const message = await anthropic.messages.create({
		model: 'claude-haiku-4-5-20251001',
		max_tokens: 1024,
		system: SYSTEM_PROMPT,
		messages: filtered,
	})

	const content = message.content
		.filter(b => b.type === 'text')
		.map(b => (b as { type: 'text'; text: string }).text)
		.join('')

	return res.json({ content })
})

export const aiRoutes = router
