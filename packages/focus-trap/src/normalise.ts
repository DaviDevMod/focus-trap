import { Result, err, ok } from 'true-myth/result';

import type { Focusable, Roots, TrapConfig, NormalisedTrapConfig } from './state.js';

const resolveId = <T>(arg: T) =>
  typeof arg === 'string' ? document.getElementById<Focusable>(arg) : (arg as Exclude<T, string>);

export const isFocusable = (el: unknown): el is Focusable => el instanceof HTMLElement || el instanceof SVGElement;

const dedupeArray = <T>(array: T[]) => Array.from(new Set(array));

const outNestedElements = (el: Focusable, _index: number, elements: Focusable[]) => {
  return elements.every((anotherEl) => !anotherEl.contains(el) || anotherEl === el);
};

const byDocumentOrder = (a: Focusable, b: Focusable) => (a.compareDocumentPosition(b) & 4 ? -1 : 1);

export const normaliseRoots = (roots: Roots): Result<Focusable[], string> => {
  const resolvedRoots = roots.map(resolveId).filter(isFocusable);

  if (!resolvedRoots.length) return err('No valid root found.');

  return ok(dedupeArray(resolvedRoots).filter(outNestedElements).sort(byDocumentOrder));
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
export const normaliseConfigExcludingRoots = (trapConfig: TrapConfig): Omit<NormalisedTrapConfig, 'roots'> => ({
  initialFocus: resolveId(trapConfig.initialFocus) ?? true,
  returnFocus: normaliseReturnFocus(trapConfig.returnFocus),
  lock: trapConfig.lock ?? true,
  escape: trapConfig.escape ?? true,
});
