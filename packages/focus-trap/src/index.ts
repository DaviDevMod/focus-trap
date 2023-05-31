import type { Roots, TrapConfig, NormalisedTrapConfig } from './state.js';
import { build, resume, demolish, pause } from './trap-actions.js';
import { state } from './state.js';

type TrapAction = 'RESUME' | 'DEMOLISH' | 'PAUSE';

type TrapArg = Roots | TrapConfig | TrapAction;

export const focusTrap = (arg: TrapArg): NormalisedTrapConfig => {
  const result =
    typeof arg === 'string'
      ? arg === 'DEMOLISH'
        ? demolish()
        : arg === 'RESUME'
        ? resume()
        : pause()
      : build(Array.isArray(arg) ? { roots: arg } : arg);

  if (result.isErr) throw new Error(result.error);

  // If !state.normalisedConfig, result.isErr === true; and this line is unreachable.
  return { ...state.normalisedConfig! };
};

export type { TrapArg, Roots, TrapConfig, TrapAction, NormalisedTrapConfig };
