import { Focusable, TrapConfig as ResolvedConfig } from 'single-focus-trap';

// A trap root can be provided either as an element or as the `id` of an element.
export type TrapRoot = (HTMLElement | string)[] | HTMLElement | string;

// The shape of the config expected from the user of the trap.
export interface TrapConfig {
  roots: TrapRoot;
  initialFocus?: boolean | Focusable | string;
  returnFocus?: boolean | Focusable | string;
  lock?: boolean | Function;
  escape?: boolean | Function;
}

// The shape of the argument with which the `trapsController` (return value of the hook) has to be called.
export type TrapArg =
  | { action: 'PUSH'; config: TrapRoot | TrapConfig }
  | { action: 'BUILD'; config: TrapRoot | TrapConfig }
  | { action: 'DEMOLISH'; config?: never }
  | { action: 'RESUME'; config?: never }
  | { action: 'PAUSE'; config?: never }
  | TrapRoot
  | TrapConfig
  | 'DEMOLISH'
  | 'RESUME'
  | 'PAUSE';

// Normalized state of `TrapArg`, which has been checked for irregularities and
// whose shorthands (like TrapRoot | 'PAUSE') have been brought to be properties of an object.
export type NormalizedTrapArg =
  | { action: 'PUSH'; config: TrapConfig }
  | { action: 'BUILD'; config: TrapConfig }
  | { action: 'DEMOLISH'; config?: never }
  | { action: 'RESUME'; config?: never }
  | { action: 'PAUSE'; config?: never };

// The shape of the configs that are stored in the `trapsStack`.
// It is also the `TrapConfig` expected by single-focus-trap.
export type { ResolvedConfig };

// An element has to be either an HTMLElement or an SVGElement to be able to receive focus.
export type { Focusable };
