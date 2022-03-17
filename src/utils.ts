import { FocusableElementRef, FocusableElementIdentifier, TrapBoundaries } from './types';

// String used to query all the focusable elements within the trap.
const focusable =
  'a[href], button, input, select, textarea, [tabindex], audio[controls], video[controls], [contenteditable]:not([contenteditable="false"]), details>summary:first-of-type, details';

// MutationObserver has to observe the whole style of an element to know if `visibility` or
// `display` is mutating, but updating the trap at every style change would be inefficient.
export function isMutationAffectingTabbability(record: MutationRecord) {
  if (record.attributeName === 'style') {
    return (
      (record.target as any).style?.visibility === 'hidden' ||
      /^(none|contents)$/.test((record.target as any).style?.display) ||
      /visibility: hidden|display: (none|contents)/.test(record.oldValue || '')
    );
  } else return true;
}

// Utility function used to click or focus an element contained in the trap.
// It returns either undefined or whehter the element referenced by `id` got focused.
export function clickOrFocusDescendant(
  root: HTMLElement | null,
  id: FocusableElementIdentifier,
  action: 'CLICK' | 'FOCUS'
) {
  if (__DEV__) {
    if (!root) throw new Error('The provided trapRoot does not reference any existing DOM node');
  }
  const element = typeof id === 'string' ? (document.getElementById(id) as FocusableElementRef) : id;
  if (root?.contains(element)) {
    if (action === 'CLICK' && element instanceof HTMLElement) element.click();
    else if (action === 'FOCUS' && element) {
      element.focus();
      return element === document.activeElement;
    }
  }
}

// Little utility returning a consistent tabIndexex for elements treated inconsistently.
const getConsistentTabIndex = (node: HTMLElement | SVGElement) =>
  (/^(AUDIO|VIDEO|DETAILS)$/.test(node.tagName) || (node as any).isContentEditable) &&
  isNaN(parseInt(node.getAttribute('tabindex')!, 10))
    ? 0
    : -1;

// Function checking edge cases. Returns `true` if the element is actually focusable.
const isActuallyFocusable = (candidate: HTMLElement | SVGElement) => {
  if (
    // If the element is missing a layout box (eg, it has `display: "none"`);
    !candidate.getClientRects().length ||
    // if the element is disabled or hidden;
    (candidate as any).disabled ||
    getComputedStyle(candidate).visibility === 'hidden' ||
    (candidate instanceof HTMLInputElement && candidate.type === 'hidden') ||
    // if it is a <details> with a <summary> (the summary gets the focus instead of the details);
    (candidate.tagName === 'DETAILS' &&
      Array.prototype.slice.apply(candidate.children).some((child) => child.tagName === 'SUMMARY'))
  ) {
    return false; // consider the element not focusable.
  }
  // Elements that are descendant of a closed <details> should not be considered focusable,
  // the only exception is the first <summary> of the top-most closed <details>.
  const matches =
    Element.prototype.matches || Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
  const isDirectSummary = matches.call(candidate, 'details>summary:first-of-type');
  // `nodeUnderDetails` is either `candidate` or a <details> whose first <summary> is `candidate`.
  const nodeUnderDetails = isDirectSummary ? candidate.parentElement : candidate;
  if (matches.call(nodeUnderDetails, 'details:not([open]) *')) {
    return false;
  }
  // Form fields in a disabled <fieldset> are not focusable unless they are
  // in the first <legend> element of the top-most disabled <fieldset>.
  if (/^(INPUT|BUTTON|SELECT|TEXTAREA)$/.test(candidate.tagName)) {
    let parentNode = candidate as FocusableElementRef;
    while ((parentNode = parentNode!.parentElement as FocusableElementRef)) {
      // If `candidate` is nested in a disabled <fieldset>
      if (parentNode.tagName === 'FIELDSET' && (parentNode as any).disabled) {
        for (let i = 0; i < parentNode.children.length; i++) {
          // having a <legend> as direct child,
          if (parentNode.children.item(i)?.tagName === 'LEGEND') {
            // If the <fieldset> is not nested in another disabled <fieldset>,
            // return whether `candidate` is a descendant of its first <legend>
            return matches.call(parentNode, 'fieldset[disabled] *')
              ? false
              : parentNode.children.item(i)!.contains(candidate);
          }
        }
        return false; // The disabled <fieldset> has no <legend>.
      }
    }
  }
  // Consider any other `candidate` as being actually focusable.
  return true;
}; // End of isActuallyFocusable().

// Function computing the trap's boundaries and bringing focus inside of the trap (if not there yet).
// It is optimized to run `isActuallyFocusable` the least amount of times possible.
export function updateTrap(
  root: HTMLElement,
  trapBoundariesRef: React.MutableRefObject<TrapBoundaries>,
  initialFocus: FocusableElementIdentifier = null
) {
  // Get all the focusable elements that are descendants of the trap's root node.
  const focusables = root.querySelectorAll<HTMLElement | SVGElement>(focusable);
  // firstTabbable will be one of the following two:
  let firstMinPositiveTabIndex = null as FocusableElementRef;
  let firstZeroTabIndex = null as FocusableElementRef;
  // lastTabbable will be one of the following two:
  let lastMaxPositiveTabIndex = null as FocusableElementRef;
  let lastZeroTabIndex = null as FocusableElementRef;
  const len = focusables.length;
  for (let i = 0; i < len; i++) {
    const left = focusables[i];
    const right = focusables[len - 1 - i];
    const leftTabIndex = left.tabIndex >= 0 ? left.tabIndex : getConsistentTabIndex(left);
    const rightTabIndex = right.tabIndex >= 0 ? right.tabIndex : getConsistentTabIndex(right);
    if (leftTabIndex === 0) {
      if (!firstZeroTabIndex && isActuallyFocusable(left)) {
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
      if (!lastMaxPositiveTabIndex || lastMaxPositiveTabIndex.tabIndex < right.tabIndex) {
        lastMaxPositiveTabIndex = right;
      }
    }
  }
  trapBoundariesRef.current = {
    firstTabbable: firstMinPositiveTabIndex || firstZeroTabIndex,
    lastTabbable: lastZeroTabIndex || lastMaxPositiveTabIndex,
    // The following two are needed in `forceFocus()` in case the trap contains a positive tabindex.
    lastMaxPositiveTabIndex,
    firstZeroTabIndex,
  };
  if (__DEV__) {
    if (!trapBoundariesRef.current.firstTabbable) {
      throw new Error('Looks like there are no tabbable elements in the trap');
    }
  }
  // If the current `activeElement` is not a descendant of the trap's root node,
  if (!root.contains(document.activeElement)) {
    // give focus to either `initialFocus` or `firstTabbable`.
    clickOrFocusDescendant(root, initialFocus, 'FOCUS') || trapBoundariesRef.current.firstTabbable?.focus();
  }
} // End of updateTrap().

// Little helper function telling whether `element` is a radio input.
const isRadioInput = (element: unknown): element is HTMLInputElement =>
  element instanceof HTMLInputElement && element.type === 'radio';

// Function that manages the tabbing, also leaving it up to the browser if it is safe to do so.
export function forceFocus(event: KeyboardEvent, trapBoundariesRef: React.MutableRefObject<TrapBoundaries>) {
  const { target, shiftKey } = event;
  const { firstTabbable, lastTabbable, lastMaxPositiveTabIndex, firstZeroTabIndex } = trapBoundariesRef.current;
  if (__DEV__) {
    if (!firstTabbable) throw new Error('Looks like there are no tabbable elements in the trap');
  }
  if (!firstTabbable || !lastTabbable) return;

  // `to` is the destination of the assisted, or forced, tabbing.
  let to = null as FocusableElementRef;

  // Funtion telling whether `target` requires assisted tabbing.
  const isForcedFocusRequired = (boundary: FocusableElementRef, comparison?: number) =>
    // If `target` is the givem `booundary`,
    target === boundary ||
    // or a radio input belonging to the same radio group `boundary` belongs to,
    (isRadioInput(target) && isRadioInput(boundary) && target.name === boundary.name) ||
    // or if it either precedes `firstTabbable` or succeeds `lastTabbable` (only one of the two is checked).
    !!(comparison && boundary!.compareDocumentPosition(target as Node) & comparison);

  if (shiftKey) {
    if (isForcedFocusRequired(firstTabbable, 3)) to = lastTabbable;
    else if (isForcedFocusRequired(firstZeroTabIndex)) to = lastMaxPositiveTabIndex;
  } else {
    if (isForcedFocusRequired(lastTabbable, 5)) to = firstTabbable;
    else if (isForcedFocusRequired(lastMaxPositiveTabIndex)) to = firstZeroTabIndex;
  }

  if (to) {
    // Force the focus to either:
    event.preventDefault();
    // the checked radio button belonging to the same group `to` belongs to,
    if (isRadioInput(to) && !to.checked) {
      (document.querySelector('input[name=' + to.name + ']:checked') as FocusableElementRef)?.focus();
    } else to.focus(); // or simply `to`.
  }
} // End of forceFocusFromAToB();
