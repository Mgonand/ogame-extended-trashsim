import type { PartyFleet } from '../../model/common';
import type { Simulation } from '../../model/result';
import { getParties } from '../parties.js';
import { getSettings } from '../settings.js';

function getEntityCargoCapacity(
  shipId: number,
  amount: number,
  fleet: PartyFleet,
): number {
  const settings = getSettings();
  if (!settings) {
    throw new Error('Settings not found');
  }
  const entityInfo = settings.entityInfo!;
  let cargoCapacity = entityInfo[shipId].cargo_capacity;
  if (settings.cargoHyperspaceTechMultiplier > 0) {
    cargoCapacity +=
      cargoCapacity *
      (settings.cargoHyperspaceTechMultiplier / 100) *
      fleet.techs.hyperspacetech;
  }
  if (
    settings.characterClassesEnabled &&
    'collector' === fleet.class &&
    [202, 203].indexOf(shipId) >= 0
  ) {
    cargoCapacity +=
      entityInfo[shipId].cargo_capacity *
      (settings.minerBonusIncreasedCargoCapacityForTradingShips / 100);
  }
  return cargoCapacity * amount;
}

function calculateReaperData(simulation: Simulation) {
  const result: Record<string, { count: number; capacity: number }> = {};
  const parties = getParties();
  const settings = getSettings();
  if (parties && settings) {
    for (const side in simulation.entitiesRemaining) {
      const typedSide = side as keyof typeof simulation.entitiesRemaining;
      result[typedSide] = {
        count: 0,
        capacity: 0,
      };
      for (const participantKey in simulation.entitiesRemaining[typedSide])
        if (
          void 0 !==
          simulation.entitiesRemaining[typedSide][participantKey][218]
        ) {
          const remainingShips =
            simulation.entitiesRemaining[typedSide][participantKey][218];
          result[typedSide].count += remainingShips;
          result[typedSide].capacity += getEntityCargoCapacity(
            218,
            remainingShips,
            parties[typedSide].fleets[parseInt(participantKey, 10)],
          );
        }
    }
  }
  return result;
}

export function calculateDebris(simulation: Simulation): Simulation['debris'] {
  const settings = getSettings();
  if (!settings) {
    throw new Error('Settings not found');
  }
  const resourcesToPlunder = simulation.plunder;
  const fleetDebris = settings.fleetDebris / 100;
  const defenceDebris = settings.defenceDebris / 100;
  let metal = 0;
  let crystal = 0;
  let deuterium = 0;
  let defenceRepairMult = 1 - settings.defenceRepair / 100;
  if (resourcesToPlunder?.total > 0) {
    defenceRepairMult /= 2;
  }
  const entityInfo = settings.entityInfo!;
  for (const side in simulation.entitiesLost) {
    const typedSide = side as keyof typeof simulation.entitiesLost;
    for (const participantKey in simulation.entitiesLost[typedSide]) {
      for (const shipKey in simulation.entitiesLost[typedSide][
        participantKey
      ]) {
        const debrisMult =
          parseInt(shipKey, 10) >= 400
            ? defenceDebris * defenceRepairMult
            : fleetDebris;
        metal +=
          simulation.entitiesLost[typedSide][participantKey][shipKey] *
          entityInfo[shipKey].resources.metal *
          debrisMult;
        crystal +=
          simulation.entitiesLost[typedSide][participantKey][shipKey] *
          entityInfo[shipKey].resources.crystal *
          debrisMult;
        deuterium +=
          simulation.entitiesLost[typedSide][participantKey][shipKey] *
          entityInfo[shipKey].resources.deuterium *
          debrisMult;
      }
    }
  }
  const result = {
    overall: {
      metal: metal,
      crystal: crystal,
      deuterium: deuterium,
      total: metal + crystal + deuterium,
    },
    reaper: {
      attackers: {
        metal: 0,
        crystal: 0,
        deuterium: 0,
        total: 0,
      },
      defenders: {
        metal: 0,
        crystal: 0,
        deuterium: 0,
        total: 0,
      },
    },
    remaining: {
      metal: 0,
      crystal: 0,
      deuterium: 0,
      total: 0,
    },
  };
  if (settings.combatDebrisFieldLimit > 0) {
    const combatDebrisLimitMult = settings.combatDebrisFieldLimit / 100;
    const maxCombatDebrisTotal = Math.floor(
      combatDebrisLimitMult * result.overall.total,
    );
    const metalRatio = result.overall.metal / result.overall.total;
    const crystalRatio = result.overall.crystal / result.overall.total;
    const deuteriumRatio = result.overall.deuterium / result.overall.total;
    const reapers = calculateReaperData(simulation);
    for (const side in reapers) {
      const typedSide = side as keyof typeof result.reaper;
      if (reapers[typedSide].count > 0) {
        const maxDebrisToCollect =
          maxCombatDebrisTotal > reapers[typedSide].capacity
            ? reapers[typedSide].capacity
            : maxCombatDebrisTotal;
        result.reaper[typedSide].metal = Math.floor(
          maxDebrisToCollect * metalRatio,
        );
        result.reaper[typedSide].crystal = Math.floor(
          maxDebrisToCollect * crystalRatio,
        );
        result.reaper[typedSide].deuterium = Math.floor(
          maxDebrisToCollect * deuteriumRatio,
        );
        result.reaper[typedSide].total =
          result.reaper[typedSide].metal +
          result.reaper[typedSide].crystal +
          result.reaper[typedSide].deuterium;
      }
    }
  }
  result.remaining.metal =
    result.overall.metal -
    result.reaper.attackers.metal -
    result.reaper.defenders.metal;
  result.remaining.crystal =
    result.overall.crystal -
    result.reaper.attackers.crystal -
    result.reaper.defenders.crystal;
  result.remaining.deuterium =
    result.overall.deuterium -
    result.reaper.attackers.deuterium -
    result.reaper.defenders.deuterium;
  result.remaining.total =
    result.overall.total -
    result.reaper.attackers.total -
    result.reaper.defenders.total;
  return result;
}
