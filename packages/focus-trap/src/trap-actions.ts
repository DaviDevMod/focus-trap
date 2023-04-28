import { Result, err, ok } from 'true-myth/result';
import { Unit } from 'true-myth/unit';

import { Focusable, TrapConfig, state, reducers } from './state.js';
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

  const firstZero = firstOrLastZeroTabbable(state.normalisedConfig!.roots, 'FIRST');

  if (firstZero) return ok(firstZero);

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

  return err('Cannot resume inexistent trap.');
};

export const demolish = (isEsc?: boolean): Result<Unit, string> => {
  if (state.isBuilt || isEsc) {
    reducers.switchIsBuilt(false);

    state.normalisedConfig?.returnFocus?.focus();

    return pause(isEsc);
  }

  return err('Cannot demolish inexistent trap.');
};

export const pause = (isEsc?: boolean): Result<Unit, string> => {
  if (state.isBuilt || isEsc) {
    eventListeners('REMOVE');

    return ok();
  }

  return err('Cannot pause inexistent trap.');
};
