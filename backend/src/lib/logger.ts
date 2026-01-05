type LogLevel = 'info' | 'warn' | 'error' | 'debug'

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  data?: Record<string, unknown>
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'

  private formatMessage(level: LogLevel, message: string, data?: Record<string, unknown>): string {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      ...(data && { data }),
    }

    if (this.isDevelopment) {
      // Pretty print in development
      const emoji = {
        info: 'ℹ️',
        warn: '⚠️',
        error: '❌',
        debug: '🔍',
      }[level]

      return `${emoji} [${entry.timestamp}] ${level.toUpperCase()}: ${message}${data ? ` ${JSON.stringify(data, null, 2)}` : ''}`
    }

    // JSON format in production
    return JSON.stringify(entry)
  }

  info(message: string, data?: Record<string, unknown>) {
    console.log(this.formatMessage('info', message, data))
  }

  warn(message: string, data?: Record<string, unknown>) {
    console.warn(this.formatMessage('warn', message, data))
  }

  error(message: string, error?: Error | unknown, data?: Record<string, unknown>) {
    const errorData = error instanceof Error
      ? {
          ...data,
          error: {
            name: error.name,
            message: error.message,
            stack: this.isDevelopment ? error.stack : undefined,
          },
        }
      : { ...data, error }

    console.error(this.formatMessage('error', message, errorData))
  }

  debug(message: string, data?: Record<string, unknown>) {
    if (this.isDevelopment) {
      console.log(this.formatMessage('debug', message, data))
    }
  }
}

export const logger = new Logger()

