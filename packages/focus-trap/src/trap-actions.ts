import type { Unit } from 'true-myth/unit';
import type { Result } from 'true-myth/result';
import { ok, err } from 'true-myth/result';

import type { Focusable, TrapConfig } from './state.js';
import { state, reducers } from './state.js';
import { eventListeners } from './events.js';
import { positiveTabbables, firstOrLastZeroTabbable } from './destination.js';

const getInitialFocus = (): Result<Focusable | Unit, string> => {
  const initialFocus = state.normalisedConfig?.initialFocus;

  if (initialFocus === false) return ok();

  if (initialFocus instanceof Element) return ok(initialFocus);

  // As long as `getInitialFocus` is called after `setConfig` (and the eventual error is handled)
  // there is no need to `updateRoots` and `normalisedConfig` is granted to exists.
  const positives = positiveTabbables(state.normalisedConfig!.roots);

  if (positives.length) return ok(positives[0]);

  const firstOrLastZeroInTrap = firstOrLastZeroTabbable(state.normalisedConfig!.roots);

  if (firstOrLastZeroInTrap) return ok(firstOrLastZeroInTrap);

  return err('There are no tabbable elements in the focus trap.');
};

export const build = (rawConfig: TrapConfig): Result<Unit, string> => {
  if (state.isBuilt) eventListeners('REMOVE');

  const config = reducers.setConfig(rawConfig);

  if (config.isErr) return err(config.error);

  reducers.switchIsBuilt(true);

  const initialFocus = getInitialFocus();

  if (initialFocus.isErr) return err(initialFocus.error);

  if ('focus' in initialFocus.value) initialFocus.value.focus();

  return resume();
};

export const resume = (): Result<Unit, string> => {
  if (state.isBuilt) {
    eventListeners('ADD');

    return ok();
  }

  return err('Cannot "RESUME" inexistent trap.');
};

export const demolish = (isEsc?: boolean): Result<Unit, string> => {
  if (state.isBuilt || isEsc) {
    state.normalisedConfig?.returnFocus?.focus();

    if (pause(isEsc).isOk) {
      reducers.switchIsBuilt(false);

      return ok();
    }
  }

  return err('Cannot "DEMOLISH" inexistent trap.');
};

export const pause = (isEsc?: boolean): Result<Unit, string> => {
  if (state.isBuilt || isEsc) {
    eventListeners('REMOVE');

    return ok();
  }

  return err('Cannot "PAUSE" inexistent trap.');
};
