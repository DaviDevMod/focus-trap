import { Focusable } from 'single-focus-trap';

import { NormalizedParam, ResolvedConfig, TrapConfig, TrapsControllerParam } from './types';

// Returns false if `param` is not a valid `TrapsControllerParam`, which can happen
// only if the hook is used with plain JavaScript, or with non-typesafe TypeScript.
export function normalizeParam(param: TrapsControllerParam): NormalizedParam | false {
  if (param === 'DEMOLISH' || param === 'RESUME' || param === 'PAUSE') {
    return { action: param };
  } else if (typeof param === 'string' || param instanceof Array || param instanceof HTMLElement) {
    return { action: 'PUSH', config: { root: param } };
  } else if ('action' in param) {
    if (!/^(PUSH|BUILD|DEMOLISH|RESUME|PAUSE)$/.test(param.action)) return false;
    if (typeof param.config === 'string' || param.config instanceof Array || param.config instanceof HTMLElement) {
      return { action: 'PUSH', config: { root: param.config } };
    } else if (param.config && 'root' in param.config) {
      // As far as TypeScript is concerned, `param.config` is actually granted to be a `TrapConfig`
      // at this point. But TypeScript can't perform the narrowing and needs a cast.
      return param as NormalizedParam;
    }
    return false;
  } else if ('root' in param) {
    return { action: 'PUSH', config: param };
  }
  return false;
}

const resolveId = (prop?: Focusable | string): Focusable | undefined =>
  (typeof prop === 'string' ? document.getElementById(prop) : prop) ?? undefined;

// Function resolving ids and setting default values.
// Returns false if `config.root` doesn't contain at least one valid elemeent.
export function resolveConfig(config: TrapConfig): ResolvedConfig | false {
  const resolvedRoot = (config.root instanceof Array ? config.root : [config.root]).map((el) => resolveId(el));

  if (process.env.NODE_ENV !== 'production') {
    for (let i = 0; i < resolvedRoot.length; i++) {
      if (!(resolvedRoot[i] instanceof HTMLElement)) {
        console.warn(`"${config.root instanceof Array ? config.root[i] : config.root}" is not a valid root.`);
      }
    }
  }

  let root = resolvedRoot.filter((el): el is HTMLElement => el instanceof HTMLElement);

  if (!root.length) return false;

  const rootSet = new Set(root);
  if (rootSet.size !== root.length) {
    root = Array.from(rootSet);

    if (process.env.NODE_ENV !== 'production') {
      console.warn('Duplicate elements were found in the "root" array. They have been deduplicated.');
    }
  }

  // TODO: remove roots that are nested in another root, and log a warning.

  root = root.sort((a, b) => (a.compareDocumentPosition(b) & 4 ? -1 : 1));

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

  return { root, initialFocus, returnFocus, lock, escape };
}

// Utility assessing whether two `ResolvedConfig` are equivalent. Functions are not deep compared.
export function areConfigsEquivalent(x: ResolvedConfig, y: ResolvedConfig): boolean {
  if (x.root.length !== y.root.length) return false;
  for (let i = 0; i < x.root.length; i++) if (x.root[i] !== y.root[i]) return false;

  if (process.env.NODE_ENV !== 'production') {
    if (x.initialFocus === y.initialFocus && x.returnFocus === y.returnFocus) {
      if (x.lock === y.lock && x.escape === y.escape) return true;
      console.warn(
        "`use-simple-focus-trap` detected two focus trap configurations differing only in function references. Chances are you need to memoize the functions you pass to the hook's return value to avoid unwanted behaviours. More information can be found at: https://github.com/DaviDevMod/focus-trap/blob/main/packages/use-simple-focus-trap#note-expansion-2-warning"
      );
    }
    return false;
  }

  const props: (keyof ResolvedConfig)[] = ['initialFocus', 'returnFocus', 'lock', 'escape'];

  for (let prop of props) if (x[prop] !== y[prop]) return false;

  return true;
}
