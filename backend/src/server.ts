import express from 'express'
import cors from 'cors'
import 'express-async-errors'
import dotenv from 'dotenv'
import { authRoutes } from './routes/auth.routes'
import { formasPagamentoRoutes } from './routes/formasPagamento.routes'
import { brinquedosRoutes } from './routes/brinquedos.routes'
import { parametrosRoutes } from './routes/parametros.routes'
import { caixasRoutes } from './routes/caixas.routes'
import { clientesRoutes } from './routes/clientes.routes'
import { usuariosRoutes } from './routes/usuarios.routes'
import { lancamentosRoutes } from './routes/lancamentos.routes'
import { estacionamentosRoutes } from './routes/estacionamentos.routes'
import { errorHandler } from './middleware/errorHandler'
import { logger } from './lib/logger'
import { validateEnv } from './lib/env'
import { prisma } from './lib/prisma'

// Load environment variables
dotenv.config()

// Validate required environment variables
validateEnv()

const app = express()
const PORT = process.env.PORT || 3001
const NODE_ENV = process.env.NODE_ENV || 'development'

// Trust proxy (important for production behind reverse proxy)
app.set('trust proxy', 1)

// CORS configuration
const corsOptions: cors.CorsOptions = {
  origin: process.env.CORS_ORIGIN 
    ? process.env.CORS_ORIGIN.split(',')
    : NODE_ENV === 'production'
    ? false // Reject all in production if not configured
    : true, // Allow all in development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}

app.use(cors(corsOptions))

// Body parser
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Request logging middleware
app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
  })
  next()
})

// Health check endpoint
app.get('/health', (req: express.Request, res: express.Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: NODE_ENV,
    version: process.env.npm_package_version || '1.0.0',
  })
})

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/formas-pagamento', formasPagamentoRoutes)
app.use('/api/brinquedos', brinquedosRoutes)
app.use('/api/parametros', parametrosRoutes)
app.use('/api/caixas', caixasRoutes)
app.use('/api/clientes', clientesRoutes)
app.use('/api/usuarios', usuariosRoutes)
app.use('/api/lancamentos', lancamentosRoutes)
app.use('/api/estacionamentos', estacionamentosRoutes)

// 404 handler
app.use((req: express.Request, res: express.Response) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.path,
  })
})

// Error handler (must be last)
app.use(errorHandler)

// Start server
const server = app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`, {
    environment: NODE_ENV,
    port: PORT,
  })
})

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  logger.info(`${signal} received, shutting down gracefully`)
  
  server.close(async () => {
    logger.info('HTTP server closed')
    
    try {
      // Close Prisma connection
      await prisma.$disconnect()
      logger.info('Database connection closed')
      process.exit(0)
    } catch (err) {
      logger.error('Error closing database connection', err)
      process.exit(1)
    }
  })

  // Force shutdown after 10 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout')
    process.exit(1)
  }, 10000)
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', error)
  gracefulShutdown('uncaughtException')
})

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled rejection', { reason, promise })
  gracefulShutdown('unhandledRejection')
})

