import { Result, err, ok } from 'true-myth/result';
import { Unit } from 'true-myth/unit';

import { Focusable } from './state.js';
import { candidateSelector, getConsistentTabIndex, isActuallyFocusable } from './tabbability.js';

type Direction = 'FORWARD' | 'BACKWARD';

type FirstOrLast = 'FIRST' | 'LAST';

const modulo = (number: number, modulo: number) => ((number % modulo) + modulo) % modulo;

const candidatesInRoot = (root: Focusable) => [root, ...root.querySelectorAll<Focusable>(candidateSelector)];

const firstOrLastGenericTabbableInRoot = (
  root: Focusable,
  whichOne: FirstOrLast = 'FIRST',
  validateTabIndex = (tabIndex: number) => true
) => {
  return (
    candidatesInRoot(root)[whichOne === 'FIRST' ? 'find' : 'findLast'](
      (el) => validateTabIndex(getConsistentTabIndex(el)) && isActuallyFocusable(el)
    ) ?? null // Casting `undefined` to `null` for consistency.
  );
};

const topOrBottomTabbableInRoot = (root: Focusable, whichOne: 'TOP' | 'BOTTOM' = 'TOP') => {
  return firstOrLastGenericTabbableInRoot(root, whichOne === 'TOP' ? 'FIRST' : 'LAST', (tabIndex) => tabIndex >= 0);
};

const firstOrLastZeroTabbableInRoot = (root: Focusable, whichOne: FirstOrLast = 'FIRST') => {
  return firstOrLastGenericTabbableInRoot(root, whichOne, (tabIndex) => tabIndex === 0);
};

export const firstOrLastZeroTabbable = (roots: Focusable[], whichOne: FirstOrLast = 'FIRST') => {
  let firstOrLastZero: Focusable | null = null;

  roots[whichOne === 'FIRST' ? 'find' : 'findLast'](
    (root) => (firstOrLastZero = firstOrLastZeroTabbableInRoot(root, whichOne))
  );

  // TS doesn't take into account functions' side effects: https://github.com/microsoft/TypeScript/issues/9998
  return firstOrLastZero as Focusable | null;
};

// Notice that normalised roots (consumed here) are already sorted by document order,
// see `sortRoots` in TODO: finish this comment
export const positiveTabbables = (roots: Focusable[]) => {
  return roots
    .map(candidatesInRoot)
    .reduce((prev, curr) => prev.concat(curr.filter((el) => el.tabIndex > 0)), [])
    .sort((a, b) => a.tabIndex - b.tabIndex);
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

  // Root from which to start searching for a destination.
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
    // If `origin` doesn't belong to the trap, start the search from the first root that follows it.
    destinationRootIndex = roots.findIndex((root) => origin.compareDocumentPosition(root) & 4);

    if (destinationRootIndex === -1) destinationRootIndex = roots.length;

    // If tabbing 'BACKWARD' start the search from the preceding root.
    if (direction === 'BACKWARD') destinationRootIndex--;
  }

  for (let i = destinationRootIndex; Math.abs(i) < 2 * roots.length; i += direction === 'FORWARD' ? 1 : -1) {
    const alternativeDestinationRootIndex = modulo(i, roots.length);

    if (
      (alternativeDestinationRootIndex === 0 &&
        direction === 'FORWARD' &&
        (origin.compareDocumentPosition(roots[roots.length - 1]) & 2 || roots[roots.length - 1] === origin)) ||
      (alternativeDestinationRootIndex === roots.length - 1 &&
        direction === 'BACKWARD' &&
        (origin.compareDocumentPosition(roots[0]) & 4 || roots[0].contains(origin)))
    ) {
      const positives = positiveTabbables(roots);

      if (positives.length) {
        return ok(positives[direction === 'FORWARD' ? 0 : positives.length - 1]);
      }
    }

    const firstOrLastZero = firstOrLastZeroTabbableInRoot(
      roots[alternativeDestinationRootIndex],
      direction === 'FORWARD' ? 'FIRST' : 'LAST'
    );

    if (firstOrLastZero) return ok(firstOrLastZero);
  }

  return err('There are no tabbable elements in the focus trap.');
};

export const getDestination = (
  roots: Focusable[],
  origin: Focusable,
  direction: Direction
): Result<Focusable | Unit, string> => {
  const originTabIndex = getConsistentTabIndex(origin);

  if (originTabIndex < 0) return nextTopOrBottomTabbable(roots, origin, direction);

  if (originTabIndex === 0) return nextFirstOrLastZeroOrPositiveTabbable(roots, origin, direction);

  const positives = positiveTabbables(roots);

  let index = positives.findIndex((el) => el === origin);

  if (index === -1) {
    positives.push(origin);
    positives.sort((a, b) =>
      a.tabIndex === b.tabIndex ? (a.compareDocumentPosition(b) & 4 ? -1 : 1) : a.tabIndex - b.tabIndex
    );
    index = positives.findIndex((el) => el === origin);
  }

  const nextPositive = positives[index + (direction === 'FORWARD' ? 1 : -1)] as Focusable | null;

  if (nextPositive) return ok(nextPositive);

  const nextFirstOrLastZero = firstOrLastZeroTabbable(roots, direction === 'FORWARD' ? 'FIRST' : 'LAST');

  if (nextFirstOrLastZero) return ok(nextFirstOrLastZero);

  return err('There are no tabbable elements in the focus trap.');
};
