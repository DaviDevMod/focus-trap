import { EventHandler, useCallback, useEffect, useRef } from 'react';

import { FocusableElementRef, TrapBoundaries, TrapConfig } from './types';

import { isMutationAffectingTabbability, clickOrFocusDescendant, updateTrap, forceFocus } from './utils';

export function useSimpleFocusTrap({ trapRoot, initialFocus, returnFocus, locker, escaper }: TrapConfig = {}) {
  const rootRef = useRef<HTMLElement | null>(null);
  const observerRef = useRef<MutationObserver | null>(null);
  const returnFocusRef = useRef<FocusableElementRef>(null);
  const focusHasBeenReturnedRef = useRef(false);
  const trapBoundariesRef = useRef<TrapBoundaries>({
    firstTabbable: null,
    lastTabbable: null,
    lastMaxPositiveTabIndex: null,
    firstZeroTabIndex: null,
  });

  // Handler for clicks happening on nodes not belonging to the trap's root.
  const outsideClicksHandler = useCallback((event: MouseEvent | TouchEvent) => {
    // `if (!rootRef.current?.contains(event.target as Node))` may be something to consider.
    if (event.target instanceof Node && !rootRef.current?.contains(event.target)) {
      if (locker instanceof Function) locker(event);
      else if (locker) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    }
  }, []);

  // Handler for keybord events.
  const keyboardNavigationHandler = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Tab' || event.keyCode === 9) {
      forceFocus(event, trapBoundariesRef);
    } else if (event.key === 'Escape' || event.key === 'Esc' || event.keyCode === 27) {
      const { keepTrap, custom, identifier, focus } = escaper || {};
      if (custom) custom();
      if (identifier) clickOrFocusDescendant(rootRef.current, identifier, focus ? 'FOCUS' : 'CLICK');
      if (!keepTrap) eventListeners('REMOVE');
    }
  }, []);

  // Funtion that sets and removes event listeners.
  const eventListeners = useCallback((action: 'SET' | 'REMOVE') => {
    const handlers: [keyof DocumentEventMap, EventHandler<any>][] = [
      ['keydown', keyboardNavigationHandler],
      ['mousedown', outsideClicksHandler],
      ['touchstart', outsideClicksHandler],
      ['click', outsideClicksHandler],
    ];
    if (action === 'SET') {
      // In TS the spread operator can only be used if all the parameters are optional. It could be possible
      // an implementation for required parameters provided as spread of fixed lenght tuples, but it has not
      // been implemented yet: https://github.com/Microsoft/TypeScript/issues/4130#issuecomment-303486552
      for (const handler of handlers) document.addEventListener(handler[0], handler[1], true);
    } else {
      for (const handler of handlers) document.removeEventListener(handler[0], handler[1], true);
    }
  }, []); // End of eventHandlers().

  // Callback for MutationObserver's constructor. It just calls updateTrap() when required.
  const mutationCallback: MutationCallback = useCallback((records) => {
    const { firstTabbable, lastTabbable, lastMaxPositiveTabIndex } = trapBoundariesRef.current;
    if (__DEV__) {
      if (!trapBoundariesRef.current.firstTabbable) {
        throw new Error('Looks like there are no tabbable elements in the trap');
      }
    }
    if (!firstTabbable || !lastTabbable) return;
    let i = records.length;
    while (i--) {
      const record = records[i];
      if (isMutationAffectingTabbability(record)) {
        // If there are no positive tab indexes in the trap and the mutation doesn't concern tab indexes,
        // it is possible to ignore mutations on inner elements.
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
            return updateTrap(rootRef.current!, trapBoundariesRef, initialFocus);
          }
        } else return updateTrap(rootRef.current!, trapBoundariesRef, initialFocus);
      }
    }
  }, []);

  // Build the trap when mounting the hook and demolish it when unmounting.
  useEffect(() => {
    // Get the trap's root node.
    rootRef.current = typeof trapRoot === 'string' ? document.getElementById(trapRoot) : trapRoot || null;
    if (__DEV__) {
      if (!rootRef.current) throw new Error('The provided trapRoot does not reference any existing DOM node');
    }
    if (rootRef.current) {
      // Store a reference to either the provided `returnFocus` or the current `activeElement`.
      returnFocusRef.current = returnFocus
        ? typeof returnFocus === 'string'
          ? document.getElementById(returnFocus)
          : returnFocus
        : (document.activeElement as FocusableElementRef);
      // Update the trap's boundaries and set the initial focus.
      updateTrap(rootRef.current, trapBoundariesRef, initialFocus);
      // Start to watch for changes being made to the subtree of the root element.
      observerRef.current = new MutationObserver(mutationCallback);
      observerRef.current.observe(rootRef.current, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['disabled', 'type', 'open', 'style', 'tabindex'],
        attributeOldValue: true,
      });
      // Handle keyboard navigation inside of the trap and clicks outside of the trap.
      eventListeners('SET');
      // Remove listeners, disconnect observer and return focus when the hook unmounts.
      return () => {
        eventListeners('REMOVE');
        observerRef.current?.disconnect();
        if (!focusHasBeenReturnedRef.current) returnFocusRef.current?.focus();
      };
    }
  }, []);

  if (__DEV__) {
    return {
      trapRoot: rootRef.current,
      returnFocus: returnFocusRef.current,
      ...trapBoundariesRef.current,
    };
  }
}
