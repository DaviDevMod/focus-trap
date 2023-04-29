import { throwInEnv } from './exceptions.js';
import { Roots, TrapConfig } from './state.js';
import { build, resume, demolish, pause } from './trap-actions.js';

type LiteralTrapAction = 'RESUME' | 'DEMOLISH' | 'PAUSE';

type TrapAction = Roots | TrapConfig | LiteralTrapAction;

export const focusTrap = (arg: TrapAction) => {
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

export type { Roots, TrapConfig, LiteralTrapAction, TrapAction };
