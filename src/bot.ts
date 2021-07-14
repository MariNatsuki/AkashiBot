import * as dotenv from 'dotenv'
import { Bot } from './core/bot'
import { initializeDatabase } from './core/database'
import { initializeEmojiModule } from './module/emoji'
import { initializeSchedule } from './schedule/schedule'

dotenv.config()
Promise.all([
  initializeDatabase(),
  initializeEmojiModule(),
  initializeSchedule()
]).then(() => new Bot())



