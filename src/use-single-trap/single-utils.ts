import { FocusableElementRef, TrapRefs } from '../types';

// String used to query all the focusable elements within the trap.
const focusable =
  'a[href], button, input, select, textarea, [tabindex], audio[controls], video[controls], [contenteditable]:not([contenteditable="false"]), details>summary:first-of-type, details';

// MutationObserver has to watch the entire `style` to know if `visibility` or `display` mutates,
// but recomputing the trap's boundaries at every style change would indeed be inefficient.
export function isMutationAffectingTabbability(record: MutationRecord) {
  if (record.attributeName === 'style') {
    return (
      (record.target as any).style?.visibility === 'hidden' ||
      /^(none|contents)$/.test((record.target as any).style?.display) ||
      /visibility: hidden|display: (none|contents)/.test(record.oldValue || '')
    );
  } else return true;
}

// <details>, <audio controls> e <video controls> get a default `tabIndex` of -1 in Chrome, yet they are
// still part of the regular tab order. Also browsers do not return `tabIndex` correctly for `contentEditable`
// nodes. In these cases the `tabIndex` is assumed to be 0 if it's not specifically set to a valid value.
const getConsistentTabIndex = (node: HTMLElement | SVGElement) =>
  (/^(AUDIO|VIDEO|DETAILS)$/.test(node.tagName) || (node as any).isContentEditable) &&
  isNaN(parseInt(node.getAttribute('tabindex')!, 10))
    ? 0
    : -1;

// Function testing various edge cases. Returns `true` if `candidate` is actually focusable.
const isActuallyFocusable = (candidate: HTMLElement | SVGElement) => {
  if (
    // If the element is missing a layout box (eg, it has `display: "none"`);
    !candidate.getClientRects().length ||
    // or is disabled or hidden;
    (candidate as any).disabled ||
    getComputedStyle(candidate).visibility === 'hidden' ||
    (candidate instanceof HTMLInputElement && candidate.type === 'hidden') ||
    // or a <details> with a <summary> (the summary gets the focus instead of the details);
    (candidate.tagName === 'DETAILS' &&
      Array.prototype.slice.apply(candidate.children).some((child) => child.tagName === 'SUMMARY'))
  ) {
    return false;
  }
  // Elements that are descendant of a closed <details> should not be considered focusable,
  // the only exception is the first <summary> of the top-most closed <details>.
  const matches = Element.prototype.matches || Element.prototype.webkitMatchesSelector;
  const isDirectSummary = matches.call(candidate, 'details>summary:first-of-type');
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
  return true;
}; // End of isActuallyFocusable().

// Function computing the trap's boundaries and bringing focus inside of the trap (if not there yet).
// It is optimized to run `isActuallyFocusable` the least amount of times possible.
export function updateTrap(
  root: HTMLElement,
  trapRefs: React.MutableRefObject<TrapRefs>,
  initialFocus: FocusableElementRef = null
) {
  const focusables = root.querySelectorAll<HTMLElement | SVGElement>(focusable);
  let firstMinPositiveTabIndex = null as FocusableElementRef;
  let lastMaxPositiveTabIndex = null as FocusableElementRef;
  let firstZeroTabIndex = null as FocusableElementRef;
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
      if (!lastZeroTabIndex && isActuallyFocusable(right)) {
        lastZeroTabIndex = right;
      }
    } else if (rightTabIndex > 0) {
      if (!lastMaxPositiveTabIndex || lastMaxPositiveTabIndex.tabIndex < right.tabIndex) {
        lastMaxPositiveTabIndex = right;
      }
    }
  }

  trapRefs.current = {
    mutationObserver: trapRefs.current.mutationObserver,
    firstTabbable: firstMinPositiveTabIndex || firstZeroTabIndex,
    lastTabbable: lastZeroTabIndex || lastMaxPositiveTabIndex,
    lastMaxPositiveTabIndex,
    firstZeroTabIndex,
  };

  if (process.env.NODE_ENV === 'development') {
    if (!trapRefs.current.firstTabbable) {
      throw new Error('It looks like there are no tabbable elements in the trap');
    }
  }

  // If the focus is not in the trap, give focus to either `initialFocus` or `firstTabbable`.
  // TODO: This behaviour may be undesired. Consider adding logic.
  if (!root.contains(document.activeElement)) {
    initialFocus?.focus();
    if (document.activeElement !== initialFocus) trapRefs.current.firstTabbable?.focus();
  }
} // End of updateTrap().

// Little helper function telling whether `element` is a radio input.
const isRadioInput = (element: unknown): element is HTMLInputElement =>
  element instanceof HTMLInputElement && element.type === 'radio';

// Function that manages the tabbing, also leaving it up to the browser if it's safe to do so.
export function assistTabbing(event: KeyboardEvent, trapRefs: React.MutableRefObject<TrapRefs>) {
  const { target, shiftKey } = event;
  const { firstTabbable, lastTabbable, lastMaxPositiveTabIndex, firstZeroTabIndex } = trapRefs.current;

  if (!firstTabbable || !lastTabbable) return;

  // `to` is the destination of the assisted tabbing.
  let to = null as FocusableElementRef;

  // Funtion telling whether `target` requires assisted tabbing.
  const isAssistedTabbingRequired = (boundary: HTMLElement | SVGElement, comparison?: number) =>
    // If `target` is the givem trap's `boundary`,
    target === boundary ||
    // or a radio input belonging to the same radio group `boundary` belongs to,
    (isRadioInput(target) && isRadioInput(boundary) && target.name === boundary.name) ||
    // or if it either precedes `firstTabbable` or succeeds `lastTabbable` (only one of the two is checked).
    // BUG: compareDocumentPossition doesn't take in consideration tabindexes in the comparison, so this works only
    // as long as there no positive tabindexes. compare with top and bottom tabbables rather thatn first and last.
    !!(comparison && boundary.compareDocumentPosition(target as Node) & comparison);

  if (shiftKey) {
    if (isAssistedTabbingRequired(firstTabbable, 3)) to = lastTabbable;
    else if (firstZeroTabIndex && isAssistedTabbingRequired(firstZeroTabIndex)) to = lastMaxPositiveTabIndex;
  } else {
    if (isAssistedTabbingRequired(lastTabbable, 5)) to = firstTabbable;
    else if (lastMaxPositiveTabIndex && isAssistedTabbingRequired(lastMaxPositiveTabIndex)) to = firstZeroTabIndex;
  }

  if (to) {
    // Force the focus to either:
    event.preventDefault();
    // the checked radio button belonging to the same group `to` belongs to,
    if (isRadioInput(to) && !to.checked) {
      (document.querySelector('input[name=' + to.name + ']:checked') as FocusableElementRef)?.focus();
    } else to.focus(); // or simply `to`.
  }
} // End of forceFocus();
