import type { Settings } from '../model/common';

let settings: Settings | undefined;

export function setSettings(newSettings: Settings) {
  settings = newSettings;
}

export function getSettings() {
  return settings;
}
