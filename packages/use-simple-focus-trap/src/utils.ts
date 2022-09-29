import { Focusable } from 'single-focus-trap';

import { NormalizedTrapArg, ResolvedConfig, TrapConfig, TrapArg } from './types';

// Returns false if `arg` is not a valid `TrapArg`, which can happen
// only if the hook is used with plain JavaScript, or with non-typesafe TypeScript.
export function normalizeTrapArg(arg: TrapArg): NormalizedTrapArg | false {
  if (arg === 'DEMOLISH' || arg === 'RESUME' || arg === 'PAUSE') {
    return { action: arg };
  } else if (typeof arg === 'string' || arg instanceof Array || arg instanceof HTMLElement) {
    return { action: 'PUSH', config: { roots: arg } };
  } else if ('action' in arg) {
    if (!/^(PUSH|BUILD|DEMOLISH|RESUME|PAUSE)$/.test(arg.action)) return false;
    if (typeof arg.config === 'string' || arg.config instanceof Array || arg.config instanceof HTMLElement) {
      return { action: 'PUSH', config: { roots: arg.config } };
    } else if (arg.config && 'roots' in arg.config) {
      // `arg.config` is actually granted to be a `TrapConfig` at this point.
      // But TypeScript can't perform the narrowing and needs the cast.
      return arg as NormalizedTrapArg;
    }
    return false;
  } else if ('roots' in arg) {
    return { action: 'PUSH', config: arg };
  }
  return false;
}

const resolveId = (prop?: Focusable | string): Focusable | undefined =>
  (typeof prop === 'string' ? document.getElementById(prop) : prop) ?? undefined;

// Function resolving ids and setting default values.
// Returns false if `config.roots` doesn't contain at least one valid elemeent.
export function resolveConfig(config: TrapConfig): ResolvedConfig | false {
  const resolvedRoots = (config.roots instanceof Array ? config.roots : [config.roots]).map((el) => resolveId(el));

  if (process.env.NODE_ENV !== 'production') {
    for (let i = 0; i < resolvedRoots.length; i++) {
      if (!(resolvedRoots[i] instanceof HTMLElement)) {
        console.warn(`"${config.roots instanceof Array ? config.roots[i] : config.roots}" is not a valid root.`);
      }
    }
  }

  let roots = resolvedRoots.filter((el): el is HTMLElement => el instanceof HTMLElement);

  if (!roots.length) return false;

  const rootSet = new Set(roots);
  if (rootSet.size !== roots.length) {
    roots = Array.from(rootSet);

    if (process.env.NODE_ENV !== 'production') {
      console.warn('Duplicate elements were found in the "root" array. They have been deduplicated.');
    }
  }

  // TODO: remove roots that are nested in another root, and log a warning.

  roots = roots.sort((a, b) => (a.compareDocumentPosition(b) & 4 ? -1 : 1));

  let initialFocus = typeof config.initialFocus === 'string' ? resolveId(config.initialFocus) : config.initialFocus;
  if (initialFocus !== false && !(initialFocus instanceof HTMLElement) && !(initialFocus instanceof SVGElement)) {
    initialFocus = true;
  }

  let returnFocus = typeof config.returnFocus === 'string' ? resolveId(config.returnFocus) : config.returnFocus;
  if (returnFocus !== false && !(returnFocus instanceof HTMLElement) && !(returnFocus instanceof SVGElement)) {
    returnFocus = true;
  }

  const lock = config.lock === false || config.lock instanceof Function ? config.lock : true;

  const escape = config.escape === false || config.escape instanceof Function ? config.escape : true;

  return { roots, initialFocus, returnFocus, lock, escape };
}

// Utility assessing whether two `ResolvedConfig` are equivalent. Functions are not deep compared.
export function areConfigsEquivalent(x: ResolvedConfig, y: ResolvedConfig): boolean {
  if (x.roots.length !== y.roots.length) return false;
  for (let i = 0; i < x.roots.length; i++) if (x.roots[i] !== y.roots[i]) return false;

  if (x.initialFocus === y.initialFocus && x.returnFocus === y.returnFocus) {
    const evaluatePropEquivalence = (prop: keyof ResolvedConfig) => {
      if (x[prop] === y[prop]) return 1;
      if (x[prop] instanceof Function && y[prop] instanceof Function) return 3;
      return 0;
    };

    // If ends up being zero or an odd number, the configs are definitely different.
    let propsEquivalence = 0;
    propsEquivalence += evaluatePropEquivalence('initialFocus');
    propsEquivalence += evaluatePropEquivalence('returnFocus');

    if (propsEquivalence === 2) return true;

    // In this case the configs are considered different and a warning is logged in development.
    if (propsEquivalence && !(propsEquivalence % 2)) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(
          "`use-simple-focus-trap` detected two focus trap configurations differing only in function references. Chances are you need to memoize the functions you pass to the hook's return value to avoid unwanted behaviours. More information can be found at: https://github.com/DaviDevMod/focus-trap/blob/main/packages/use-simple-focus-trap#note-expansion-2-warning"
        );
      }
    }
  }
  return false;
}
