import chalk from 'chalk';
import { isString, upperCase } from 'lodash';
import type { Logger as WinstonLogger } from 'winston';
import { createLogger, format, transports } from 'winston';

const { combine, timestamp, printf } = format;

export class Logger {
  private readonly logger: WinstonLogger;

  constructor(context?: string) {
    this.logger = createLogger({
      transports: [new transports.Console()],
      format: combine(
        timestamp(),
        printf(({ level, message, timestamp, trace }) => {
          return `[${timestamp}] [${this.getLevelLabel(level)}] ${
            context ? `[${chalk.bold(context)}] ` : ''
          }${message}${trace ? `\n${trace}` : ''}`;
        }),
      ),
    });
  }

  private getLevelLabel(level: string) {
    switch (level) {
      case 'info':
        return chalk.cyan('INFO');
      case 'error':
        return chalk.bgRed('ERROR');
      case 'warn':
        return chalk.bgYellow.black('WARN');
      default:
        return upperCase(level);
    }
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
