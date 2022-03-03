import { useCallback, useEffect, useRef, useState } from 'react';

type FocusableElementRef = HTMLElement | SVGElement | null;

type FocusableElementIdentifier = string | FocusableElementRef;

type ActionsOnTrappedElement = 'CLICK' | 'FOCUS';

interface Escaper {
  keepTrap?: boolean;
  custom?: Function;
  identifier?: FocusableElementIdentifier;
  polite?: boolean;
}

export interface TrapConfig {
  trapRoot: string | HTMLElement;
  initialFocus?: FocusableElementIdentifier;
  returnFocus?: FocusableElementIdentifier;
  locker?: boolean | Function;
  escaper?: Escaper;
}

const focusable =
  'a[href], button, input, select, textarea, [tabindex], audio[controls], video[controls], [contenteditable]:not([contenteditable="false"]), details>summary:first-of-type, details';

export function useSimpleFocusTrap({ trapRoot, initialFocus, returnFocus, locker, escaper }: TrapConfig) {
  const rootRef = useRef<HTMLElement | null>(null);
  const observerRef = useRef<MutationObserver | null>(null);
  const returnFocusRef = useRef<FocusableElementRef>(null);
  const focusHasBeenReturnedRef = useRef(false);
  const [firstTabbable, setFirstTabbable] = useState<FocusableElementRef>(null);
  const [lastTabbable, setLastTabbable] = useState<FocusableElementRef>(null);
  const [updateSubtree, setUpdateSubtree] = useState(false);

  // Handler for clicks happening on nodes not belonging to the trap's root.
  const outsideClicksHandler = useCallback((event: MouseEvent) => {
    if (rootRef.current?.contains(event.target as Node)) {
      if (locker instanceof Function) locker(event);
      else if (locker) event.stopImmediatePropagation();
    }
  }, []);

  // Utility function used to click or focus an element contained in the trap.
  // It returns either undefined or whehter the focus action was successful.
  const clickOrFocusTrappedElement = useCallback(
    (id: FocusableElementIdentifier = null, action: ActionsOnTrappedElement) => {
      const element = typeof id === 'string' ? (document.getElementById(id) as FocusableElementRef) : id;
      if (rootRef.current?.contains(element)) {
        if (action === 'CLICK' && element instanceof HTMLElement) element.click();
        else if (action === 'FOCUS' && element) {
          element.focus();
          return element === document.activeElement;
        }
      }
    },
    []
  );

  // Function returning the first and last tabbable within a nodeList of focusable elements.
  const getFirstAndLastTabbableInNodeList = useCallback((nodeList: NodeListOf<HTMLElement | SVGElement>) => {
    // Helper function checking edge cases.
    const isActuallyFocusable = (candidate: HTMLElement | SVGElement) => {
      if (
        // If the element is missing a layout box (eg, it has `display: "none"`);
        !candidate.getClientRects().length ||
        // if the element is disabled or hidden;
        (candidate as any).disabled ||
        getComputedStyle(candidate).visibility === 'hidden' ||
        (candidate instanceof HTMLInputElement && candidate.type === 'hidden') ||
        // if it is a <details> with a <summary> (the summary will get the focus instead of the details);
        (candidate.tagName === 'DETAILS' &&
          Array.prototype.slice.apply(candidate.children).some((child) => child.tagName === 'SUMMARY'))
      ) {
        // consider the element not focusable.
        return false;
      }
      // Elements that are descendant of a closed <details> should not be considered focusable,
      // uless they are the first <summary> in a closed <details> which is not nested in a closed <details>.
      const matches =
        Element.prototype.matches ||
        Element.prototype.msMatchesSelector ||
        Element.prototype.webkitMatchesSelector;
      const isDirectSummary = matches.call(candidate, 'details>summary:first-of-type');
      const nodeUnderDetails = isDirectSummary ? candidate.parentElement : candidate;
      if (matches.call(nodeUnderDetails, 'details:not([open]) *')) {
        return false;
      }
      // Form fields in a disabled <fieldset> are not focusable unless they are
      // in the first <legend> element of the top-most disabled <fieldset>.
      if (/^(INPUT|BUTTON|SELECT|TEXTAREA)$/.test(candidate.tagName)) {
        let parentNode = candidate as FocusableElementRef;
        while ((parentNode = parentNode!.parentElement)) {
          // If `candidate` is nested in a disabled <fieldset>
          if (parentNode.tagName === 'FIELDSET' && (parentNode as any).disabled) {
            for (let i = 0; i < parentNode!.children.length; i++) {
              // containing a <legend>,
              if (parentNode!.children.item(i)?.tagName === 'LEGEND') {
                // check whether the disabled <fieldset> is nested in another disabled <fieldset>.
                while ((parentNode = parentNode!.parentElement)) {
                  if (parentNode.tagName === 'FIELDSET' && (parentNode as any).disabled) {
                    // It's nested, so `candidate` is not focusable.
                    return false;
                  }
                  // It's the top-most one, so return whether `candidate` is in its <legend>.
                  return parentNode.children.item(i)!.contains(candidate);
                }
              }
            }
            return false; // `candidate` is nested in <fieldset> with no <legend>/
          }
        }
      }
      // Consider any other `candidate` as being actually focusable.
      return true;
    };

    // Little utility that explicitly sets a tabIndex for elements that
    // are not treated consistently (in matter of tabIndexes) across browsers.
    const getTabIndex = (node: HTMLElement | SVGElement) => {
      if (
        node.tabIndex === 0 ||
        (/^(AUDIO|VIDEO|DETAILS)$/.test(node.tagName) && node.getAttribute('tabindex') === null) ||
        (node instanceof HTMLElement && node.isContentEditable)
      ) {
        return 0;
      } else if (node.tabIndex > 0) return node.tabIndex;
      else return -1;
    };

    // firstTabbable will be one of the following two:
    let firstMinPositiveTabIndex = null as FocusableElementRef;
    let firstZeroTabIndex = null as FocusableElementRef;
    // lastTabbable will be one of the following two:
    let lastMaxPositiveTabIndex = null as FocusableElementRef;
    let lastZeroTabIndex = null as FocusableElementRef;
    const len = nodeList.length;
    for (let i = 0; i < len; i++) {
      const left = nodeList[i];
      const right = nodeList[len - 1 - i];
      const leftTabIndex = getTabIndex(left);
      const rightTabIndex = getTabIndex(right);
      if (leftTabIndex === 0) {
        if (!firstZeroTabIndex && !firstMinPositiveTabIndex && isActuallyFocusable(left)) {
          firstZeroTabIndex = left;
        }
      } else if (leftTabIndex > 0) {
        if (
          (!firstMinPositiveTabIndex || firstMinPositiveTabIndex.tabIndex > leftTabIndex) &&
          isActuallyFocusable(left)
        ) {
          firstMinPositiveTabIndex = left;
        }
      }
      if (rightTabIndex === 0) {
        if (!lastZeroTabIndex && isActuallyFocusable(right)) lastZeroTabIndex = right;
      } else if (rightTabIndex > 0) {
        if (
          !lastZeroTabIndex &&
          (!lastMaxPositiveTabIndex || lastMaxPositiveTabIndex.tabIndex < rightTabIndex)
        ) {
          lastMaxPositiveTabIndex = right;
        }
      }
    }
    return {
      first: firstMinPositiveTabIndex || firstZeroTabIndex,
      last: lastZeroTabIndex || lastMaxPositiveTabIndex,
    };
  }, []);

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
      // Start to watch for changes being made to the subtree of the root element.
      observerRef.current = new MutationObserver(() => setUpdateSubtree((state) => !state));
      observerRef.current.observe(rootRef.current, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['disabled', 'type', 'open', 'style'],
      });
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

  // Update firstTabbable and lastTabbable whenever the root's subtree changes.
  useEffect(() => {
    const nodeListOfFocusable = rootRef.current!.querySelectorAll<HTMLElement | SVGElement>(focusable);
    const { first, last } = getFirstAndLastTabbableInNodeList(nodeListOfFocusable);
    setFirstTabbable(first);
    setLastTabbable(last);
  }, [updateSubtree]);

  // Whenever one of first/lastTabbable changes, redefine the trap's behaviour.
  useEffect(() => {
    if (firstTabbable) {
      // Handler for keybord events.
      const keyboardNavigationHandler = (event: KeyboardEvent) => {
        if (event.key === 'Tab' || event.keyCode === 9) {
          // Little helper funciton.
          const forceFocusFromAToB = (a: FocusableElementRef, b: FocusableElementRef) => {
            if (document.activeElement === a) {
              event.preventDefault();
              b!.focus();
            }
          };
          event.shiftKey
            ? forceFocusFromAToB(firstTabbable, lastTabbable)
            : forceFocusFromAToB(lastTabbable, firstTabbable);
        } else if (event.key === 'Escape' || event.key === 'Esc' || event.keyCode === 27) {
          const { keepTrap, custom, identifier, polite } = escaper || {};
          if (custom) custom();
          if (identifier) clickOrFocusTrappedElement(identifier, polite ? 'FOCUS' : 'CLICK');
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
