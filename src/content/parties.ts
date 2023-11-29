import type { Parties } from '../model/common';

let parties: Parties | undefined;

export function setParties(newParties: Parties) {
  parties = newParties;
}

export function getParties() {
  return parties;
}
