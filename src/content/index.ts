import type {
  SimulatorScope,
  EntityInfo,
  Settings,
  Parties,
  ResultsTotalScope,
} from '../model/common';
import type { Result, Simulation } from '../model/result';
import {
  updateDeuteriumDebrisRow,
  updateResultsTotalDeuteriumDebrisRow,
  updateTotalRecyclers,
} from './deuteriumToDebris/html.js';
import { calculateDebris } from './deuteriumToDebris/index.js';
import { setParties } from './parties.js';
import { setSettings } from './settings.js';

declare global {
  const entityInfoV7: Record<number, EntityInfo>;
  const entityInfoV6: Record<number, EntityInfo>;
}

function updateSettings(settings: Settings) {
  settings.entityInfo = settings.characterClassesEnabled
    ? entityInfoV7
    : entityInfoV6;
  setSettings(settings);
}

function updateParties(parties: Parties) {
  setParties(parties);
}

function calculateProfits(
  simulation: SimulatorScope['result']['activeSimulation'],
  side: keyof SimulatorScope['globals']['flightData'],
  flightData: SimulatorScope['globals']['flightData'],
) {
  const totalFuelConsumption = flightData[side].fuelConsumption || 0;
  let metal =
    -simulation.losses[side].metal +
    simulation.debris.remaining.metal +
    simulation.debris.reaper[side].metal;
  let crystal =
    -simulation.losses[side].crystal +
    simulation.debris.remaining.crystal +
    simulation.debris.reaper[side].crystal;
  let deuterium =
    -simulation.losses[side].deuterium -
    totalFuelConsumption +
    (simulation.debris.remaining.deuterium || 0) +
    (simulation.debris.reaper[side].deuterium || 0);
  if (side === 'attackers') {
    metal += simulation.plunder.metal;
    crystal += simulation.plunder.crystal;
    deuterium += simulation.plunder.deuterium;
  }
  return {
    metal,
    crystal,
    deuterium,
    total: metal + crystal + deuterium,
  };
}

export function main() {
  if (window.angular) {
    const controllerSimulatorElement = document.querySelector(
      '#page-home > div.controller-simulator',
    );
    if (controllerSimulatorElement) {
      const simulatorScope = window.angular
        .element(controllerSimulatorElement)
        .scope<SimulatorScope>();
      updateDeuteriumDebrisRow(simulatorScope.result?.activeSimulation?.debris);
      if (simulatorScope.settings) {
        updateSettings(simulatorScope.settings);
      }
      if (simulatorScope.parties) {
        updateParties(simulatorScope.parties);
      }
      simulatorScope.$watch<Settings>('settings', function (settings) {
        if (settings) {
          updateSettings(settings);
        }
      });
      simulatorScope.$watch<Parties>('parties', function (parties) {
        if (parties) {
          updateParties(parties);
        }
      });
      let wavesLengthWatcher: (() => void) | undefined;
      simulatorScope.$watch<number>('waves.length', function (wavesLength) {
        if (wavesLengthWatcher) {
          wavesLengthWatcher();
        }
        if (wavesLength > 0) {
          const controllerResultsTotalElement =
            document.querySelector('#results-total');
          if (controllerResultsTotalElement) {
            const controllerResultsTotalScope = window.angular
              .element(controllerResultsTotalElement)
              .scope<ResultsTotalScope>();
            wavesLengthWatcher = controllerResultsTotalScope.$watch<Simulation>(
              'resultsTotal',
              function (simulation) {
                if (simulation) {
                  updateResultsTotalDeuteriumDebrisRow(simulation.debris);
                }
              },
            );
          }
        }
      });
      simulatorScope.$watch<Result>('result', function (result) {
        if (result?.activeSimulation) {
          const simulation = result.activeSimulation;
          const debris = calculateDebris(simulation);
          simulation.debris = debris;
          simulation.profits.attackers = calculateProfits(
            simulation,
            'attackers',
            simulatorScope.globals.flightData,
          );
          simulation.profits.defenders = calculateProfits(
            simulation,
            'defenders',
            simulatorScope.globals.flightData,
          );
          updateDeuteriumDebrisRow(debris);
          updateTotalRecyclers(
            simulatorScope.getNecessaryRecyclers(simulation, true),
            true,
          );
          updateTotalRecyclers(
            simulatorScope.getNecessaryRecyclers(simulation),
          );
        }
      });
    }
  } else {
    console.log('Angular not ready, waiting 1s');
    setTimeout(main, 1000);
  }
}

main();
