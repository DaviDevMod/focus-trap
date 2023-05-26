import { Result, err, ok } from 'true-myth/result';

import type { Focusable, Roots, TrapConfig, NormalisedTrapConfig } from './state.js';
import { warnInEnv } from './exceptions.js';
import { isFocusable } from './tabbability.js';

const resolveId = <T>(arg: T) =>
  typeof arg === 'string' ? document.getElementById<Focusable>(arg) : (arg as Exclude<T, string>);

const isValidRoot = (root: unknown): root is Focusable => {
  const isValid = isFocusable(root);

  if (!isValid) warnInEnv(`${root} is not a valid root.`);

  return isValid;
};

const isNotNestedRoot = (root: Focusable, _index: number, roots: Focusable[]) => {
  const isNotNested = roots.every((anotherRoot) => !anotherRoot.contains(root) || anotherRoot === root);

  if (!isNotNested) warnInEnv(`${root} is contained by another root.`);

  return isNotNested;
};

const dedupeRoots = (roots: Focusable[]) => {
  const dedupedRoots = Array.from(new Set(roots));

  if (dedupedRoots.length !== roots.length) {
    warnInEnv('Duplicate elements were found in the "roots" array. They have been deduplicated.');
  }

  return dedupedRoots;
};

export const normaliseRoots = (roots: Roots): Result<Focusable[], string> => {
  const resolvedRoots = roots.map(resolveId).filter(isValidRoot);

  if (!resolvedRoots.length) return err('No valid root found.');

  return ok(dedupeRoots(resolvedRoots).filter(isNotNestedRoot));
};

// Get `document.activeElement` for the default `returnFocus`.
const normaliseReturnFocus = (returnFocus: TrapConfig['returnFocus']) => {
  const resolvedReturnFocus = resolveId(returnFocus);

  return resolvedReturnFocus === true || resolvedReturnFocus == null
    ? (document.activeElement as Focusable | null)
    : resolvedReturnFocus || null;
};

// `roots` and `returnFocus` need to be normalised separately, because the former
// may need to be normalised multiple times while the latter necessarily only once.
export const normaliseConfigEscludingRoots = (trapConfig: TrapConfig): Omit<NormalisedTrapConfig, 'roots'> => ({
  initialFocus: resolveId(trapConfig.initialFocus) ?? true,
  returnFocus: normaliseReturnFocus(trapConfig.returnFocus),
  lock: trapConfig.lock ?? true,
  escape: trapConfig.escape ?? true,
});
