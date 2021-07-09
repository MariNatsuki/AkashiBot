import winston = require('winston')
const { combine, timestamp, printf } = winston.format

export class Logger {
  private readonly logger: winston.Logger

  constructor(context?: string) {
    this.logger = winston.createLogger({
      transports: [new winston.transports.Console()],
      format: combine(
        timestamp(),
        printf(({ level, message, timestamp, trace }) => {
          return `[${timestamp}] ${context ? `[${context}] ` : ''}[${level.toUpperCase()}] ${message}${trace ? `\n${trace}` : ''}`
        })
      )
    })
  }

  log(message: any): void {
    this.logger.info(message)
  }

  warn(message: any): void {
    this.logger.warn(message)
  }

  error(message: any, trace?: any): void {
    this.logger.error(message, { trace })
  }
}
