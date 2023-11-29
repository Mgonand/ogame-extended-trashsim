/**
 * Represents a collection of participants.
 * Each participant is identified by a participantId, and each ship is identified by a shipId.
 * The value associated with each shipId is the number of ships of that type.
 */
export type Entities = Record<number, Record<number, number>>;

export type Debris = {
  overall: {
    metal: number;
    crystal: number;
    deuterium?: number;
    total: number;
  };
  reaper: {
    attackers: {
      metal: number;
      crystal: number;
      deuterium?: number;
      total: number;
    };
    defenders: {
      metal: number;
      crystal: number;
      deuterium?: number;
      total: number;
    };
  };
  remaining: {
    metal: number;
    crystal: number;
    deuterium?: number;
    total: number;
  };
};

export type Losses = {
  attackers: {
    metal: number;
    crystal: number;
    deuterium: number;
    total: number;
  };
  defenders: {
    metal: number;
    crystal: number;
    deuterium: number;
    total: number;
  };
};

export type Plunder = {
  metal: number;
  crystal: number;
  deuterium: number;
  total: number;
};

export type Profits = {
  attackers: {
    metal: number;
    crystal: number;
    deuterium: number;
    total: number;
  };
  defenders: {
    metal: number;
    crystal: number;
    deuterium: number;
    total: number;
  };
};

export type Simulation = {
  outcome: string;
  rounds: number;
  entitiesLost: {
    attackers: Entities;
    defenders: Entities;
  };
  entitiesRemaining: {
    attackers: Entities;
    defenders: Entities;
  };
  debris: Debris;
  losses: Losses;
  plunder: Plunder;
  moonChance: number;
  profits: Profits;
};

export type Result = {
  outcome: {
    attackers: number;
    defenders: number;
    draw: number;
  };
  cases: {
    attackersBest: number;
    attackersWorst: number;
    defendersBest: number;
    defendersWorst: number;
    recyclersHighest: number;
    average: number;
  };
  simulations: Simulation[];
  activeCase: string;
  activeSimulation: Simulation;
};
