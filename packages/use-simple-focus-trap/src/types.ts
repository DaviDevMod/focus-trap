export type FocusableElementRef = HTMLElement | SVGElement | null;

export interface TrapRefs {
  mutationObserver: MutationObserver | null;
  firstTabbable: FocusableElementRef;
  lastTabbable: FocusableElementRef;
  lastMaxPositiveTabIndex: FocusableElementRef;
  firstZeroTabIndex: FocusableElementRef;
}

export interface SingleTrapConfig {
  root: HTMLElement;
  initialFocus?: FocusableElementRef;
  returnFocus?: FocusableElementRef;
  lock?: boolean | Function;
  escape?: boolean | Function;
  stackIsEmpty?: true;
}

export interface TrapConfig {
  root?: HTMLElement | string;
  initialFocus?: FocusableElementRef | string;
  returnFocus?: FocusableElementRef | string;
  lock?: boolean | Function;
  escape?: boolean | Function;
}

// Doing groupings like `'BUILD' | 'DEMOLISH'` and `'RESUME' | 'PAUSE'` would cause
// indirect narrowing to fail: https://github.com/microsoft/TypeScript/issues/48846
export type SingleTrapControllerArgs =
  | { action: 'BUILD'; config: SingleTrapConfig }
  | { action: 'DEMOLISH'; config: SingleTrapConfig }
  | { action: 'RESUME'; config?: never }
  | { action: 'PAUSE'; config?: never };

export type TrapsControllerArgs =
  | { action: 'BUILD'; config: TrapConfig }
  | { action: 'DEMOLISH'; config?: never }
  | { action: 'RESUME'; config?: never }
  | { action: 'PAUSE'; config?: never };
