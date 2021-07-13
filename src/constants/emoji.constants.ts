export type Emojis = ShipType | ShipRarity | ShipStats | SkillType

export enum ShipType {
  Destroyer = 'DD',
  LightCruiser = 'CL',
  HeavyCruiser = 'CA',
  LargeCruiser = 'CB',
  Battleship = 'BB',
  Battlecruiser = 'BC',
  AviationBattleship = 'BBV',
  AircraftCarrier = 'CV',
  LightAircraftCarrier = 'CVL',
  Monitor = 'BM',
  Submarine = 'SS',
  SubmarineCarrier = 'SSV',
  RepairShip = 'AR',
  MunitionShip = 'AE'
}

export enum ShipRarity {
  Decisive = 'Rarity_DR',
  UltraRare = 'Rarity_UR',
  Priority = 'Rarity_PR',
  SuperRare = 'Rarity_SR',
  Elite = 'Rarity_E',
  Rare = 'Rarity_R',
  Normal = 'Rarity_N'
}

export enum ShipStats {
  Health = 'Health',
  Armor = 'Armor',
  Reload = 'Reload',
  Luck = 'Luck',
  Firepower = 'Firepower',
  Torpedo = 'Torpedo',
  Evasion = 'Evasion',
  AntiAir = 'AntiAir',
  Aviation = 'Aviation',
  OilConsumption = 'OilConsumption',
  Accuracy = 'Accuracy',
  ASW = 'ASW',
  Oxygen = 'Oxygen',
  Ammunition = 'Ammunition',
  HuntingRange = 'HuntingRange',
}

export enum SkillType {
  Offense = 'Offense',
  Defense = 'Defense',
  Support = 'Support'
}
