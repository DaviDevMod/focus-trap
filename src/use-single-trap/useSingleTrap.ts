import { useCallback, useEffect, useRef, useState } from '@react';
import { SingleTrapControllerArgs, TrapRefs, SingleTrapConfig } from '../types';
import { isMutationAffectingTabbability, updateTrap, assistTabbing } from './single-utils';

// A simple object would require some extra care every time it is used,
// as any change made to it would persist through distinct single-traps.
const initialTrapRefs = (): TrapRefs => ({
  mutationObserver: null,
  firstTabbable: null,
  lastTabbable: null,
  lastMaxPositiveTabIndex: null,
  firstZeroTabIndex: null,
});

function useSingleTrap(config: SingleTrapConfig, popConfig: () => SingleTrapConfig) {
  const [trapState, setTrapState] = useState(config);
  const { root, initialFocus, returnFocus, lock, escape } = trapState;
  const trapRefs = useRef(initialTrapRefs());

  // Handler for clicks happening on nodes not belonging to the trap's root.
  const outsideClicksHandler = useCallback(
    (event: MouseEvent | TouchEvent) => {
      // TODO: consider `if (!root.contains(event.target as Node))`
      if (event.target instanceof Node && !root.contains(event.target)) {
        if (lock instanceof Function) lock(event);
        else if (lock) {
          event.preventDefault();
          event.stopImmediatePropagation();
        }
      }
    },
    // In the rare case two subsequent traps in the `trapStack` have the same `root` and `lock`
    // it would be possible to not change the refence of this handler (using `[root, lock]` as dep array).
    // However getting different handlers for different traps is conceptually cleaner and it's even faster
    // as it makes possible to use a single object reference as dependency, making checks marginally quicker.
    // This reasoning applies to all the depenndency arrays of this hook (`useSingleTrap`).
    [trapState]
  );

  // Handler for keybord events.
  const keyboardNavigationHandler = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Tab' || event.keyCode === 9) {
        assistTabbing(event, trapRefs);
      } else if (event.key === 'Escape' || event.key === 'Esc' || event.keyCode === 27) {
        if (escape instanceof Function) return escape();
        if (escape !== false) setTrapState(popConfig());
      }
    },
    [trapState]
  );

  // Funtion that adds and removes event listeners.
  const eventListeners = (action: 'ADD' | 'REMOVE') => {
    const actionMap = {
      ADD: 'addEventListener' as keyof Document,
      REMOVE: 'removeEventListener' as keyof Document,
    };
    const handlers: [keyof DocumentEventMap, React.EventHandler<any>][] = [
      ['keydown', keyboardNavigationHandler],
      ['mousedown', outsideClicksHandler],
      ['touchstart', outsideClicksHandler],
      ['click', outsideClicksHandler],
    ];
    // In TS the spread operator can only be used if all the parameters are optional. It could be possible
    // an implementation for required parameters provided as spread of fixed lenght tuples, but it has not
    // been implemented yet: https://github.com/Microsoft/TypeScript/issues/4130#issuecomment-303486552
    for (const handler of handlers) (document[actionMap[action]] as Function)(handler[0], handler[1], true);
  };

  // Callback for MutationObserver's constructor. It just calls `updateTrap()` when required.
  const mutationCallback: MutationCallback = useCallback(
    (records) => {
      const { firstTabbable, lastTabbable, lastMaxPositiveTabIndex } = trapRefs.current;

      if (process.env.NODE_ENV === 'development') {
        if (!firstTabbable) {
          throw new Error('It looks like there are no tabbable elements in the trap');
        }
      }
      if (!firstTabbable || !lastTabbable) return;

      let i = records.length;
      while (i--) {
        const record = records[i];
        if (isMutationAffectingTabbability(record)) {
          // If there are no positive tab indexes in the trap and the mutation doesn't concern tab indexes,
          // it is possible to take into consideration only mutations occurring on outer elements.
          if (!lastMaxPositiveTabIndex && record.attributeName !== 'tabindex') {
            // If `record.target` precedes `firstTabbable` or succeeds `lastTabbable`,
            // or it is one of them, or one of their ancestors.
            if (
              record.target === firstTabbable ||
              record.target === lastTabbable ||
              firstTabbable.compareDocumentPosition(record.target) & 11 ||
              lastTabbable.compareDocumentPosition(record.target) & 13
            ) {
              // Update the trap and return from `mutationCallback`.
              return updateTrap(root, trapRefs, initialFocus);
            }
          } else return updateTrap(root, trapRefs, initialFocus);
        }
      }
    },
    [trapState]
  );

  const resumeTrap = () => {
    if (process.env.NODE_ENV === 'development') {
      if (!trapRefs.current.mutationObserver) throw new Error('Cannot resume inexistent trap.');
    }
    if (!trapRefs.current.mutationObserver) return;
    updateTrap(root, trapRefs, initialFocus);
    trapRefs.current.mutationObserver.observe(root, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['disabled', 'type', 'open', 'style', 'tabindex'],
      attributeOldValue: true,
    });
    eventListeners('ADD');
  };

  const buildTrap = () => {
    trapRefs.current.mutationObserver = new MutationObserver(mutationCallback);
    resumeTrap();
  };

  const pauseTrap = () => {
    if (process.env.NODE_ENV === 'development') {
      if (!trapRefs.current.mutationObserver) throw new Error('Cannot pause inexistent trap.');
    }
    if (!trapRefs.current.mutationObserver) return;
    eventListeners('REMOVE');
    trapRefs.current.mutationObserver.disconnect();
  };

  const demolishTrap = () => {
    pauseTrap();
    returnFocus?.focus();
  };

  // Whenever `trapState` changes demolish the trap and build a new one.
  useEffect(() => {
    if (trapState.stackIsEmpty) return;
    buildTrap();
    return () => demolishTrap();
  }, [trapState]);

  // TS doesn't narrow overloaded arguments yet: https://github.com/microsoft/TypeScript/issues/22609
  // So, instead of overloads, a discriminated uninon type is being used (`SingleTrapControllerArgs`).
  return ({ action, config }: SingleTrapControllerArgs) => {
    if (action === 'RESUME') return resumeTrap();
    if (action === 'PAUSE') return pauseTrap();
    trapRefs.current = initialTrapRefs();
    setTrapState(config);
  };
}

export default useSingleTrap;
