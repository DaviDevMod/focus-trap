import { Focusable } from './types';

// String used to query all the candidate focusable elements within the trap.
export const focusable =
  'a[href], button, input, select, textarea, [tabindex], audio[controls], video[controls], [contenteditable]:not([contenteditable="false"]), details>summary:first-of-type, details';

// Oprions for the `.observe()` method of the mutation observer.
export const mutationObserverInit: MutationObserverInit = {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ['disabled', 'type', 'open', 'style', 'tabindex'],
  attributeOldValue: true,
};

// MutationObserver has to watch the entire `style` to know if `visibility` or `display` mutates,
// but scheduling a `refs` update for any kind of style change would indeed be inefficient.
// Returns `false` for `style` mutations that do not affect tabbability and `true` in any other case.
export const isMutationAffectingTabbability = (record: MutationRecord) =>
  record.attributeName === 'style'
    ? (record.target as any).style?.visibility === 'hidden' ||
      /^(none|contents)$/.test((record.target as any).style?.display) ||
      /visibility: hidden|display: (none|contents)/.test(record.oldValue || '')
    : true;

// <details>, <audio controls> e <video controls> get a default `tabIndex` of -1 in Chrome, yet they are
// still part of the regular tab order. Also browsers do not return `tabIndex` correctly for `contentEditable`
// nodes. In these cases the `tabIndex` is assumed to be 0 if it's not explicitly set to a valid value.
// This check (makes sense and) is run only if `node.tabIndex < 0`, hence the return -1 rather than `node.tabIndex`.
export const getConsistentTabIndex = (node: HTMLElement | SVGElement) =>
  (/^(AUDIO|VIDEO|DETAILS)$/.test(node.tagName) || (node as any).isContentEditable) &&
  isNaN(parseInt(node.getAttribute('tabindex')!, 10))
    ? 0
    : -1;

// Function testing various edge cases. Returns `true` if `candidate` is actually focusable.
export function isActuallyFocusable(candidate: HTMLElement | SVGElement) {
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
    let parentNode = candidate as Focusable;
    while ((parentNode = parentNode!.parentElement as Focusable)) {
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
}

export const isRadioInput = (element: unknown): element is HTMLInputElement =>
  element instanceof HTMLInputElement && element.type === 'radio';

export const areTwoRadiosInSameGroup = (a: unknown, b: unknown): boolean =>
  isRadioInput(a) && isRadioInput(b) && a.name === b.name;

export const getTheCheckedRadio = (radio: HTMLInputElement): HTMLInputElement | null =>
  document.querySelector('input[name=' + radio.name + ']:checked');
