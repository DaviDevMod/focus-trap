import { Focusable } from '@single-focus-trap';

export type TrapRoot = (HTMLElement | string)[] | HTMLElement | string;

export interface TrapConfig {
  root: TrapRoot;
  initialFocus?: boolean | Focusable | string;
  returnFocus?: boolean | Focusable | string;
  lock?: boolean | Function;
  escape?: boolean | Function;
}

export interface ResolvedConfig {
  root: HTMLElement[];
  initialFocus?: boolean | Focusable;
  returnFocus?: boolean | Focusable;
  lock?: boolean | Function;
  escape?: boolean | Function;
}

export type TrapParam = TrapConfig | TrapRoot;

export type TrapsControllerParam =
  | { action: 'PUSH'; config: TrapParam }
  | { action: 'BUILD'; config: TrapParam }
  | { action: 'DEMOLISH'; config?: never }
  | { action: 'RESUME'; config?: never }
  | { action: 'PAUSE'; config?: never }
  | TrapParam
  | 'DEMOLISH'
  | 'RESUME'
  | 'PAUSE';

export type NormalizedParam =
  | { action: 'PUSH'; config: TrapConfig }
  | { action: 'BUILD'; config: TrapConfig }
  | { action: 'DEMOLISH'; config?: never }
  | { action: 'RESUME'; config?: never }
  | { action: 'PAUSE'; config?: never };
