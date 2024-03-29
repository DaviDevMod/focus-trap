import type { Unit } from 'true-myth/unit';
import type { Result } from 'true-myth/result';
import { ok, err } from 'true-myth/result';

import { normaliseConfigExcludingRoots, normaliseRoots } from './normalise.js';

export type Focusable = HTMLElement | SVGElement;

export type Roots = (Focusable | string)[];

// The shape of the config expected from the consumer of the library.
export interface TrapConfig {
  roots: Roots;
  initialFocus?: boolean | Focusable | string;
  returnFocus?: boolean | Focusable | string;
  lock?: boolean;
  escape?: boolean;
}

// The shape of config used internally by the focus trap.
export interface NormalisedTrapConfig {
  roots: Focusable[];
  initialFocus: boolean | Focusable;
  returnFocus: Focusable | null;
  lock: boolean;
  escape: boolean;
}

interface State {
  isBuilt: boolean;
  rawConfig?: TrapConfig;
  normalisedConfig?: NormalisedTrapConfig;
}

interface Reducers {
  switchIsBuilt(to: boolean): Result<Unit, never>;
  setConfig(rawConfig: TrapConfig): Result<Unit, string>;
  updateRoots(): Result<Unit, string>;
}

export const state: State = { isBuilt: false };

export const reducers: Reducers = {
  switchIsBuilt(to) {
    state.isBuilt = to;

    return ok();
  },

  setConfig(rawConfig) {
    state.rawConfig = rawConfig;

    const normalisedRoots = normaliseRoots(rawConfig.roots);

    state.normalisedConfig = { roots: normalisedRoots.unwrapOr([]), ...normaliseConfigExcludingRoots(rawConfig) };

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
