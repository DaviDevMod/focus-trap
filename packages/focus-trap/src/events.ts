import { state, reducers, Focusable } from './state.js';
import { getDestination } from './destination.js';
import { demolish } from './trap-actions.js';

const handleOutsideClick = (event: Event): void => {
  if (state.normalisedConfig?.roots?.every((root) => !root.contains(event.target as Node))) {
    event.preventDefault();
    event.stopImmediatePropagation();
  }
};

const handleKeyPress = (event: KeyboardEvent): void => {
  if (event.key === 'Escape' || event.key === 'Esc') {
    if (state.normalisedConfig?.escape) demolish();
    return;
  }

  if (event.key !== 'Tab') return;

  const { target, shiftKey } = event;

  const rootsUpdate = reducers.updateRoots();

  if (rootsUpdate.isErr) throw new Error(rootsUpdate.error);

  const destination = getDestination(
    state.normalisedConfig!.roots,
    target as Focusable,
    shiftKey ? 'BACKWARD' : 'FORWARD'
  );

  if (destination.isErr) throw new Error(destination.error);

  if ('focus' in destination.value) {
    event.preventDefault();
    destination.value.focus();
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
      (document[listenerActions[action]] as Function)(event, handleOutsideClick, true);
    }
  }
};
