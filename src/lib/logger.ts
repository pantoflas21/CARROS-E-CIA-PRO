/**
 * Sistema de logging seguro
 * Não loga informações sensíveis em produção
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private sanitizeContext(context?: Record<string, unknown>): Record<string, unknown> | undefined {
    if (!context) return undefined;

    const sensitiveKeys = ['password', 'token', 'secret', 'key', 'cpf', 'email', 'phone'];
    const sanitized = { ...context };

    for (const key in sanitized) {
      if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
        sanitized[key] = '[REDACTED]';
      }
    }

    return sanitized;
  }

  private log(level: LogLevel, message: string, context?: Record<string, unknown>) {
    if (!this.isDevelopment && level === 'debug') {
      return; // Não logar debug em produção
    }

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context: this.sanitizeContext(context),
    };

    switch (level) {
      case 'error':
        console.error(`[${entry.timestamp}] [ERROR] ${message}`, entry.context || '');
        break;
      case 'warn':
        console.warn(`[${entry.timestamp}] [WARN] ${message}`, entry.context || '');
        break;
      case 'info':
        if (this.isDevelopment) {
          console.info(`[${entry.timestamp}] [INFO] ${message}`, entry.context || '');
        }
        break;
      case 'debug':
        if (this.isDevelopment) {
          console.debug(`[${entry.timestamp}] [DEBUG] ${message}`, entry.context || '');
        }
        break;
    }

    // Em produção, você pode enviar logs para um serviço externo
    // Exemplo: Sentry, LogRocket, etc.
  }

  info(message: string, context?: Record<string, unknown>) {
    this.log('info', message, context);
  }

  warn(message: string, context?: Record<string, unknown>) {
    this.log('warn', message, context);
  }

  error(message: string, context?: Record<string, unknown>) {
    this.log('error', message, context);
  }

  debug(message: string, context?: Record<string, unknown>) {
    this.log('debug', message, context);
  }
}

export const logger = new Logger();

