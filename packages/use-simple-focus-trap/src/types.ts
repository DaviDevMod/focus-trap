import { Focusable, SingleTrapConfig } from '@single-focus-trap';

export type TrapRoot = (HTMLElement | string)[] | HTMLElement | string;

export interface TrapConfig {
  root: TrapRoot;
  initialFocus?: Focusable | string;
  returnFocus?: Focusable | string;
  lock?: boolean | Function;
  escape?: boolean | Function;
}

export type TrapParam = TrapConfig | TrapRoot;

export type ResolvedConfig = Omit<SingleTrapConfig, 'root'> & { root: HTMLElement[] } & {
  isReturnFocusDefault: boolean;
};

// Doing groupings like `'BUILD' | 'DEMOLISH'` and `'RESUME' | 'PAUSE'` would cause
// indirect narrowing to fail: https://github.com/microsoft/TypeScript/issues/48846
export type TrapsControllerParam =
  | { action: 'BUILD'; config: TrapParam }
  | { action: 'DEMOLISH'; config?: never }
  | { action: 'RESUME'; config?: never }
  | { action: 'PAUSE'; config?: never }
  | TrapParam
  | 'DEMOLISH'
  | 'RESUME'
  | 'PAUSE';

export type NormalizedParam =
  | { action: 'BUILD'; config: TrapConfig }
  | { action: 'DEMOLISH'; config?: never }
  | { action: 'RESUME'; config?: never }
  | { action: 'PAUSE'; config?: never };
