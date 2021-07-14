import { Job } from './template/job'
import config from 'config'
import { updateShipNameCache } from '../../core/database'

export class UpdateDatabase extends Job {
  public name = 'UpdateDatabase'
  public cron = config.get('Schedule.Cron.updateDatabase', '0 0 * * *')

  async execution(): Promise<any> {
    this.logger.log('Updating Database Cache...')
    try {
      await updateShipNameCache()
      this.logger.log('Finished updating Database Cache!')
    }
    catch (e) {
      this.logger.error('Database Cache failed to update with error', e.stack)
    }
  }
}
