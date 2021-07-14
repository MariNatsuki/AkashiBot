import { registerJob, registerJobs } from '../core/schedule'
import { UpdateDatabase } from './jobs/update-database'

export async function initializeSchedule(): Promise<void> {
  registerJobs([
    new UpdateDatabase()
  ])
}
