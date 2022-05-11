import { FocusableElementRef, SingleTrapConfig, TrapConfig } from './types';

// `stackIsEmpty` is a flag that makes possible resetting `trapState` (in `useSingleTrap`) without triggering `buildTrap()`.
// To allow `trapState` to update just with the flag, `root` has to be typed as optional (`HTMLElement | undefined`)
// however since a trap is built only when there is an actual `root`, the optional typing would introduce unecessary
// non-null assertions all over the place in `useSingleTrap`. Hence the fictious HTMLElement, which will simply be ignored.
export const noConfig: SingleTrapConfig = {
  root: 'noUnnecessaryAssertions' as unknown as HTMLElement,
  stackIsEmpty: true,
};

// Excluding `undefined` as return value to make `areConfigsEquivalent()` more straightforward.
const resolveId = (prop?: FocusableElementRef | string): FocusableElementRef =>
  typeof prop === 'string' ? document.getElementById(prop) : prop ?? null;

// Function resolving ids and setting default values in the `config`.
// If `root` is can't be resolved to an `HTMLELemennt`, the `config` must not be pushed to the `trapsStack`.
export function resolveConfig(config: TrapConfig = { root: '' }): SingleTrapConfig | null {
  const root = resolveId(config.root);

  if (process.env.NODE_ENV === 'development') {
    if (!(root instanceof HTMLElement)) {
      throw new Error('The provided root does not reference any existing HTMLElement');
    }
  }
  if (!(root instanceof HTMLElement)) return null;

  // Need to know if return focus was valid to properly conpare two configs in `areConfigsEquivalent`.
  // That is, two identic configs may have a different default `returnFocus`, but they are still the same trap.
  let returnFocus = resolveId(config.returnFocus);
  const isReturnFocusDefault = returnFocus === null;
  if (isReturnFocusDefault) returnFocus = document.activeElement as FocusableElementRef;

  return {
    root,
    initialFocus: resolveId(config.initialFocus),
    returnFocus,
    lock: config.lock ?? true,
    escape: config.escape ?? true,
    isReturnFocusDefault,
  } as SingleTrapConfig;
}

// Utility assessing whether two `SingleTrapConfig`s are equivalent. Functions are not deep compared.
export function areConfigsEquivalent(x: SingleTrapConfig, y: SingleTrapConfig): boolean {
  const props: (keyof SingleTrapConfig)[] = ['root', 'initialFocus', 'returnFocus', 'lock', 'escape'];

  // Discarding the only case in which two `returnFocus` are equivalent even if not strict equal.
  if (x.returnFocus !== y.returnFocus && !(x.isReturnFocusDefault && y.isReturnFocusDefault)) return false;

  if (process.env.NODE_ENV === 'development') {
    if (x.root === y.root && x.initialFocus === y.initialFocus && x.returnFocus === y.returnFocus) {
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
