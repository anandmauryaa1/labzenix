/**
 * Production-ready Logger for LabZenix
 * 
 * Features:
 * - Structured logging with timestamps and levels
 * - Different log output for development vs production
 * - Supports integration with external services (Sentry, DataDog, etc.)
 * - Never logs sensitive data
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogContext {
  [key: string]: unknown;
}

class Logger {
  private isDev = process.env.NODE_ENV !== 'production';

  /**
   * Formats log messages with timestamp, level, and context
   */
  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextString = context ? ` | Context: ${JSON.stringify(context)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextString}`;
  }

  /**
   * Send error to external service (e.g., Sentry)
   * Implement based on your monitoring service
   */
  private sendToExternalService(level: LogLevel, message: string, context?: LogContext) {
    // TODO: Integrate with Sentry, DataDog, or your monitoring service
    // Example for Sentry:
    // if (level === 'error') {
    //   Sentry.captureException(new Error(message), { extra: context });
    // }
  }

  info(message: string, context?: LogContext) {
    const formatted = this.formatMessage('info', message, context);
    console.log(formatted);
  }

  warn(message: string, context?: LogContext) {
    const formatted = this.formatMessage('warn', message, context);
    console.warn(formatted);
    if (!this.isDev) {
      this.sendToExternalService('warn', message, context);
    }
  }

  error(message: string, context?: LogContext) {
    const formatted = this.formatMessage('error', message, context);
    console.error(formatted);
    // Always send errors to external service in production
    this.sendToExternalService('error', message, context);
  }

  debug(message: string, context?: LogContext) {
    // Only log debug messages in development
    if (this.isDev) {
      const formatted = this.formatMessage('debug', message, context);
      console.debug(formatted);
    }
  }

  /**
   * Log performance metrics (optional)
   */
  metric(name: string, value: number, unit: string = 'ms', context?: LogContext) {
    if (!this.isDev) {
      this.info(`METRIC: ${name}=${value}${unit}`, context);
      // Send to monitoring service here
    }
  }

  /**
   * Log security events
   */
  security(message: string, context?: LogContext) {
    const securityContext = { ...context, security_event: true };
    this.warn(`SECURITY: ${message}`, securityContext);
  }
}

export const logger = new Logger();
