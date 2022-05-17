import { Focusable } from '@single-focus-trap';

import { NormalizedParam, ResolvedConfig, TrapConfig, TrapsControllerParam } from './types';

export function normalizeParam(param: TrapsControllerParam): NormalizedParam {
  if (param === 'DEMOLISH' || param === 'RESUME' || param === 'PAUSE') {
    return { action: param };
  } else if (typeof param === 'string' || param instanceof Array || param instanceof HTMLElement) {
    return { action: 'BUILD', config: { root: param } };
  } else if ('action' in param) {
    if (typeof param.config === 'string' || param.config instanceof Array || param.config instanceof HTMLElement) {
      return { action: 'BUILD', config: { root: param.config } };
    } else {
      // `config` is actually granted to be a `TrapConfig` at this point. But TS needs the cast.
      return param as NormalizedParam;
    }
  } else {
    return { action: 'BUILD', config: param };
  }
}

const resolveId = (prop?: Focusable | string): Focusable | undefined =>
  (typeof prop === 'string' ? document.getElementById(prop) : prop) ?? undefined;

// Function resolving ids and setting default values.
// If `root` can't be resolved to an `HTMLELemennt`, the `config` must not be pushed to the `trapsStack`.
export function resolveConfig(config: TrapConfig): ResolvedConfig | false {
  const resolvedRoot = (config.root instanceof Array ? config.root : [config.root]).map((el) => resolveId(el));

  let root = resolvedRoot.filter((el): el is HTMLElement => el instanceof HTMLElement);

  if (process.env.NODE_ENV === 'development') {
    for (let i = 0; i < resolvedRoot.length; i++) {
      if (!(resolvedRoot[i] instanceof HTMLElement)) {
        console.warn(`"${config.root instanceof Array ? config.root[i] : config.root}" is not a valid root.`);
      }
    }
    if (!root.length) throw new Error('No valid root found.');
  }

  if (!root.length) return false;

  const rootSet = new Set(root);
  if (rootSet.size !== root.length) {
    root = Array.from(rootSet);

    if (process.env.NODE_ENV === 'development') {
      console.warn('Duplicate elements were found in the "root" array. They have been deduplicated.');
    }
  }

  root = root.sort((a, b) => (a.compareDocumentPosition(b) & 4 ? -1 : 1));

  // Need to know if return focus was valid to properly conpare two configs in `areConfigsEquivalent`.
  // That is, two identic configs may have a different default `returnFocus`, but they are still the same trap.
  let returnFocus = resolveId(config.returnFocus);
  const isReturnFocusDefault = !returnFocus;
  if (isReturnFocusDefault) returnFocus = (document.activeElement as Focusable) ?? undefined;

  return {
    root,
    initialFocus: resolveId(config.initialFocus),
    returnFocus,
    lock: config.lock ?? true,
    escape: config.escape ?? true,
    isReturnFocusDefault,
  };
}

// Utility assessing whether two `ResolvedConfig` are equivalent. Functions are not deep compared.
export function areConfigsEquivalent(x: ResolvedConfig, y: ResolvedConfig): boolean {
  const props: (keyof ResolvedConfig)[] = ['initialFocus', 'returnFocus', 'lock', 'escape'];

  // Comparing `root`s apart, because they are arrays.
  for (let i = 0; i < x.root.length; i++) if (x.root[i] !== y.root[i]) return false;

  // Discarding the only case in which two `returnFocus` are equivalent even if not strict equal.
  if (x.returnFocus !== y.returnFocus && !(x.isReturnFocusDefault && y.isReturnFocusDefault)) return false;

  if (process.env.NODE_ENV === 'development') {
    if (x.initialFocus === y.initialFocus && x.returnFocus === y.returnFocus) {
      if (x.lock === y.lock && x.escape === y.escape) return true;
      console.warn(
        "`useSimpleFocusTrap` detected two focus trap configurations differing only in function references. Chances are you need to memoize the functions you pass to the hook's return value to avoid unwanted behaviours. More information can be found at: https://github.com/DaviDevMod/focus-trap/blob/main/packages/use-simple-focus-trap#note-expansion-2-warning"
      );
    }
    return false;
  }

  for (let prop of props) if (x[prop] !== y[prop]) return false;

  return true;
}
