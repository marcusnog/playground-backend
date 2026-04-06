import { logger } from './logger'

interface EnvConfig {
  PORT: string
  NODE_ENV: string
  JWT_SECRET: string
  DATABASE_URL: string
  CORS_ORIGIN?: string
}

const requiredEnvVars = ['JWT_SECRET', 'DATABASE_URL'] as const

export function validateEnv(): void {
  const missing: string[] = []
  const warnings: string[] = []

  // Check required variables
  for (const varName of requiredEnvVars) {
    if (!process.env[varName]) {
      missing.push(varName)
    }
  }

  // Check JWT_SECRET strength in production — hard-fail, not just warn
  if (process.env.NODE_ENV === 'production') {
    if (process.env.JWT_SECRET) {
      if (process.env.JWT_SECRET.length < 32) {
        missing.push('JWT_SECRET must be at least 32 characters long in production')
      }
      if (process.env.JWT_SECRET === 'your-super-secret-jwt-key-change-in-production') {
        missing.push('JWT_SECRET is using the default insecure value — set a real secret before deploying')
      }
    }

    if (!process.env.CORS_ORIGIN) {
      warnings.push('CORS_ORIGIN is not set. CORS will reject all requests in production.')
    }
  }

  if (missing.length > 0) {
    logger.error('Missing required environment variables', undefined, { missing })
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }

  if (warnings.length > 0) {
    warnings.forEach((warning) => logger.warn(warning))
  }

  logger.info('Environment variables validated')
}

export function getEnvConfig(): EnvConfig {
  return {
    PORT: process.env.PORT || '3001',
    NODE_ENV: process.env.NODE_ENV || 'development',
    JWT_SECRET: process.env.JWT_SECRET!,
    DATABASE_URL: process.env.DATABASE_URL!,
    CORS_ORIGIN: process.env.CORS_ORIGIN,
  }
}

