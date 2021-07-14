import { Logger } from '../../../utils/logger'

export abstract class Job {
  protected readonly logger: Logger
  public name = 'Job'
  public abstract cron

  constructor() {
    this.logger = new Logger(this.name)
  }

  toString(): string {
    return this.name
  }

  abstract execution(): any
}
