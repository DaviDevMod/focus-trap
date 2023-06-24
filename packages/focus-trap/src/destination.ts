import type { Unit } from 'true-myth/unit';
import type { Result } from 'true-myth/result';
import { err, ok } from 'true-myth/result';

import type { Focusable, NormalisedTrapConfig } from './state.js';
import { isFocusable } from './normalise.js';
import { candidateSelector, getConsistentTabIndex, isActuallyFocusable } from './tabbability.js';

type Direction = 'FORWARD' | 'BACKWARD';

type FirstOrLast = 'FIRST' | 'LAST';

const modulo = (number: number, modulo: number) => ((number % modulo) + modulo) % modulo;

const candidatesInRoot = (root: Focusable) => [root, ...root.querySelectorAll<Focusable>(candidateSelector)];

const firstOrLastGenericTabbableInRoot = (
  root: Focusable,
  whichOne: FirstOrLast,
  validateTabIndex: (tabIndex: number) => boolean
) => {
  return candidatesInRoot(root)[whichOne === 'FIRST' ? 'find' : 'findLast'](
    (el) => validateTabIndex(getConsistentTabIndex(el)) && isActuallyFocusable(el)
  );
};

const topOrBottomTabbableInRoot = (root: Focusable, whichOne: 'TOP' | 'BOTTOM' = 'TOP') => {
  return firstOrLastGenericTabbableInRoot(root, whichOne === 'TOP' ? 'FIRST' : 'LAST', (tabIndex) => tabIndex >= 0);
};

const firstOrLastZeroTabbableInRoot = (root: Focusable, whichOne: FirstOrLast = 'FIRST') => {
  return firstOrLastGenericTabbableInRoot(root, whichOne, (tabIndex) => tabIndex === 0);
};

export const firstOrLastZeroTabbable = (roots: Focusable[], whichOne: FirstOrLast = 'FIRST') => {
  let firstOrLastZero = undefined as Focusable | undefined;

  roots[whichOne === 'FIRST' ? 'find' : 'findLast'](
    (root) => (firstOrLastZero = firstOrLastZeroTabbableInRoot(root, whichOne))
  );

  return firstOrLastZero;
};

const positiveTabbables = (roots: Focusable[]) => {
  return roots
    .map(candidatesInRoot)
    .reduce((prev, curr) => prev.concat(curr.filter((el) => el.tabIndex > 0)), [])
    .sort((a, b) => a.tabIndex - b.tabIndex);
};

// Note: this function only searches in a given direction without wrapping around to check preceding elements.
const nextPositiveTabbable = (roots: Focusable[], origin?: Focusable, direction: Direction = 'FORWARD') => {
  const positives = positiveTabbables(roots);

  if (!positives.length) return;

  let originIndex = undefined as number | undefined;

  if (origin) {
    originIndex = positives.findIndex((el) => el === origin);

    if (originIndex === -1) {
      originIndex =
        // Non-null assertion due to early return `if (!positives.length)`.
        positives.at(-1)!.tabIndex < origin.tabIndex
          ? positives.length
          : positives.findIndex(
              (el) =>
                (el.tabIndex === origin.tabIndex && origin.compareDocumentPosition(el) & 4) ||
                el.tabIndex > origin.tabIndex
            );

      positives.splice(originIndex, 0, origin);
    }
  }

  return direction === 'FORWARD'
    ? positives.slice(originIndex == null ? originIndex : originIndex + 1).find((el) => isActuallyFocusable(el))
    : positives.slice(0, originIndex).findLast((el) => isActuallyFocusable(el));
};

const nextTopOrBottomTabbable = (
  roots: Focusable[],
  origin: Focusable,
  direction: Direction
): Result<Focusable | Unit, string> => {
  const originRootIndex = roots.findIndex((root) => root.contains(origin));

  // Root from which to start searching for a destination.
  let destinationRootIndex = originRootIndex;

  // If `origin` belongs to the trap.
  if (originRootIndex >= 0) {
    // Note that since looking for top/bottom tabbables makes sense only if `origin` has a negative tab index
    // (and therefore is untabbable), `origin` can't itself be a top nor a bottom tabbable.

    const bottom = topOrBottomTabbableInRoot(roots[originRootIndex], 'BOTTOM');

    // If the root containing `origin` doesn't have any tabbable elements,
    // or if `origin` follows `bottom`, start the search from the succeeding root;
    if (!bottom || bottom.compareDocumentPosition(origin) & 4) destinationRootIndex++;
    // else if `origin` is in between `top` and `bottom`, leave the focus handling up to the browser.
    else if (topOrBottomTabbableInRoot(roots[originRootIndex])!.compareDocumentPosition(origin) & 4) return ok();
  } else {
    // If `origin` doesn't belong to the trap, start the search from the first root that follows it.
    destinationRootIndex = roots.findIndex((root) => origin.compareDocumentPosition(root) & 4);

    if (destinationRootIndex === -1) destinationRootIndex = roots.length;
  }

  // In any case, if tabbing 'BACKWARD' start the search from the preceding root.
  if (direction === 'BACKWARD') destinationRootIndex--;

  for (let i = destinationRootIndex; Math.abs(i) < 2 * roots.length; i += direction === 'FORWARD' ? 1 : -1) {
    const topOrBottom = topOrBottomTabbableInRoot(
      roots[modulo(i, roots.length)],
      direction === 'FORWARD' ? 'TOP' : 'BOTTOM'
    );

    if (topOrBottom) return ok(topOrBottom);
  }

  return err('There are no tabbable elements in the focus trap.');
};

const nextFirstOrLastZeroOrPositiveTabbable = (
  roots: Focusable[],
  origin: Focusable,
  direction: Direction
): Result<Focusable | Unit, string> => {
  const originRootIndex = roots.findIndex((root) => root.contains(origin));

  let destinationRootIndex = originRootIndex;

  if (originRootIndex >= 0) {
    if (direction === 'FORWARD') {
      if (origin === firstOrLastZeroTabbableInRoot(roots[originRootIndex], 'LAST')) destinationRootIndex++;
      else return ok();
    } else if (origin === firstOrLastZeroTabbableInRoot(roots[originRootIndex])) {
      destinationRootIndex--;
    } else {
      return ok();
    }
  } else {
    destinationRootIndex = roots.findIndex((root) => origin.compareDocumentPosition(root) & 4);

    if (destinationRootIndex === -1) destinationRootIndex = roots.length;

    if (direction === 'BACKWARD') destinationRootIndex--;
  }

  const firstOrLastZeroInTrap = firstOrLastZeroTabbable(roots, direction === 'FORWARD' ? 'LAST' : 'FIRST');

  for (let i = destinationRootIndex; Math.abs(i) < 2 * roots.length; i += direction === 'FORWARD' ? 1 : -1) {
    if (
      !firstOrLastZeroInTrap ||
      origin === firstOrLastZeroInTrap ||
      origin.compareDocumentPosition(firstOrLastZeroInTrap) & (direction === 'FORWARD' ? 2 : 4)
    ) {
      const firstOrLastPositiveInTrap = nextPositiveTabbable(roots, undefined, direction);

      if (firstOrLastPositiveInTrap) return ok(firstOrLastPositiveInTrap);
    }

    const firstOrLastZeroInDestinationRoot = firstOrLastZeroTabbableInRoot(
      roots[modulo(i, roots.length)],
      direction === 'FORWARD' ? 'FIRST' : 'LAST'
    );

    if (firstOrLastZeroInDestinationRoot) return ok(firstOrLastZeroInDestinationRoot);
  }

  return err('There are no tabbable elements in the focus trap.');
};

const nextPositiveOrVeryFirstOrVeryLastTabbable = (
  roots: Focusable[],
  origin?: Focusable,
  direction: Direction = 'FORWARD'
): Result<Focusable, string> => {
  const nextPositive = nextPositiveTabbable(roots, origin, direction);

  if (nextPositive) return ok(nextPositive);

  const firstOrLastZeroInTrap = firstOrLastZeroTabbable(roots, direction === 'FORWARD' ? 'FIRST' : 'LAST');

  if (firstOrLastZeroInTrap) return ok(firstOrLastZeroInTrap);

  if (origin) {
    const firstOrLastPositiveInTrap = nextPositiveTabbable(roots, undefined, direction);

    if (firstOrLastPositiveInTrap) return ok(firstOrLastPositiveInTrap);
  }

  return err('There are no tabbable elements in the focus trap.');
};

// Notice that the `roots` used internally are already sorted by document order in "normalise.ts".
export const getDestination = (
  roots: Focusable[],
  origin: Focusable,
  direction: Direction
): Result<Focusable | Unit, string> => {
  const originTabIndex = getConsistentTabIndex(origin);

  if (originTabIndex < 0) return nextTopOrBottomTabbable(roots, origin, direction);

  if (originTabIndex === 0) return nextFirstOrLastZeroOrPositiveTabbable(roots, origin, direction);

  return nextPositiveOrVeryFirstOrVeryLastTabbable(roots, origin, direction);
};

export const getInitialFocus = ({ roots, initialFocus }: NormalisedTrapConfig): Result<Focusable | Unit, string> => {
  if (initialFocus === false) return ok();

  if (isFocusable(initialFocus)) return ok(initialFocus);

  return nextPositiveOrVeryFirstOrVeryLastTabbable(roots);
};
