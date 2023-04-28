import { throwInEnv } from './exceptions.js';
import { Roots, TrapConfig } from './state.js';
import { build, resume, demolish, pause } from './trap-actions.js';

export const focusTrap = (arg: Roots | TrapConfig | 'RESUME' | 'DEMOLISH' | 'PAUSE') => {
  const result =
    typeof arg === 'string'
      ? arg === 'RESUME'
        ? resume()
        : arg === 'DEMOLISH'
        ? demolish()
        : pause()
      : build(Array.isArray(arg) ? { roots: arg } : arg);

  if (result.isErr) throwInEnv(result.error);
};
