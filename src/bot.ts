import * as dotenv from 'dotenv'
import { Bot } from './core/bot'
import { initializeDatabase } from './core/database'

dotenv.config()
initializeDatabase().then(() => new Bot())


