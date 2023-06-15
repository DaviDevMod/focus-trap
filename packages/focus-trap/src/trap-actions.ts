import type { Unit } from 'true-myth/unit';
import type { Result } from 'true-myth/result';
import { err } from 'true-myth/result';

import type { TrapConfig } from './state.js';
import { state, reducers } from './state.js';
import { eventListeners } from './events.js';
import { getInitialFocus } from './destination.js';

export const build = (rawConfig: TrapConfig): Result<Unit, string> => {
  if (state.isBuilt) eventListeners('REMOVE');

  const setConfig = reducers.setConfig(rawConfig);

  if (setConfig.isErr) return err(setConfig.error);

  // There must be a config, otherwise an error would have been thrown.
  const initialFocus = getInitialFocus(state.normalisedConfig!);

  if (initialFocus.isErr) return err(initialFocus.error);

  if ('focus' in initialFocus.value) initialFocus.value.focus();

  reducers.switchIsBuilt(true);

  return resume();
};

export const resume = (): Result<Unit, string> => {
  if (state.isBuilt) return eventListeners('ADD');

  return err('Cannot "RESUME" inexistent trap.');
};

export const demolish = (): Result<Unit, string> => {
  if (state.isBuilt) {
    state.normalisedConfig?.returnFocus?.focus();

    if (pause().isOk) return reducers.switchIsBuilt(false);
  }

  return err('Cannot "DEMOLISH" inexistent trap.');
};

export const pause = (): Result<Unit, string> => {
  if (state.isBuilt) return eventListeners('REMOVE');

  return err('Cannot "PAUSE" inexistent trap.');
};
