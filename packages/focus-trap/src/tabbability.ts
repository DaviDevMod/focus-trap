import type { Focusable } from './state.js';

// String used to query all the candidate focusable elements within the trap.
export const candidateSelector =
  'a[href], button, input, select, textarea, [tabindex], audio[controls], video[controls], [contenteditable]:not([contenteditable="false"]), details>summary:first-of-type, details';

export const isFocusable = (el: unknown): el is Focusable => el instanceof HTMLElement || el instanceof SVGElement;

// <details>, <audio controls> e <video controls> get a default `tabIndex` of -1 in Chrome, yet they are
// still part of the regular tab order. Also browsers do not return `tabIndex` correctly for `contentEditable`
// nodes. In these cases the `tabIndex` is assumed to be 0 if it's not explicitly set to a valid value.
export const getConsistentTabIndex = (node: Focusable) =>
  (/^(AUDIO|VIDEO|DETAILS)$/.test(node.tagName) || (node as any).isContentEditable) &&
  isNaN(parseInt(node.getAttribute('tabindex')!, 10))
    ? 0
    : node.tabIndex;

// Function testing various edge cases. Returns `true` if `candidate` is actually focusable.
export function isActuallyFocusable(candidate: Focusable) {
  if (
    // If the element has no layout boxes (eg, it has `display: "none"`);
    !candidate.getClientRects().length ||
    // or is disabled or hidden or an uncheck radio button;
    (candidate as any).disabled ||
    getComputedStyle(candidate).visibility === 'hidden' ||
    (candidate instanceof HTMLInputElement &&
      (candidate.type === 'hidden' || (candidate.type === 'radio' && !candidate.checked))) ||
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
