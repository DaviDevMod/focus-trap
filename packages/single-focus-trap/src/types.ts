export type Focusable = HTMLElement | SVGElement;

export interface Tabbables {
  roots: HTMLElement[];
  boundaries: (Focusable | null)[];
  edges: Focusable[];
}

export interface SingleTrapConfig {
  root: HTMLElement | HTMLElement[];
  initialFocus?: boolean | Focusable;
  returnFocus?: boolean | Focusable;
  lock?: boolean | Function;
  escape?: boolean | Function;
}

// Note how the simmetry in typings between `initialFocus` and `returnFocus` is broken as the `returnFocus` in here
// is the one resolved to its default, while the default `initialFocus` is consumed straight away and never stored.
export type Config = Omit<SingleTrapConfig, 'root' | 'returnFocus'> & { root: HTMLElement[] } & {
  returnFocus?: Focusable;
};

// Doing groupings like `'DEMOLISH' | 'RESUME' | 'PAUSE'` would break narrowing
// https://github.com/microsoft/TypeScript/issues/43026#issuecomment-789220358
export type SingleTrapControllerArgs =
  | { action: 'BUILD'; config: SingleTrapConfig }
  | { action: 'DEMOLISH'; config?: never }
  | { action: 'RESUME'; config?: never }
  | { action: 'PAUSE'; config?: never };
