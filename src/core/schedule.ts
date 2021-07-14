import { Logger } from '../utils/logger'
import * as schedule from 'node-schedule'
import { Job } from '../schedule/jobs/template/job'

const logger = new Logger('Schedule')
const jobList = []

function scheduleJob(job: Job, cron?: string): void {
  try {
    jobList.push(schedule.scheduleJob(cron || job.cron, () => {
      logger.log(`Running Job ${job}`)
      job.execution()
    }))
    logger.log(`Job ${job} successfully scheduled!`)
  }
  catch (e) {
    logger.error(`Scheduling Job ${job} failed with error:`, e.stack)
  }
}

export function registerJob(job: Job, cron?: string): void {
  scheduleJob(job, cron)
}

export function registerJobs(jobs: Job[]): void {
  jobs.forEach(job => scheduleJob(job))
}
