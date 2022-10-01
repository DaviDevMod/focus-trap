import { Config, Focusable, TrapConfig, TrapArg, Kingpins } from './types';
import {
  areTwoRadiosInTheSameGroup,
  candidate,
  getConsistentTabIndex,
  getDestination,
  getTheCheckedRadio,
  isActuallyFocusable,
  isMutationAffectingTabbability,
  isRadioInput,
  mutationObserverInit,
} from './utils';

class SingleTrap {
  private static singletonInstance?: SingleTrap;
  private config!: Config;
  private kingpins!: Kingpins;
  private mutationObserver?: MutationObserver;
  private isUpdateScheduled!: boolean;

  constructor() {
    if (SingleTrap.singletonInstance) return SingleTrap.singletonInstance;
    SingleTrap.singletonInstance = this;
  }

  // Finds `topBottom` and `firstLast_positive` within a list of elements and pushes them to the arrays in `this.kingpins`.
  // If there are no tabbable elements in the list, it returs `false` rather than performing the pushes, `true` otherwise.
  private getKingpins = (list: NodeListOf<HTMLElement | SVGElement>): boolean => {
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

    const cnadidatesLists: NodeListOf<HTMLElement | SVGElement>[] = [];
    for (const el of this.config.roots) cnadidatesLists.push(el.querySelectorAll<HTMLElement | SVGElement>(candidate));

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

    // If the trap doesn't have tabbable elements, the update must remain scheduled; otherwise an infinite loop
    // may occur in `getDestination()` (called by `assistTabbing()`) when looping through an array of `null`s.
    // There is actually a safety net condition in `getDestination()` that prevents infinite loops, but still
    // the correct logic is to unschedule updates only after assessing that the trap contains at least one
    // tabbable element, doing it in the very last statement of `updateKingpins()` avoids any trouble.
    return !(this.isUpdateScheduled = false);
  };

  // Callback for MutationObserver's constructor. It just schedules a `kingpins` update when required.
  private mutationCallback: MutationCallback = (records) => {
    if (this.isUpdateScheduled) return;
    const rootIndex = this.kingpins.roots.findIndex((el) => el.contains(records[0].target));
    const topTabbable = this.kingpins.topBottom[rootIndex * 2];
    const bottomTabbable = this.kingpins.topBottom[rootIndex * 2 + 1];

    let i = records.length;
    while (i--) {
      const record = records[i];
      // If there are no positive tab indexes in the trap     (very likely)
      // (or even just in the given root, but the chances are basically the same and checking the trap is easier)
      // and the mutation doesn't concern tab indexes,        (very likely)
      // it is possible to consider only mutations at
      // the topBottom of the given root, or outside of them.     (quite rare)
      // The same could be done if there are no zero tab indexes, but it would be counter productive.
      if (
        !this.kingpins.firstLast_positive[this.kingpins.firstLast_positive.length - 1]!.tabIndex &&
        record.attributeName !== 'tabindex'
      ) {
        // If `record.target` precedes `topTabbable` or succeeds `bottomTabbable`,
        // or it is one of them, or one of their ancestors.
        if (
          record.target === topTabbable ||
          record.target === bottomTabbable ||
          topTabbable.compareDocumentPosition(record.target) & 11 ||
          bottomTabbable.compareDocumentPosition(record.target) & 13
        ) {
          if (isMutationAffectingTabbability(record)) return (this.isUpdateScheduled = true);
        }
      } else if (isMutationAffectingTabbability(record)) return (this.isUpdateScheduled = true);
    }
  };

  private assistTabbing = (event: KeyboardEvent): void => {
    const { target, shiftKey } = event;
    // Return early if `target` is not tabbable.
    if (!(target instanceof HTMLElement || target instanceof SVGElement)) return;
    // If an update was scheduled, update the trap's kingpins;
    // then return early if the trap doesn't contain at least one tabbable element.
    if (this.isUpdateScheduled && !this.updateKingpins()) return;
    const { roots, firstLast_positive, topBottom } = this.kingpins;
    let rootIndex = roots.findIndex((el) => el.contains(target as Node));
    let surrogateIndex = -1;
    if (rootIndex === -1) {
      // Index of first root that follows target, found as the index of the first root that precedes target + 1
      surrogateIndex =
        (firstLast_positive.findIndex((el) => el && target.compareDocumentPosition(el) & 3) + 1) %
        firstLast_positive.length;
    }
    let destination: Focusable | null = null;

    // `target` doesn't belong to the focus trap.
    if (rootIndex === -1) {
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
      if (
        (shiftKey && (target === firstZero || areTwoRadiosInTheSameGroup(target, firstZero))) ||
        (!shiftKey && (target === lastZero || areTwoRadiosInTheSameGroup(target, lastZero)))
      ) {
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
      if (isRadioInput(destination) && !destination.checked) getTheCheckedRadio(destination)?.focus();
      else destination.focus();
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
      if (escape !== false) this.DEMOLISH();
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
      if (!this.mutationObserver) throw new Error('Cannot resume inexistent trap.');
    }
    if (!this.mutationObserver) return;
    for (const el of this.config.roots) this.mutationObserver.observe(el, mutationObserverInit);
    // `RESUME` called indirectly, through `BUILD`. A trap update may be needed to give the initial focus.
    if (this.isUpdateScheduled) this.giveInitialFocus(this.config);
    // `RESUME` called directly. Just schedule an update. There is no need to update the trap right now.
    else this.isUpdateScheduled = true;
    this.eventListeners('ADD');
  };

  private BUILD = (config: TrapConfig): void => {
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
      this.eventListeners('REMOVE');
    } else this.mutationObserver = new MutationObserver(this.mutationCallback);
    this.config = {
      ...config,
      roots: config.roots.sort((a, b) => (a.compareDocumentPosition(b) & 4 ? -1 : 1)),
      returnFocus: this.getReturnFocus(config),
    };
    this.kingpins = {} as Kingpins;
    this.isUpdateScheduled = true;
    this.RESUME();
  };

  private PAUSE = (): void => {
    if (process.env.NODE_ENV !== 'production') {
      if (!this.mutationObserver) throw new Error('Cannot pause inexistent trap.');
    }
    if (!this.mutationObserver) return;
    // Need to unschedule updates so that `RESUME` can know if it's called directly or through `BUILD`.
    this.isUpdateScheduled = false;
    this.mutationObserver.disconnect();
    this.eventListeners('REMOVE');
  };

  private DEMOLISH = (): void => {
    if (process.env.NODE_ENV !== 'production') {
      if (!this.mutationObserver) throw new Error('Cannot demolish inexistent trap.');
    }
    if (!this.mutationObserver) return;
    this.PAUSE();
    this.config.returnFocus?.focus();
    this.kingpins = undefined as unknown as Kingpins;
    this.config = undefined as unknown as Config;
    this.mutationObserver = undefined;
  };

  public controller = ({ action, config }: TrapArg): void => this[action](config!);
}

const singleFocusTrap = new SingleTrap().controller;

export { singleFocusTrap };
export type { Focusable, TrapConfig, TrapArg };
