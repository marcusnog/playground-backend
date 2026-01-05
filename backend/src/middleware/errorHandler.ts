import { Request, Response, NextFunction } from 'express'
import { logger } from '../lib/logger'

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true,
    public code?: string
  ) {
    super(message)
    Object.setPrototypeOf(this, AppError.prototype)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor)
    }
  }
}

export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  // Log error
  if (err instanceof AppError) {
    logger.warn('Application error', {
      statusCode: err.statusCode,
      message: err.message,
      code: err.code,
      path: req.path,
      method: req.method,
    })

    return res.status(err.statusCode).json({
      error: err.message,
      statusCode: err.statusCode,
      ...(err.code && { code: err.code }),
      ...(process.env.NODE_ENV === 'development' && {
        stack: err.stack,
      }),
    })
  }

  // Unexpected error
  logger.error('Unexpected error', err, {
    path: req.path,
    method: req.method,
    body: req.body,
    query: req.query,
  })

  return res.status(500).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message,
    statusCode: 500,
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      message: err.message,
    }),
  })
}

