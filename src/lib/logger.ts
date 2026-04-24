type LogLevel = 'info' | 'warn' | 'error' | 'debug';

class Logger {
  private formatMessage(level: LogLevel, message: string, context?: any) {
    const timestamp = new Date().toISOString();
    const contextString = context ? ` | Context: ${JSON.stringify(context)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextString}`;
  }

  info(message: string, context?: any) {
    console.log(this.formatMessage('info', message, context));
  }

  warn(message: string, context?: any) {
    console.warn(this.formatMessage('warn', message, context));
  }

  error(message: string, context?: any) {
    // In production, you might want to send this to Sentry or another service
    console.error(this.formatMessage('error', message, context));
  }

  debug(message: string, context?: any) {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(this.formatMessage('debug', message, context));
    }
  }
}

export const logger = new Logger();
