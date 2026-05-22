export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface Logger {
  debug(message: string, context?: Record<string, unknown>): void;
  info(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  error(message: string, context?: Record<string, unknown>): void;
}

export function createConsoleLogger(scope: string): Logger {
  const format = (level: LogLevel, message: string) =>
    `[${scope}] ${level.toUpperCase()}: ${message}`;

  return {
    debug(message, context) {
      console.debug(format('debug', message), context ?? '');
    },
    info(message, context) {
      console.info(format('info', message), context ?? '');
    },
    warn(message, context) {
      console.warn(format('warn', message), context ?? '');
    },
    error(message, context) {
      console.error(format('error', message), context ?? '');
    },
  };
}
