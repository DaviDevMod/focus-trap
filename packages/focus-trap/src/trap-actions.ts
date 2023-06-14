import type { Unit } from 'true-myth/unit';
import type { Result } from 'true-myth/result';
import { ok, err } from 'true-myth/result';

import type { Focusable, TrapConfig } from './state.js';
import { state, reducers } from './state.js';
import { eventListeners } from './events.js';
import { isFocusable } from './normalise.js';
import { nextPositiveOrVeryFirstOrVeryLastTabbable } from './destination.js';

const getInitialFocus = (): Result<Focusable | Unit, string> => {
  const initialFocus = state.normalisedConfig?.initialFocus;

  if (initialFocus === false) return ok();

  if (isFocusable(initialFocus)) return ok(initialFocus);

  // As long as `getInitialFocus` is called right after a successful `setConfig`
  // `normalisedConfig` is granted to exists.
  return nextPositiveOrVeryFirstOrVeryLastTabbable(state.normalisedConfig!.roots);
};

export const build = (rawConfig: TrapConfig): Result<Unit, string> => {
  if (state.isBuilt) eventListeners('REMOVE');

  const setConfig = reducers.setConfig(rawConfig);

  if (setConfig.isErr) return err(setConfig.error);

  const initialFocus = getInitialFocus();

  if (initialFocus.isErr) return err(initialFocus.error);

  if ('focus' in initialFocus.value) initialFocus.value.focus();

  reducers.switchIsBuilt(true);

  return resume();
};

export const resume = (): Result<Unit, string> => {
  if (state.isBuilt) {
    eventListeners('ADD');

    return ok();
  }

  return err('Cannot "RESUME" inexistent trap.');
};

export const demolish = (): Result<Unit, string> => {
  if (state.isBuilt) {
    state.normalisedConfig?.returnFocus?.focus();

    if (pause().isOk) {
      reducers.switchIsBuilt(false);

      return ok();
    }
  }

  return err('Cannot "DEMOLISH" inexistent trap.');
};

export const pause = (): Result<Unit, string> => {
  if (state.isBuilt) {
    eventListeners('REMOVE');

    return ok();
  }

  return err('Cannot "PAUSE" inexistent trap.');
};
