type LogLevel = 'info' | 'warn' | 'error' | 'debug';

class Logger {
  private formatMessage(level: LogLevel, message: string, context?: Record<string, unknown>) {
    const timestamp = new Date().toISOString();
    const contextString = context ? ` | Context: ${JSON.stringify(context)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextString}`;
  }

  info(message: string, context?: Record<string, unknown>) {
    console.log(this.formatMessage('info', message, context));
  }

  warn(message: string, context?: Record<string, unknown>) {
    console.warn(this.formatMessage('warn', message, context));
  }

  error(message: string, context?: Record<string, unknown>) {
    // In production, you might want to send this to Sentry or another service
    console.error(this.formatMessage('error', message, context));
  }

  debug(message: string, context?: Record<string, unknown>) {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(this.formatMessage('debug', message, context));
    }
  }
}

export const logger = new Logger();
