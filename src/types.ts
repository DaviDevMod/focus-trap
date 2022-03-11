export type FocusableElementRef = HTMLElement | SVGElement | null;

export type FocusableElementIdentifier = string | FocusableElementRef;

export interface TrapBoundaries {
  firstTabbable: FocusableElementRef;
  lastTabbable: FocusableElementRef;
  lastMaxPositiveTabIndex: FocusableElementRef;
  firstZeroTabIndex: FocusableElementRef;
}

export interface Escaper {
  keepTrap?: boolean;
  custom?: Function;
  identifier?: FocusableElementIdentifier;
  focus?: boolean;
}

export interface TrapConfig {
  trapRoot: string | HTMLElement;
  initialFocus?: FocusableElementIdentifier;
  returnFocus?: FocusableElementIdentifier;
  locker?: boolean | Function;
  escaper?: Escaper;
}
