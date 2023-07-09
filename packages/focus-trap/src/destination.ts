import type { Unit } from 'true-myth/unit';
import type { Result } from 'true-myth/result';
import { err, ok } from 'true-myth/result';
import { isTabbable, getTabIndex } from 'tabbable';

import type { Focusable, NormalisedTrapConfig } from './state.js';
import { isFocusable } from './normalise.js';

const candidateSelector =
  'a[href], button, input, select, textarea, [tabindex], audio[controls], video[controls], [contenteditable]:not([contenteditable="false"]), details>summary:first-of-type, details';

const candidatesInRoot = (root: Focusable) => [root, ...root.querySelectorAll<Focusable>(candidateSelector)];

const modulo = (number: number, modulo: number) => ((number % modulo) + modulo) % modulo;

const firstOrLastGenericTabbableInRoot = (
  root: Focusable,
  isFirst: boolean,
  tabIndexFilter = (_tabIndex: number) => true
) => {
  return candidatesInRoot(root)[isFirst ? 'find' : 'findLast'](
    (el) => tabIndexFilter(getTabIndex(el)) && isTabbable(el)
  );
};

const topOrBottomTabbableInRoot = (root: Focusable, isTop = true) => {
  return firstOrLastGenericTabbableInRoot(root, isTop);
};

const firstOrLastZeroTabbableInRoot = (root: Focusable, isFirst = true) => {
  return firstOrLastGenericTabbableInRoot(root, isFirst, (tabIndex) => tabIndex === 0);
};

export const firstOrLastZeroTabbable = (roots: Focusable[], isFirst = true) => {
  let firstOrLastZero = undefined as Focusable | undefined;

  roots[isFirst ? 'find' : 'findLast']((root) => (firstOrLastZero = firstOrLastZeroTabbableInRoot(root, isFirst)));

  return firstOrLastZero;
};

const positiveTabbables = (roots: Focusable[]) => {
  return roots
    .map(candidatesInRoot)
    .reduce((prev, curr) => prev.concat(curr.filter((el) => el.tabIndex > 0)), [])
    .sort((a, b) => a.tabIndex - b.tabIndex);
};

// Note: this function only searches in a given direction without wrapping around to check preceding elements.
const nextPositiveTabbable = (roots: Focusable[], origin?: Focusable, isForward = true) => {
  const positives = positiveTabbables(roots);

  let originIndex = undefined as number | undefined;

  if (origin) {
    originIndex = positives.indexOf(origin);

    if (originIndex === -1) {
      positives.push(origin);
      positives.sort((a, b) =>
        a.tabIndex === b.tabIndex ? (a.compareDocumentPosition(b) & 4 ? -1 : 1) : a.tabIndex - b.tabIndex
      );
      originIndex = positives.indexOf(origin);
    }
  }

  return isForward
    ? positives.slice(originIndex == null ? originIndex : originIndex + 1).find((el) => isTabbable(el))
    : positives.slice(0, originIndex).findLast((el) => isTabbable(el));
};

const nextTopOrBottomTabbable = (
  roots: Focusable[],
  origin: Focusable,
  isForward: boolean
): Result<Focusable | Unit, string> => {
  const originRootIndex = roots.findIndex((root) => root.contains(origin));

  // Index of the root in which to search for the next top/bottom tabbable element.
  let topOrBottomRootIndex = originRootIndex;

  // If `origin` belongs to the trap.
  if (originRootIndex >= 0) {
    // Note that since looking for top/bottom tabbables makes sense only if `origin` has a negative tab index
    // (and therefore is untabbable), `origin` can't itself be a top nor a bottom tabbable.

    const bottom = topOrBottomTabbableInRoot(roots[originRootIndex], false);

    // If the root containing `origin` doesn't have any tabbable elements,
    // or if `origin` follows `bottom`, start the search from the succeeding root;
    if (!bottom || bottom.compareDocumentPosition(origin) & 4) topOrBottomRootIndex++;
    // else if `origin` is in between `top` and `bottom`, leave the focus handling up to the browser.
    else if (topOrBottomTabbableInRoot(roots[originRootIndex])!.compareDocumentPosition(origin) & 4) return ok();
  } else {
    // If `origin` doesn't belong to the trap, start the search from the first root that follows it.
    topOrBottomRootIndex = roots.findIndex((root) => origin.compareDocumentPosition(root) & 4);

    if (topOrBottomRootIndex === -1) topOrBottomRootIndex = roots.length;
  }

  // In any case, if tabbing 'BACKWARD' start the search from the preceding root.
  if (!isForward) topOrBottomRootIndex--;

  for (; Math.abs(topOrBottomRootIndex) < 2 * roots.length; topOrBottomRootIndex += isForward ? 1 : -1) {
    const destination = topOrBottomTabbableInRoot(roots[modulo(topOrBottomRootIndex, roots.length)], isForward);

    if (destination) return ok(destination);
  }

  return err('There are no tabbable elements in the focus trap.');
};

const nextFirstOrLastZeroOrPositiveTabbable = (
  roots: Focusable[],
  origin: Focusable,
  isForward: boolean
): Result<Focusable | Unit, string> => {
  const originRootIndex = roots.findIndex((root) => root.contains(origin));

  let firstOrLastRootIndex = originRootIndex;

  if (originRootIndex >= 0) {
    if (isForward) {
      if (origin === firstOrLastZeroTabbableInRoot(roots[originRootIndex], false)) firstOrLastRootIndex++;
      else return ok();
    } else if (origin === firstOrLastZeroTabbableInRoot(roots[originRootIndex])) {
      firstOrLastRootIndex--;
    } else {
      return ok();
    }
  } else {
    firstOrLastRootIndex = roots.findIndex((root) => origin.compareDocumentPosition(root) & 4);

    if (firstOrLastRootIndex === -1) firstOrLastRootIndex = roots.length;

    if (!isForward) firstOrLastRootIndex--;
  }

  // Need to consider "last" when tabbing "forward" and vice versa.
  const firstOrLastZeroInTrap = firstOrLastZeroTabbable(roots, !isForward);

  const meetingPositives =
    !firstOrLastZeroInTrap ||
    origin === firstOrLastZeroInTrap ||
    origin.compareDocumentPosition(firstOrLastZeroInTrap) & (isForward ? 2 : 4);

  for (let i = firstOrLastRootIndex; Math.abs(i) < 2 * roots.length; i += isForward ? 1 : -1) {
    if (meetingPositives) {
      const destination = nextPositiveTabbable(roots, undefined, isForward);

      if (destination) return ok(destination);
    }

    const destination = firstOrLastZeroTabbableInRoot(roots[modulo(i, roots.length)], isForward);

    if (destination) return ok(destination);
  }

  return err('There are no tabbable elements in the focus trap.');
};

const nextPositiveOrVeryFirstOrVeryLastTabbable = (
  roots: Focusable[],
  origin?: Focusable,
  isForward = true
): Result<Focusable, string> => {
  const nextPositive = nextPositiveTabbable(roots, origin, isForward);

  if (nextPositive) return ok(nextPositive);

  const firstOrLastZeroInTrap = firstOrLastZeroTabbable(roots, isForward);

  if (firstOrLastZeroInTrap) return ok(firstOrLastZeroInTrap);

  if (origin) {
    const firstOrLastPositiveInTrap = nextPositiveTabbable(roots, undefined, isForward);

    if (firstOrLastPositiveInTrap) return ok(firstOrLastPositiveInTrap);
  }

  return err('There are no tabbable elements in the focus trap.');
};

// Notice that the `roots` used internally are already sorted by document order in "normalise.ts".
export const getDestination = (
  roots: Focusable[],
  origin: Focusable,
  isForward: boolean
): Result<Focusable | Unit, string> => {
  const originTabIndex = getTabIndex(origin);

  if (originTabIndex < 0) return nextTopOrBottomTabbable(roots, origin, isForward);

  if (originTabIndex === 0) return nextFirstOrLastZeroOrPositiveTabbable(roots, origin, isForward);

  return nextPositiveOrVeryFirstOrVeryLastTabbable(roots, origin, isForward);
};

export const getInitialFocus = ({ roots, initialFocus }: NormalisedTrapConfig): Result<Focusable | Unit, string> => {
  if (initialFocus === false) return ok();

  if (isFocusable(initialFocus)) return ok(initialFocus);

  return nextPositiveOrVeryFirstOrVeryLastTabbable(roots);
};
