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
    // If the element has no layout boxes (eg, it has `display: "none"`);
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
  let topTabbable = null as FocusableElementRef;
  let bottomTabbable = null as FocusableElementRef;
  const len = focusables.length;

  for (let i = 0; i < len; i++) {
    const left = focusables[i];
    const right = focusables[len - 1 - i];
    const leftTabIndex = left.tabIndex >= 0 ? left.tabIndex : getConsistentTabIndex(left);
    const rightTabIndex = right.tabIndex >= 0 ? right.tabIndex : getConsistentTabIndex(right);
    if (leftTabIndex === 0) {
      if (!firstZeroTabIndex && isActuallyFocusable(left)) {
        firstZeroTabIndex = left;
        if (!topTabbable) topTabbable = left;
      }
    } else if (leftTabIndex > 0) {
      if (
        (!firstMinPositiveTabIndex || firstMinPositiveTabIndex.tabIndex > leftTabIndex) &&
        isActuallyFocusable(left)
      ) {
        firstMinPositiveTabIndex = left;
        if (!topTabbable) topTabbable = left;
      }
    }
    if (rightTabIndex === 0) {
      if (!lastZeroTabIndex && isActuallyFocusable(right)) {
        lastZeroTabIndex = right;
        if (!bottomTabbable) bottomTabbable = left;
      }
    } else if (rightTabIndex > 0) {
      if (!lastMaxPositiveTabIndex || lastMaxPositiveTabIndex.tabIndex < right.tabIndex) {
        lastMaxPositiveTabIndex = right;
        if (!bottomTabbable) bottomTabbable = left;
      }
    }
  }

  trapRefs.current = {
    mutationObserver: trapRefs.current.mutationObserver,
    firstTabbable: firstMinPositiveTabIndex ?? firstZeroTabIndex,
    lastTabbable: lastZeroTabIndex ?? lastMaxPositiveTabIndex,
    lastMaxPositiveTabIndex,
    firstZeroTabIndex,
    topTabbable,
    bottomTabbable,
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
    if (initialFocus && document.activeElement !== initialFocus) trapRefs.current.firstTabbable?.focus();
  }
} // End of updateTrap().

// Little helper function telling whether `element` is a radio input.
const isRadioInput = (element: unknown): element is HTMLInputElement =>
  element instanceof HTMLInputElement && element.type === 'radio';

// Function that manages the tabbing, also leaving it up to the browser if it's safe to do so.
export function assistTabbing(event: KeyboardEvent, trapRefs: React.MutableRefObject<TrapRefs>) {
  const { target, shiftKey } = event;
  const { firstTabbable, lastTabbable, lastMaxPositiveTabIndex, firstZeroTabIndex, topTabbable, bottomTabbable } =
    trapRefs.current;

  if (!firstTabbable || !lastTabbable || !topTabbable || !bottomTabbable) return;

  // `to` is the destination of the assisted tabbing.
  let to = null as FocusableElementRef;

  // Funtion telling whether `target` requires assisted tabbing.
  const isAssistedTabbingRequired = (
    boundary: HTMLElement | SVGElement,
    edge?: HTMLElement | SVGElement,
    comparison?: number
  ) =>
    // Return `true` if `target` is the givem trap's `boundary`,
    target === boundary ||
    // or a radio input belonging to the same radio group `boundary` belongs to,
    (isRadioInput(target) && isRadioInput(boundary) && target.name === boundary.name) ||
    // or if it either precedes `topTabbable` or succeeds `bottomTabbable` (only one of the two is checked).
    !!(comparison && edge!.compareDocumentPosition(target as Node) & comparison);

  if (shiftKey) {
    if (isAssistedTabbingRequired(firstTabbable, topTabbable, 3)) to = lastTabbable;
    // Should check `firstZeroTabIndex && lastMaxPositiveTabIndex`, but if there are no positive tab indexes
    // `firstZeroTabIndex` is also `firstTabbable` and the above `if` is entered.
    else if (firstZeroTabIndex && isAssistedTabbingRequired(firstZeroTabIndex)) to = lastMaxPositiveTabIndex;
  } else {
    if (isAssistedTabbingRequired(lastTabbable, bottomTabbable, 5)) to = firstTabbable;
    else if (lastMaxPositiveTabIndex && isAssistedTabbingRequired(lastMaxPositiveTabIndex)) to = firstZeroTabIndex;
  }

  if (to) {
    // Force the focus to go either to:
    event.preventDefault();
    // the checked radio button belonging to the same group `to` belongs to,
    if (isRadioInput(to) && !to.checked) {
      (document.querySelector('input[name=' + to.name + ']:checked') as FocusableElementRef)?.focus();
    } else to.focus(); // or simply `to`.
  }
} // End of assistTabbing();

/*

`assistTabbing()` contains some logic that may deserve insights.

I.
Focus must always jump from `lastTabbable` to `firstTabbable`, and viceversa:

  - When the focus is on `lastTabbable` and `TAB` is pressed, focus must go to `firstTabbable`.
  - When the focus is on `firstTabbable` and `SHIFT + TAB` is pressed, focus must go to `lastTabbable`.

II.
Additionally, if the trap contains both elements with zero and with positive tab indexes,
then focus must always jump also from `lastMaxPositiveTabIndex` to `firstZeroTabIndex`, and viceversa:

  - When the focus is on `lastMaxPositiveTabIndex` and `TAB` is pressed, focus must go to `firstZeroTabIndex`.
  - When the focus is on `firstZeroTabIndex` and `SHIFT + TAB` is pressed, focus must go to `lastMaxPositiveTabIndex`.

  This is because for the browser the next tabbable element after one with positive tab index is either
  the first element in the `document` (even ouside ot the trap) with an higher tab index (or equal, but following in order)
  or the first element in the `document` (even ouside ot the trap) with zero tab index.

  In theory positive tab indexes should be grouped by value (a group for "1", another for "2", etc)
  and the focus should always be forced from the last element of a group to the first of another (and viceversa),
  but in practive positive tab indexes are too rare (fairly, since they are an accessibility antipattern)
  to make this logic worth to be implemented.
  This logic differs from the currently implemented one, only in case the trap contains at least two elemnts
  with positive tab indexes (say "1" and "2"), and there is at least one element outside of the trap with a tab index
  whose value "T" is: 1 <= T <= 2.

III.
Assisted tabbing is always required when the focus is entering or leaving a radio group.

  This is because when `firstTabbable`, `lastTabbable`, `lastMaxPositiveTabIndex`, `firstZeroTabIndex`
  are to be set to an input being part of a radio group, they should be set to the currently chacked input,
  but the hook actually set them to a fixed radio input acting as a representative for the whole group.

  Here the choice is between the current approach, which consist in having logic to assist the tabbing from and to
  inputs of a radio group, or the more intutive approach of using an event listener on the document which listens
  for changes on the radio groups of the trap, to update the mentioned `trapRefs` with the currently checked radio input.

  While the event listener approach removes the need to assist the tabbing for radio groups, it puts weight
  on every trap update (they are triggered by the mutation observer) as there would be the need to scan
  the mentioned `trapRefs` for the presence of a radio group and eventually attach or remove event listeners.

  The current approach puts weigth on the event handler for `TAB` key press.

  Drawing conslusions:
  - Trap updates happens in time windows that are already quite intense, not only because of the logic running in this hook,
    but also because of the external logic that triggered a trap update.
    Moving logic from these busy times to quieter `TAB` key presses is definitely a good idea.
  - The event listener approach still weights on the user's experience even if
    they don't use the keyboard to navigate through the page.

  How does the current approach work?
  Whenever `TAB` is pressed the `event.target` is checkd to know if it's part of a radio group containing also one of
  `firstTabbable`, `lastTabbable`, `lastMaxPositiveTabIndex`, `firstZeroTabIndex` and in that case the tab would be assisted
  as if `event.target` was the one of the four`trapRefs` in question.
  Whenever the tabbing has to be assisted (eg, `TAB` is pressed with `event.target` being `lastTabbable`), a check will be done
  on the destination of the assisted tabbing (eg, `firstTabbable`) to know if it's part of a radio group, and in that case
  the focus would go to the checked radio input in the group (rather than to what the hook considers as `firstTabbable`).

IV.
Assisted tabbing may be required when `event.target` is outside of the "edges" of the tabbable elements in the trap.

  If the trap contains an element with negative tab index, the user can focus it (by means other than the keyboard) and
  then `TAB` (or `SHIFT + TAB`) away from it.
  If such element comes before `topTabbable` or after `bottomTabbable`, in document order, assisted tabbing is required
  to keep the focus within the trap (from before `topTabbable` with a `SHIFT + TAB` to `lastTabbable` and
  from after `bottomTabbable` with a `TAB` to `firstTabbable`).

  It's not possible to use eg, `firstTabbable` instead of `topTabbable` because there could be tabbable elements
  in the trap that come before `firstTabbable` in document order and in that case assisting the tabbing would be a mistake.

*/
