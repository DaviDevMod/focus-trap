import type { Roots, TrapConfig } from './state.js';
import { throwInEnv } from './exceptions.js';
import { build, resume, demolish, pause } from './trap-actions.js';

type TrapAction = 'RESUME' | 'DEMOLISH' | 'PAUSE';

type TrapArg = Roots | TrapConfig | TrapAction;

export const focusTrap = (arg: TrapArg) => {
  const result =
    typeof arg === 'string'
      ? arg === 'DEMOLISH'
        ? demolish()
        : arg === 'RESUME'
        ? resume()
        : pause()
      : build(Array.isArray(arg) ? { roots: arg } : arg);

  if (result.isErr) throwInEnv(result.error);
};

export type { TrapArg, Roots, TrapConfig, TrapAction };
