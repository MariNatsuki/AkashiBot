import { Logger } from '../utils/logger'
import { Database } from '../types/database'
import { DefaultDatabase } from '../constants/database.constant'
import { getShipList } from '../module/azurlane-wiki'
import { AzurAPI } from '@azurapi/azurapi'
import Fuse from 'fuse.js'
import { normalizeShipName } from '../helpers/database.helper'
import { Ship } from '@azurapi/azurapi/build/types/ship'

const logger = new Logger('Database')
const localDatabase: Database = JSON.parse(JSON.stringify(DefaultDatabase))
let normalShipNameIndex
let retrofittedShipNameIndex

let azurClient

export async function initializeDatabase(): Promise<void> {
  logger.log('Initializing Database...')
  try {
    await updateShipNameCache()
    initializeAzurAPIClient()
    logger.log('Database Initialized!')
  }
  catch (e) {
    logger.error('Database initialization failed with error', e.stack)
  }
}

function fetchShipNameList(): Promise<any> {
  logger.log('Fetching Ship List from Azur Lane Wiki...')
  return getShipList()
    .then(list => ['normal', 'retrofitted'].forEach(key => {
      localDatabase.shipNameList[key] = list[key].map(shipName => ({
        name: shipName,
        normalized: normalizeShipName(shipName)
      }))
    }))
    .then(() => logger.log('Ship list fetched and saved to local Database!'))
}

function initializeAzurAPIClient() {
  azurClient = new AzurAPI()
}

function initializeFuseClients() {
  const shipNameOptions = {
    includeScore: true,
    threshold: 0.25,
    keys: ['name', 'normalized']
  }
  normalShipNameIndex = new Fuse(localDatabase.shipNameList.normal, shipNameOptions)
  retrofittedShipNameIndex = new Fuse(localDatabase.shipNameList.retrofitted, shipNameOptions)
}

export async function updateShipNameCache(): Promise<void> {
  await fetchShipNameList()
  initializeFuseClients()
}

export function searchShip(name: string): string {
  return normalShipNameIndex.search(name)[0]?.item?.name || null
}

export function getShip(name: string): Ship {
  return azurClient.ships.name(name)
}
