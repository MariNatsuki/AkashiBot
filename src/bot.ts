import * as dotenv from 'dotenv'
import { Bot } from './core/bot'
import { initializeDatabase } from './core/database'
import { initEmojiModule } from './module/emoji'

dotenv.config()
Promise.all([
  initializeDatabase(),
  initEmojiModule()
]).then(() => new Bot())



