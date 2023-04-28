import { Result, ok, err } from 'true-myth/result';
import { Unit } from 'true-myth/unit';

import { normaliseConfigEscludingRoots, normaliseRoots } from './normalise.js';

// An element has to be either an HTMLElement or an SVGElement to receive focus.
export type Focusable = HTMLElement | SVGElement;

export type Roots = (Focusable | string)[];

// The shape of the config expected from the user of the trap.
export interface TrapConfig {
  roots: Roots;
  initialFocus?: boolean | Focusable | string;
  returnFocus?: boolean | Focusable | string;
  lock?: boolean | Function;
  escape?: boolean | Function;
}

// The shape of config used internally by the focus trap.
export interface NormalisedTrapConfig {
  roots: Focusable[];
  initialFocus: boolean | Focusable;
  returnFocus: Focusable | null;
  lock: boolean | Function;
  escape: boolean | Function;
}

interface State {
  isBuilt: boolean;
  rawConfig?: TrapConfig;
  normalisedConfig?: NormalisedTrapConfig;
}

interface Reducers {
  switchIsBuilt(to: boolean): void;
  setConfig(rawConfig: TrapConfig): Result<Unit, string>;
  updateRoots(): Result<Unit, string>;
}

export const state: State = { isBuilt: false };

export const reducers: Reducers = {
  switchIsBuilt(to) {
    state.isBuilt = to;
  },

  setConfig(rawConfig) {
    state.rawConfig = rawConfig;

    const normalisedRoots = normaliseRoots(rawConfig.roots);

    state.normalisedConfig = { roots: normalisedRoots.unwrapOr([]), ...normaliseConfigEscludingRoots(rawConfig) };

    return normalisedRoots.and(ok());
  },

  updateRoots() {
    if (!state.rawConfig) return err('No config was ever provided.');

    if (!state.normalisedConfig) return err('No config was ever normalised.');

    const normalisedRoots = normaliseRoots(state.rawConfig.roots);

    state.normalisedConfig.roots = normalisedRoots.unwrapOr([]);

    return normalisedRoots.and(ok());
  },
};
