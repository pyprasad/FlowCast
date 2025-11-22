import pino, { Logger as PinoLogger } from 'pino';

export interface LoggerOptions {
  name: string;
  level?: string;
  pretty?: boolean;
}

export interface Logger extends PinoLogger {}

export function createLogger(options: LoggerOptions): Logger {
  const { name, level = 'info', pretty = process.env.NODE_ENV !== 'production' } = options;

  return pino({
    name,
    level,
    ...(pretty && {
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      },
    }),
    formatters: {
      level: (label) => {
        return { level: label };
      },
    },
    timestamp: pino.stdTimeFunctions.isoTime,
    serializers: {
      err: pino.stdSerializers.err,
      error: pino.stdSerializers.err,
    },
  });
}

export function createChildLogger(parent: Logger, bindings: Record<string, any>): Logger {
  return parent.child(bindings);
}

// Default export for convenience
export default createLogger;
