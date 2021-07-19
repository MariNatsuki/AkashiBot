import { Logger } from '../utils/logger'
import { Database } from '../types/database'
import { DefaultDatabase } from '../constants/database.constant'
import { getEquipmentList, getShipList } from '../module/azurlane-wiki'
import { AzurAPI } from '@azurapi/azurapi'
import Fuse from 'fuse.js'
import { normalizeShipName } from '../helpers/database.helper'
import { Ship } from '@azurapi/azurapi/build/types/ship'
import { Barrage } from '@azurapi/azurapi/build/types/barrage'
import { Equipment } from '@azurapi/azurapi/build/types/equipment'

const logger = new Logger('Database')
const localDatabase: Database = JSON.parse(JSON.stringify(DefaultDatabase))
let normalShipNameIndex, retrofittedShipNameIndex, equipmentNameIndex

let azurClient

export async function initializeDatabase(): Promise<void> {
  logger.log('Initializing Database...')
  try {
    await Promise.all([
      updateShipNameCache(),
      updateEquipmentNameCache()
    ])
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

async function fetchEquipmentNameList(): Promise<any> {
  logger.log('Fetching Equipment List from Azur Lane Wiki...')
  localDatabase.equipmentNameList = (await getEquipmentList()).filter(equip => !equip.startsWith('Category:') && !equip.startsWith('File:'))
  logger.log('Equipment list fetched and saved to local Database!')
}

function initializeAzurAPIClient() {
  azurClient = new AzurAPI()
}

function initializeShipNameIndexes() {
  const shipNameOptions = {
    ignoreFieldNorm: true,
    includeScore: true,
    keys: ['name', 'normalized']
  }
  normalShipNameIndex = new Fuse(localDatabase.shipNameList.normal, shipNameOptions)
  retrofittedShipNameIndex = new Fuse(localDatabase.shipNameList.retrofitted, shipNameOptions)
}

function initializeEquipmentNameIndexes() {
  const equipmentNameOptions = {
    ignoreFieldNorm: true,
    includeScore: true
  }
  equipmentNameIndex = new Fuse(localDatabase.equipmentNameList, equipmentNameOptions)
}

export async function updateShipNameCache(): Promise<void> {
  await fetchShipNameList()
  initializeShipNameIndexes()
}

export async function updateEquipmentNameCache(): Promise<void> {
  await fetchEquipmentNameList()
  initializeEquipmentNameIndexes()
}

export function searchShip(name: string): string {
  return normalShipNameIndex.search(name)[0]?.item?.name
}

export function searchEquipment(name: string): string {
  return equipmentNameIndex.search(name)[0]?.item
}

export function getShip(name: string): Ship {
  return azurClient.ships.name(name)
}

export function getBarrage(name: string): Barrage[] {
  return azurClient.barrages.filter(barrage => barrage.ships.includes(name))
}

export function getEquipment(name: string): Equipment {
  return azurClient.equipments.get(name)
}
