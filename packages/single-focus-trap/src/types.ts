// An element has to be either an HTMLElement or an SVGElement to be able to receive focus.
export type Focusable = HTMLElement | SVGElement;

// `roots`:
//      array with the various root elements constituting the trap.
//      Only roots containing at least one tabbable element are found in here.
//`firstLast_positive`:
//      array containing the first and last zero-tab-indexes of each root, in sequence.
//      Then it has appended all the element in the trap with a psitive tab index, sorted.
//      (first, last, first, last, first, last, tabindex == 1, tabindex == 1, tabindex == 2)
// `topBottom`:
//      array containing the `topTabbable` and `bottomTabbable` of each root, in sequence.
export interface Kingpins {
  roots: HTMLElement[];
  firstLast_positive: (Focusable | null)[];
  topBottom: Focusable[];
}

// The shape of the config expected from the user of the trap.
export interface TrapConfig {
  roots: HTMLElement[];
  initialFocus?: boolean | Focusable;
  returnFocus?: boolean | Focusable;
  lock?: boolean | Function;
  escape?: boolean | Function;
}

// The shape of the config used internally by the singleton instance of `SingleTrap`.
// The `returnFocus` in `Config` is the one resolved to its default,
// while the `initialFocus` is never stored in `this.config`, just consumed straight away.
export type Config = Omit<TrapConfig, 'roots' | 'initialFocus' | 'returnFocus'> & { roots: HTMLElement[] } & {
  returnFocus?: Focusable;
};

// The shape of the argument that the user must pass to the default export `singleFocusTrap`,
// which correspond to the `.controller()` method of the singleton instance of `SingleTrap`.
export type TrapArg =
  | { action: 'BUILD'; config: TrapConfig }
  | { action: 'DEMOLISH'; config?: never }
  | { action: 'RESUME'; config?: never }
  | { action: 'PAUSE'; config?: never };
// Doing groupings like `'DEMOLISH' | 'RESUME' | 'PAUSE'` would break narrowing
// https://github.com/microsoft/TypeScript/issues/43026#issuecomment-789220358
