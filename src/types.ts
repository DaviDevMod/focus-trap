import { TabbableOptions, CheckOptions } from 'tabbable';

export type FocusableElementRef = HTMLElement | SVGElement | null;

export type FocusableElementIdentifier = string | FocusableElementRef;

export type ActionsOnTrappedElement = 'CLICK' | 'FOCUS';

interface Escaper {
  keepTrap?: boolean;
  custom?: Function;
  identifier?: FocusableElementIdentifier;
  beGentle?: boolean;
}

export interface TrapConfig {
  trapRoot: string | HTMLElement;
  escaper?: Escaper;
  initialFocus?: FocusableElementIdentifier;
  returnFocus?: FocusableElementIdentifier;
  locked?: boolean | Function;
  tabbableConfig?: TabbableOptions & CheckOptions;
}
