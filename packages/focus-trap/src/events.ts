import type { Unit } from 'true-myth';
import type { Result } from 'true-myth/result';
import { ok } from 'true-myth/result';

import { state, reducers } from './state.js';
import { demolish } from './trap-actions.js';
import { isFocusable } from './normalise.js';
import { getDestination, getInitialFocus } from './destination.js';

const handleOutsideClick = (event: Event) => {
  if (state.normalisedConfig?.roots?.every((root) => !root.contains(event.target as Node))) {
    event.preventDefault();
    event.stopImmediatePropagation();
  }
};

const handleKeyPress = (event: KeyboardEvent) => {
  if ((event.key === 'Escape' || event.key === 'Esc') && state.normalisedConfig?.escape) demolish();

  if (event.key !== 'Tab') return;

  const { target, shiftKey } = event;

  const rootsUpdate = reducers.updateRoots();

  if (rootsUpdate.isErr) throw new Error(rootsUpdate.error);

  // There must be a config, otherwise an error would have been thrown.
  const config = state.normalisedConfig!;

  // Discussion https://github.com/DaviDevMod/focus-trap/issues/148
  const destination = isFocusable(target)
    ? getDestination(config.roots, target, !shiftKey)
    : /* istanbul ignore next */
      getInitialFocus(config);

  if (destination.isErr) throw new Error(destination.error);

  if ('focus' in destination.value) {
    event.preventDefault();
    destination.value.focus();
  }
};

export const eventListeners = (action: 'ADD' | 'REMOVE'): Result<Unit, never> => {
  const listenerActions = {
    ADD: 'addEventListener' as keyof Document,
    REMOVE: 'removeEventListener' as keyof Document,
  };

  (document[listenerActions[action]] as Function)('keydown', handleKeyPress, true);

  if (state.normalisedConfig?.lock) {
    for (const event of ['mousedown', 'touchstart', 'click']) {
      (document[listenerActions[action]] as Function)(event, handleOutsideClick, true);
    }
  }

  return ok();
};
