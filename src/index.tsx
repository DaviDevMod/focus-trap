import { useCallback, useEffect, useRef, useState } from 'react';
import { tabbable, isFocusable, CheckOptions } from 'tabbable';

import {
  TrapConfig,
  FocusableElementRef,
  FocusableElementIdentifier,
  ActionsOnTrappedElement,
} from './types';

const tabbableOptions = { displayCheck: 'non-zero-area' } as CheckOptions;

function useSimpleFocusTrap(
  { trapRoot, escaper, initialFocus, returnFocus, locked, tabbableConfig }: TrapConfig = { trapRoot: '' }
) {
  const rootRef = useRef<HTMLElement | null>(null);
  const observerRef = useRef<MutationObserver | null>(null);
  const [childListUpdate, setChildListUpdeate] = useState(false);
  const returnFocusRef = useRef<FocusableElementRef>(null);
  const [firstTabbable, setFirstTabbable] = useState<FocusableElementRef>(null);
  const [lastTabbable, setLastTabbable] = useState<FocusableElementRef>(null);
  const focusHasBeenReturnedRef = useRef(false);

  // Handler for clicks happening on nodes not belonging to the trap's root.
  const outsideClicksHandler = useCallback((event: MouseEvent) => {
    if (rootRef.current?.contains(event.target as Node)) {
      if (locked instanceof Function) locked.bind(null, event);
      else if (locked) event.stopImmediatePropagation();
    }
  }, []);

  // Utility function used to click or focus an element contained in the trap.
  // It returns either undefined or whehter the focus action was successful.
  const clickOrFocusTrappedElement = useCallback(
    (id: FocusableElementIdentifier = null, action: ActionsOnTrappedElement) => {
      const element = typeof id === 'string' ? (document.getElementById(id) as FocusableElementRef) : id;
      if (rootRef.current?.contains(element) && isFocusable(element!, tabbableConfig || tabbableOptions)) {
        if (action === 'CLICK' && element instanceof HTMLElement) element.click();
        else if (action === 'FOCUS' && element) {
          element.focus();
          return element === document.activeElement;
        }
      }
    },
    []
  );

  // Build the trap when mounting the hook and demolish it when unmounting.
  useEffect(() => {
    // Get the trap's root node.
    rootRef.current = typeof trapRoot === 'string' ? document.getElementById(trapRoot) : trapRoot;
    if (rootRef.current) {
      // Store a reference to either the provided `returnFocus` or the current active element.
      returnFocusRef.current = returnFocus
        ? typeof returnFocus === 'string'
          ? document.getElementById(returnFocus)
          : returnFocus
        : (document.activeElement as FocusableElementRef);
      // Start to watch for changes being made to the childList of the root element.
      observerRef.current = new MutationObserver(() => setChildListUpdeate(state => !state));
      rootRef.current && observerRef.current.observe(rootRef.current, { childList: true });
      // Handle clicks outside of the trap.
      document.addEventListener('click', outsideClicksHandler);
      // Remove handler for outside clicks, disconnect observer and return focus when the hook unmounts.
      return () => {
        document.removeEventListener('click', outsideClicksHandler);
        observerRef.current?.disconnect();
        if (!focusHasBeenReturnedRef.current) returnFocusRef.current?.focus();
      };
    }
  }, []);

  // Update firstTabbable and lastTabbable whenever the root's childList changes.
  useEffect(() => {
    if (rootRef.current) {
      const tabbableInRoot = tabbable(rootRef.current, tabbableConfig || tabbableOptions);
      setFirstTabbable(tabbableInRoot[0]);
      setLastTabbable(tabbableInRoot[tabbableInRoot.length - 1]);
    }
  }, [childListUpdate]);

  useEffect(() => {
    if (firstTabbable) {
      // Handler for keybord events.
      const keyboardNavigationHandler = (event: KeyboardEvent) => {
        if (event.key === 'Tab' || event.keyCode === 9) {
          event.shiftKey
            ? document.activeElement === firstTabbable && (lastTabbable!.focus(), event.preventDefault())
            : document.activeElement === lastTabbable && (firstTabbable!.focus(), event.preventDefault());
        } else if (event.key === 'Escape' || event.key === 'Esc' || event.keyCode === 27) {
          if (!escaper) return;
          const { keepTrap, custom, identifier, beGentle } = escaper;
          if (custom) custom();
          if (identifier) clickOrFocusTrappedElement(identifier, beGentle ? 'FOCUS' : 'CLICK');
          if (!keepTrap) {
            observerRef.current?.disconnect();
            returnFocusRef.current?.focus();
            document.removeEventListener('click', outsideClicksHandler);
            document.removeEventListener('keydown', keyboardNavigationHandler);
            focusHasBeenReturnedRef.current = true;
          }
        }
      };
      // If the current active element is not a descendant of the trap's root node,
      // give focus to either initialFocus or firstTabbable.
      if (!rootRef.current?.contains(document.activeElement)) {
        clickOrFocusTrappedElement(initialFocus, 'FOCUS') || firstTabbable.focus();
      }
      // Handle keyboard navigation.
      document.addEventListener('keydown', keyboardNavigationHandler);
      return () => document.removeEventListener('keydown', keyboardNavigationHandler);
    }
  }, [firstTabbable, lastTabbable]);
}

export default useSimpleFocusTrap;
