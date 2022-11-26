import { Config, Focusable, TrapConfig, TrapArg, Kingpins } from './types';
import { candidate, getConsistentTabIndex, getDestination, isActuallyFocusable } from './utils';

class SingleTrap {
  private static singletonInstance?: SingleTrap;
  private config!: Config;
  private kingpins!: Kingpins;
  private trapExistence!: boolean;

  constructor() {
    if (SingleTrap.singletonInstance) return SingleTrap.singletonInstance;
    SingleTrap.singletonInstance = this;
  }

  // Finds `topBottom` and `firstLast_positive` within a list of elements and pushes them to the arrays in `this.kingpins`.
  // If there are no tabbable elements in the list, it returs `false` rather than performing the pushes, `true` otherwise.
  private getKingpins = (list: Focusable[]): boolean => {
    let firstZero: Focusable | null = null;
    let lastZero: Focusable | null = null;
    let topTabbable: Focusable | null = null;
    let bottomTabbable: Focusable | null = null;
    const len = list.length;

    for (let i = 0; i < len; i++) {
      const left = list[i];
      const right = list[len - 1 - i];

      if (!left.tabIndex || (left.tabIndex < 0 && !getConsistentTabIndex(left))) {
        if (!firstZero && isActuallyFocusable(left)) {
          firstZero = left;
          if (!topTabbable) topTabbable = left;
        }
      } else if (left.tabIndex > 0 && !topTabbable && isActuallyFocusable(left)) topTabbable = left;

      if (!right.tabIndex || (right.tabIndex < 0 && !getConsistentTabIndex(right))) {
        if (!lastZero && isActuallyFocusable(right)) {
          lastZero = right;
          if (!bottomTabbable) bottomTabbable = right;
        }
      } else if (right.tabIndex > 0 && !bottomTabbable && isActuallyFocusable(right)) bottomTabbable = right;

      if (firstZero && lastZero) break; // In most cases this happens in the first run of the loop.
    }

    if (!topTabbable) return false;

    this.kingpins.topBottom.push(topTabbable, bottomTabbable!);

    // Here we are potentially pushing `null`, but it's necessary to maintain proportionality between the indexes in
    // `roots`, `firstLast_positive` and `topBottom`. So using the `firstLast_positive` array always needs some extra care to avoid `null`.
    this.kingpins.firstLast_positive.push(firstZero, lastZero);

    return true;
  };

  // Function that creates the arrays of tabbable elements that are found in `this.kingpins`.
  // Returns a boolean telling whether there is at least one tabbable element in the trap.
  private updateKingpins = (): boolean => {
    this.kingpins.roots = [];
    this.kingpins.firstLast_positive = [];
    this.kingpins.topBottom = [];

    const cnadidatesLists: Focusable[][] = [];
    for (const el of this.config.roots) cnadidatesLists.push([el, ...el.querySelectorAll<Focusable>(candidate)]);

    for (let i = 0; i < cnadidatesLists.length; i++) {
      // Push a root to `this.kingpins.roots` only if it contains at least one tabbable element.
      if (this.getKingpins(cnadidatesLists[i])) this.kingpins.roots.push(this.config.roots[i]);
    }

    if (process.env.NODE_ENV !== 'production') {
      if (!this.kingpins.roots.length) {
        throw new Error('It looks like there are no tabbable elements in the trap');
      }
    }
    if (!this.kingpins.roots.length) return false;

    const positiveTabIndexes = cnadidatesLists
      .reduce((prev, curr) => {
        for (let i = 0; i < curr.length; i++) if (curr[i].tabIndex > 0) prev.push(curr[i]);
        return prev;
      }, [] as (HTMLElement | SVGElement)[])
      .sort((a, b) => a.tabIndex - b.tabIndex);

    this.kingpins.firstLast_positive = this.kingpins.firstLast_positive.concat(positiveTabIndexes);

    return true;
  };

  private assistTabbing = (event: KeyboardEvent): void => {
    const { target, shiftKey } = event;
    // Return early if `target` is not tabbable.
    if (!(target instanceof HTMLElement || target instanceof SVGElement)) return;
    // Update the trap and return early if it doesn't contain at least one tabbable element.
    if (!this.updateKingpins()) return;
    const { roots, firstLast_positive, topBottom } = this.kingpins;
    let rootIndex = roots.findIndex((el) => el.contains(target as Node));
    let destination: Focusable | null = null;

    // `target` doesn't belong to the focus trap.
    if (rootIndex === -1) {
      let surrogateIndex = roots.findIndex((el) => target.compareDocumentPosition(el) & 5);
      if (surrogateIndex === -1) surrogateIndex = roots.length;

      if (target.tabIndex === 0) {
        destination = getDestination(firstLast_positive, surrogateIndex * 2, (x) =>
          shiftKey ? -x * 2 + 1 : x * 2 - 2
        );
      } else if (target.tabIndex > 0) {
        // Creating a temporary `tempFirstLast_positive` array with `target` in it,
        // then using the same logic used for positive tab indexes inside of the trap.
        const positiveTabIndexes = firstLast_positive.slice(topBottom.length) as Focusable[];
        positiveTabIndexes.push(target);
        positiveTabIndexes.sort((a, b) =>
          a.tabIndex === b.tabIndex ? (a.compareDocumentPosition(b) & 4 ? -1 : 1) : a.tabIndex - b.tabIndex
        );
        const tempFirstLast_positive = firstLast_positive.slice(0, topBottom.length).concat(positiveTabIndexes);
        const tempIndex = tempFirstLast_positive.findIndex((el) => el === target);
        destination = getDestination(tempFirstLast_positive, tempIndex, (x) => (shiftKey ? -x : x));
      } else {
        destination = getDestination(topBottom, surrogateIndex * 2, () => -Number(shiftKey));
      }
    }
    // `target` belongs to the focus trap.
    else if (target.tabIndex === 0) {
      const firstZero = firstLast_positive[rootIndex * 2];
      const lastZero = firstLast_positive[rootIndex * 2 + 1];
      if ((shiftKey && target === firstZero) || (!shiftKey && target === lastZero)) {
        destination = getDestination(firstLast_positive, rootIndex * 2, (x) => (shiftKey ? -x * 2 + 1 : x * 2));
      }
    } else if (target.tabIndex > 0) {
      const index = firstLast_positive.findIndex((el) => el === target);
      destination = getDestination(firstLast_positive, index, (x) => (shiftKey ? -x : x));
    } else {
      const topTabbable = topBottom[rootIndex * 2];
      const bottomTabbable = topBottom[rootIndex * 2 + 1];
      if (topTabbable.compareDocumentPosition(target) & 2) {
        destination = getDestination(topBottom, rootIndex * 2, () => -Number(shiftKey));
      } else if (bottomTabbable.compareDocumentPosition(target) & 4) {
        destination = getDestination(topBottom, rootIndex * 2, () => 2 - Number(shiftKey));
      }
    }

    if (destination) {
      event.preventDefault();
      destination.focus();
    }
  };

  private outsideClicksHandler = (event: MouseEvent | TouchEvent): void => {
    if (this.config.roots.every((el) => !el.contains(event.target as Node))) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  };

  private keyboardNavigationHandler = (event: KeyboardEvent): void => {
    if (event.key === 'Tab' || event.keyCode === 9) {
      this.assistTabbing(event);
    } else if (event.key === 'Escape' || event.key === 'Esc' || event.keyCode === 27) {
      const escape = this.config.escape;
      if (escape instanceof Function) return escape(event);
      if (escape !== false) this.DEMOLISH(true);
    }
  };

  private eventListeners = (action: 'ADD' | 'REMOVE'): void => {
    const actionMap = {
      ADD: 'addEventListener' as keyof Document,
      REMOVE: 'removeEventListener' as keyof Document,
    };
    const lock = this.config.lock;

    if (lock instanceof Function) {
      (document[actionMap[action]] as Function)('click', lock, true);
    } else if (lock !== false) {
      for (const event of ['mousedown', 'touchstart', 'click']) {
        (document[actionMap[action]] as Function)(event, this.outsideClicksHandler, true);
      }
    }

    (document[actionMap[action]] as Function)('keydown', this.keyboardNavigationHandler, true);
  };

  private giveInitialFocus = ({ initialFocus }: TrapConfig): void => {
    if (initialFocus instanceof HTMLElement || initialFocus instanceof SVGElement) return initialFocus.focus();

    if (initialFocus !== false) {
      this.updateKingpins();
      const { firstLast_positive, topBottom } = this.kingpins;
      // Focus the first tabbable, being either the minimum positive tab index or the first zero tab index.
      return firstLast_positive[topBottom.length % firstLast_positive.length]?.focus();
    }
  };

  private getReturnFocus = ({ returnFocus }: TrapConfig): Focusable | undefined => {
    const activeElement = document.activeElement;

    if (returnFocus instanceof HTMLElement || returnFocus instanceof SVGElement) return returnFocus;

    if (returnFocus !== false && (activeElement instanceof HTMLElement || activeElement instanceof SVGElement)) {
      return activeElement;
    }
  };

  private RESUME = (): void => {
    if (process.env.NODE_ENV !== 'production') {
      if (!this.trapExistence) throw new Error('Cannot resume inexistent trap.');
    }
    if (!this.trapExistence) return;
    this.eventListeners('ADD');
  };

  private BUILD = (config: TrapConfig): void => {
    if (this.trapExistence) this.eventListeners('REMOVE');
    this.config = {
      ...config,
      roots: config.roots.sort((a, b) => (a.compareDocumentPosition(b) & 4 ? -1 : 1)),
      returnFocus: this.getReturnFocus(config),
    };
    this.kingpins = {} as Kingpins;
    this.trapExistence = true;
    this.giveInitialFocus(this.config);
    this.RESUME();
  };

  private PAUSE = (isEsc?: boolean): void => {
    if (process.env.NODE_ENV !== 'production') {
      if (this.trapExistence && !isEsc) throw new Error('Cannot pause inexistent trap.');
    }
    if (this.trapExistence && !isEsc) return;
    this.eventListeners('REMOVE');
  };

  private DEMOLISH = (isEsc?: boolean): void => {
    if (process.env.NODE_ENV !== 'production') {
      if (this.trapExistence && !isEsc) throw new Error('Cannot demolish inexistent trap.');
    }
    if (this.trapExistence && !isEsc) return;
    this.PAUSE(isEsc);
    this.trapExistence = false;
    this.config.returnFocus?.focus();
  };

  // A `config` can be passed only if `action === 'BUILD`.
  // @ts-expect-error
  public controller = ({ action, config }: TrapArg): void => this[action](config);
}

const singleFocusTrap = new SingleTrap().controller;

export { singleFocusTrap };
export type { Focusable, TrapConfig, TrapArg };
