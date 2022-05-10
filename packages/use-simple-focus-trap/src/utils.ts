import { FocusableElementRef, SingleTrapConfig, TrapConfig } from './types';

// `stackIsEmpty` is a flag that makes possible resetting `trapState` (in `useSingleTrap`) without triggering `buildTrap()`.
// To allow `trapState` to update just with the flag, `root` has to be typed as optional (`HTMLElement | undefined`)
// however since a trap is built only when there is an actual `root`, the optional typing would introduce unecessary
// non-null assertions all over the place in `useSingleTrap`. Hence the fictious HTMLElement, which will simply be ignored.
export const noConfig: SingleTrapConfig = {
  root: 'noUnnecessaryAssertions' as unknown as HTMLElement,
  stackIsEmpty: true,
};

const resolveId = (el?: FocusableElementRef | string) => (typeof el === 'string' ? document.getElementById(el) : el);

// Function resolving all the ids in `config` and setting default values where needed.
// If `root` is still not an HTMLElement after its id resolution, `config` must not be added to the `trapsStack`.
export function resolveConfig(config: TrapConfig = { root: '' }): SingleTrapConfig | null {
  const root = resolveId(config.root);

  if (process.env.NODE_ENV === 'development') {
    if (!(root instanceof HTMLElement)) {
      throw new Error('The provided root does not reference any existing HTMLElement');
    }
  }
  if (!(root instanceof HTMLElement)) return null;

  return {
    root,
    initialFocus: resolveId(config.initialFocus),
    returnFocus: resolveId(config.returnFocus) ?? (document.activeElement as FocusableElementRef),
    lock: config.lock,
    escape: config.escape === undefined ? true : config.escape,
  } as SingleTrapConfig;
}

// Function returning whether two configs would result in the same trap. It doesn't deep compare functions.
// It's used to compares a newly received config with the one on top of `trapsStack` to avoid piling duplicate configs.
// TODO: The logic is too specific and can easily become buggy if `SimpleTrapConfig` is modified.
export function deepCompareConfings(x: SingleTrapConfig, y: SingleTrapConfig): boolean {
  const { root: x0, initialFocus: x1, returnFocus: x2, lock: x3, escape: x4 } = x;
  const { root: y0, initialFocus: y1, returnFocus: y2, lock: y3, escape: y4 } = y;

  // Shallow compare a property of two configs. They don't really distinguish between
  // `false`, `null` and `undefined` (the only falsy values that can show up in `SingleTrapConfig`).
  // TODO: This may as well be used to compare different properties, or a property with itself.
  const shallow = (a: any, b: any) => a === b || (!a && !b);

  if (process.env.NODE_ENV === 'development') {
    if (x0 === y0 && shallow(x1, y1) && shallow(x2, y2)) {
      if (shallow(x3, y3) && shallow(x4, y4)) return true;
    }
    console.warn(
      '`useSimpleFocusTrap` detected two trap configuration objects differing only in function references. Chances are you need to memoize the functions passed to the hook to avoid unwanted behaviours. More information can be found at: https://github.com/DaviDevMod/use-simple-focus-trap/blob/main/packages/use-simple-focus-trap#note-expansion-2-warning'
    );
    return false;
  }

  return x0 === y0 && shallow(x1, y1) && shallow(x2, y2) && shallow(x3, y3) && shallow(x4, y4);
}
