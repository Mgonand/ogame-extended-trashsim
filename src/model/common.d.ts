import type { IScope } from 'angular';
import type { Simulation, Result } from './result';

export interface Resources {
  metal: number;
  crystal: number;
  deuterium: number;
  energy?: number;
}

export type EntityInfo = {
  speed: number;
  cargo_capacity: number;
  fuel_usage: number;
  armour: number;
  shield: number;
  weapon: number;
  rapidfire_from: Record<number, number>;
  rapidfire_against: Record<number, number>;
  type: number;
  resources: Resources;
};

export type Settings = {
  simulations: number;
  plunder: number;
  fleetSpeed: number;
  rapidFire: boolean;
  fleetDebris: number;
  defenceDebris: number;
  defenceRepair: number;
  donutGalaxy: boolean;
  donutSystem: boolean;
  galaxies: number;
  systems: number;
  deuteriumSaveFactor: number;
  cargoHyperspaceTechMultiplier: number;
  characterClassesEnabled: boolean;
  minerBonusFasterTradingShips: number;
  minerBonusIncreasedCargoCapacityForTradingShips: number;
  warriorBonusFasterCombatShips: number;
  warriorBonusFasterRecyclers: number;
  warriorBonusRecyclerFuelConsumption: number;
  warriorBonusCombatTechs: number;
  combatDebrisFieldLimit: number;
  entityInfo?: Record<number, EntityInfo>;
};

export type PartyFleet = {
  ID: number;
  ships: Record<number, number | null>;
  techs: Record<
    | 'weapon'
    | 'shield'
    | 'armour'
    | 'hyperspacetech'
    | 'combustion'
    | 'impulse'
    | 'hyperspace',
    number
  >;
  class: 'discoverer' | 'general' | 'collector' | null;
  speed: number;
};

export type Party = {
  title: 'attackers' | 'defenders';
  label: 'A' | 'D';
  fleets: PartyFleet[];
};

export type Parties = {
  attackers: Party;
  defenders: Party;
};

export type FlightData = {
  flightTime: number | false;
  fuelConsumption: number | false;
};

export interface SimulatorScope extends IScope {
  settings: Settings;
  result: Result;
  parties: Parties;
  globals: {
    flightData: {
      attackers: FlightData;
      defenders: FlightData;
    };
  };
  getCargoCapacityForEntity(shipId: number): number;
  getNecessaryRecyclers(simulation: Simulation, overall?: boolean): number;
}
