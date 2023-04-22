import { isString } from 'lodash';
import type { Logger as WinstonLogger } from 'winston';
import { createLogger, format, transports } from 'winston';

const { combine, timestamp, printf } = format;

const Colors = {
  info: '\x1b[36m',
  error: '\x1b[31m',
  warn: '\x1b[33m',
  verbose: '\x1b[43m'
};

export class Logger {
  private readonly logger: WinstonLogger;

  constructor(context?: string) {
    this.logger = createLogger({
      transports: [new transports.Console()],
      format: combine(
        timestamp(),
        printf(({ level, message, timestamp, trace }) => {
          return `\x1b[0m[${timestamp}] [${Colors[level as keyof typeof Colors]}${level.toUpperCase()}\x1b[0m] ${
            context ? `[\x1b[1m${context}\x1b[0m] ` : ''
          }${message}${trace ? `\n${trace}` : ''}`;
        })
      )
    });
  }

  log = (message: string): void => {
    this.logger.info(message);
  };

  warn = (message: string): void => {
    this.logger.warn(message);
  };

  // error(error: Error | unknown): void;
  // error(message: string, trace?: unknown): void;

  error = (errorOrMessage: string | Error | unknown, trace?: unknown): void => {
    if (errorOrMessage instanceof Error) {
      this.logger.error(errorOrMessage.message, { trace: errorOrMessage.stack });
    } else if (isString(errorOrMessage)) {
      this.logger.error(errorOrMessage, { trace });
    }
  };
}
