import { state, reducers } from './state.js';
import { isFocusable } from './tabbability.js';
import { getDestination } from './destination.js';
import { demolish } from './trap-actions.js';

const handleOutsideClick = (event: Event): void => {
  if (state.normalisedConfig?.roots?.every((root) => !root.contains(event.target as Node))) {
    event.preventDefault();
    event.stopImmediatePropagation();
  }
};

const handleKeyPress = (event: KeyboardEvent): void => {
  if (event.key === 'Tab' || event.keyCode === 9) {
    const { target, shiftKey } = event;

    if (!isFocusable(target)) return;

    const rootsUpdate = reducers.updateRoots();

    if (rootsUpdate.isErr) throw new Error(rootsUpdate.error);

    const destination = getDestination(state.normalisedConfig!.roots, target, shiftKey ? 'BACKWARD' : 'FORWARD');

    if (destination.isErr) throw new Error(destination.error);

    if ('focus' in destination.value) {
      event.preventDefault();
      destination.value.focus();
    }
  } else if (event.key === 'Escape' || event.key === 'Esc' || event.keyCode === 27) {
    if (state.normalisedConfig?.escape) demolish(true);
  }
};

export const eventListeners = (action: 'ADD' | 'REMOVE'): void => {
  const listenerActions = {
    ADD: 'addEventListener' as keyof Document,
    REMOVE: 'removeEventListener' as keyof Document,
  };

  (document[listenerActions[action]] as Function)('keydown', handleKeyPress, true);

  if (state.normalisedConfig?.lock) {
    for (const event of ['mousedown', 'touchstart', 'click']) {
      (document[listenerActions[action]] as Function)(
        event,
        state.normalisedConfig.lock === true ? handleOutsideClick : state.normalisedConfig.lock,
        true
      );
    }
  }
};
