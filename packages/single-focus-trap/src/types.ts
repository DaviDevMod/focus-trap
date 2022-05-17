export type Focusable = HTMLElement | SVGElement;

export interface TrapRefs {
  roots: HTMLElement[];
  boundaries: (Focusable | null)[];
  edges: Focusable[];
}

export interface SingleTrapConfig {
  root: HTMLElement[] | HTMLElement;
  initialFocus?: Focusable;
  returnFocus?: Focusable;
  lock?: boolean | Function;
  escape?: boolean | Function;
}

export type Config = Omit<SingleTrapConfig, 'root'> & { root: HTMLElement[] };

export type SingleTrapControllerArgs =
  | { action: 'BUILD'; config: SingleTrapConfig }
  | { action: 'DEMOLISH'; config?: never }
  | { action: 'RESUME'; config?: never }
  | { action: 'PAUSE'; config?: never };
