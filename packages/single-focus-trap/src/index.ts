import { Config, Focusable, SingleTrapConfig, SingleTrapControllerArgs, Tabbables } from './types';
import {
  areTwoRadiosInSameGroup,
  focusable,
  getConsistentTabIndex,
  getTheCheckedRadio,
  isActuallyFocusable,
  isMutationAffectingTabbability,
  isRadioInput,
  mutationObserverInit,
} from './utils';

class SingleTrap {
  private static singletonInstance?: SingleTrap;
  private config!: Config;
  private tabbables!: Tabbables;
  private mutationObserver?: MutationObserver;
  private isUpdateScheduled!: boolean;

  constructor() {
    if (SingleTrap.singletonInstance) return SingleTrap.singletonInstance;
    SingleTrap.singletonInstance = this;
  }

  // Finds `edges` and `boundaries` within a list of elements and pushes them to the arrays in `this.tabbables`.
  // If there are no tabbable elements in the `list`, it returs `false` rather than performing the pushes.
  private pushConfines = (list: NodeListOf<HTMLElement | SVGElement>): boolean => {
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

      if (firstZero && lastZero) break; // In most cases this happens right after the first run of the loop.
    }

    if (!topTabbable) return false;

    this.tabbables.edges.push(topTabbable, bottomTabbable!);

    // Here we are potentially pushing `null`, but it's necessary to maintain proportionality between the indexes in
    // `roots`, `boundaries` and `edges`. So using the `boundaries` array always needs some extra care to avoid `null`.
    this.tabbables.boundaries.push(firstZero, lastZero);

    return true;
  };

  // Function that creates the arrays of tabbable elements that are found in `this.tabbables`.
  // Returns a boolean telling whether there is at least one tabbable element in the trap.
  private updateTabbables = (): boolean => {
    this.tabbables.roots = [];
    this.tabbables.boundaries = [];
    this.tabbables.edges = [];

    const listsOfFocusables: NodeListOf<HTMLElement | SVGElement>[] = [];
    for (const el of this.config.root) listsOfFocusables.push(el.querySelectorAll<HTMLElement | SVGElement>(focusable));

    for (let i = 0; i < listsOfFocusables.length; i++) {
      // Push a root to `this.tabbable.roots` only if it contains at least one tabbable.
      if (this.pushConfines(listsOfFocusables[i])) this.tabbables.roots.push(this.config.root[i]);
    }

    if (process.env.NODE_ENV !== 'production') {
      if (!this.tabbables.roots.length) {
        throw new Error('It looks like there are no tabbable elements in the trap');
      }
    }
    if (!this.tabbables.roots.length) return false;

    const positiveTabIndexes = listsOfFocusables
      .reduce((prev, curr) => {
        for (let i = 0; i < curr.length; i++) if (curr[i].tabIndex > 0) prev.push(curr[i]);
        return prev;
      }, [] as (HTMLElement | SVGElement)[])
      .sort((a, b) => a.tabIndex - b.tabIndex);

    this.tabbables.boundaries = this.tabbables.boundaries.concat(positiveTabIndexes);

    // WARNING: do not move the following assignment elsewhere. Expecially, do not put it before a `return false`.
    // If the trap doesn't have tabbables, the update must remain scheduled otherwise an infinite loop in `assistTabbing()`
    // may occur when looping through an array of `null`. This problem culd be solved in different ways eg, setting
    // a flag to `this`, or a limit of `2 * loopedArray.length` in the loops. However this is a quite remote scenario and
    // the current solution of unscheduling updates only in the very last statement of `updateTabbables` is just fine.
    return !(this.isUpdateScheduled = false);
  };

  // Callback for MutationObserver's constructor. It just schedules `tabbables` updates when required.
  private mutationCallback: MutationCallback = (records) => {
    if (this.isUpdateScheduled) return;
    const rootIndex = this.tabbables.roots.findIndex((el) => el.contains(records[0].target));
    const topTabbable = this.tabbables.edges[rootIndex * 2];
    const bottomTabbable = this.tabbables.edges[rootIndex * 2 + 1];

    let i = records.length;
    while (i--) {
      const record = records[i];
      // If there are no positive tab indexes in the trap     (very likely)
      // (or even just in the given root, but the chances are basically the same and checking the trap is easier)
      // and the mutation doesn't concern tab indexes,        (very likely)
      // it is possible to consider only mutations at
      // the edges of the given root, or outside of them.     (quite rare)
      // The same could be done if there are no zero tab indexes, but it would be counter productive.
      if (
        !this.tabbables.boundaries[this.tabbables.boundaries.length - 1]!.tabIndex &&
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
    if (!(target instanceof HTMLElement || target instanceof SVGElement)) return;
    if (this.isUpdateScheduled && !this.updateTabbables()) return;
    const { roots, boundaries, edges } = this.tabbables;
    let rootIndex = roots.findIndex((el) => el.contains(target as Node));
    let surrogateIndex = -1;
    if (rootIndex === -1) {
      // Index of first root that follows target, found as the index of the first root that precedes target + 1
      surrogateIndex =
        (boundaries.findIndex((el) => el && target.compareDocumentPosition(el) & 3) + 1) % boundaries.length;
    }
    let destination: Focusable | null = null;

    // All the loops that follow are here just to reassing `destination` in case it got assigned one of
    // the `null`s in `boundaries`. They are required to keep proportionality between the arrays in `this.tabbables`.
    // The loops can't be infinite ones unless the trap is empty, but in this case `assistTabbing()` returns early.

    if (rootIndex === -1) {
      if (target.tabIndex === 0) {
        for (let x = 0; !destination; x += 2) {
          destination =
            boundaries[(surrogateIndex * 2 + (shiftKey ? -x - 1 : x) + 5 * boundaries.length) % boundaries.length];
        }
      } else if (target.tabIndex > 0) {
        // Creating a temporary `tempBoundaries` array with `target` in it,
        // then using the same logic used for positive tab indexes inside of the trap.
        const positiveTabIndexes = boundaries.slice(edges.length) as Focusable[];
        positiveTabIndexes.push(target);
        positiveTabIndexes.sort((a, b) =>
          a.tabIndex === b.tabIndex ? (a.compareDocumentPosition(b) & 4 ? -1 : 1) : a.tabIndex - b.tabIndex
        );
        const tempBoundaries = boundaries.slice(0, edges.length).concat(positiveTabIndexes);
        const index = tempBoundaries.findIndex((el) => el === target);
        for (let x = 1; !destination; x++) {
          destination =
            tempBoundaries[(index + (shiftKey ? -x : x) + 5 * tempBoundaries.length) % tempBoundaries.length];
        }
      } else {
        destination = edges[(surrogateIndex * 2 - Number(shiftKey) + edges.length) % edges.length];
      }
    } else if (target.tabIndex === 0) {
      const firstZero = boundaries[rootIndex * 2];
      const lastZero = boundaries[rootIndex * 2 + 1];
      if (
        (shiftKey && (target === firstZero || areTwoRadiosInSameGroup(target, firstZero))) ||
        (!shiftKey && (target === lastZero || areTwoRadiosInSameGroup(target, lastZero)))
      ) {
        for (let x = 0; !destination; x += 2) {
          destination =
            boundaries[(rootIndex * 2 + (shiftKey ? -x - 1 : x + 2) + 5 * boundaries.length) % boundaries.length];
        }
      }
    } else if (target.tabIndex > 0) {
      const index = boundaries.findIndex((el) => el === target);
      for (let x = 1; !destination; x++) {
        destination = boundaries[(index + (shiftKey ? -x : x) + 5 * boundaries.length) % boundaries.length];
      }
    } else {
      const topTabbable = edges[rootIndex * 2];
      const bottomTabbable = edges[rootIndex * 2 + 1];
      if (topTabbable.compareDocumentPosition(target) & 2) {
        destination = edges[(rootIndex * 2 - Number(shiftKey) + edges.length) % edges.length];
      } else if (bottomTabbable.compareDocumentPosition(target) & 4) {
        destination = edges[(rootIndex * 2 + 2 - Number(shiftKey) + edges.length) % edges.length];
      }
    }

    if (destination) {
      event.preventDefault();
      if (isRadioInput(destination) && !destination.checked) {
        getTheCheckedRadio(destination)?.focus();
      } else destination.focus();
    }
  };

  private preventOutsideClicksHandler = (event: MouseEvent | TouchEvent): void => {
    if (this.config.root.every((el) => !el.contains(event.target as Node))) {
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
      if (escape !== false) this.demolish();
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
        (document[actionMap[action]] as Function)(event, this.preventOutsideClicksHandler, true);
      }
    }

    (document[actionMap[action]] as Function)('keydown', this.keyboardNavigationHandler, true);
  };

  private giveInitialFocus = ({ initialFocus }: SingleTrapConfig): void => {
    if (initialFocus instanceof HTMLElement || initialFocus instanceof SVGElement) return initialFocus.focus();

    if (initialFocus !== false) {
      this.updateTabbables();
      const { boundaries, edges } = this.tabbables;
      // Focus the first tabbable, being either the minimum positive tab index or the first zero tab index.
      return boundaries[edges.length % boundaries.length]?.focus();
    }
  };

  private getReturnFocus = ({ returnFocus }: SingleTrapConfig): Focusable | undefined => {
    const activeElement = document.activeElement;

    if (returnFocus instanceof HTMLElement || returnFocus instanceof SVGElement) return returnFocus;

    if (returnFocus !== false && (activeElement instanceof HTMLElement || activeElement instanceof SVGElement)) {
      return activeElement;
    }

    return undefined;
  };

  private resume = (isBuild?: boolean): void => {
    if (process.env.NODE_ENV !== 'production') {
      if (!this.mutationObserver) throw new Error('Cannot resume inexistent trap.');
    }
    if (!this.mutationObserver) return;
    for (const el of this.config.root) this.mutationObserver.observe(el, mutationObserverInit);
    this.isUpdateScheduled = true;
    if (isBuild) this.giveInitialFocus(this.config);
    this.eventListeners('ADD');
  };

  // @ts-ignore
  private build = (config: SingleTrapConfig): void => {
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
      this.eventListeners('REMOVE');
    } else this.mutationObserver = new MutationObserver(this.mutationCallback);
    this.config = {
      ...config,
      root:
        config.root instanceof Array
          ? config.root.sort((a, b) => (a.compareDocumentPosition(b) & 4 ? -1 : 1))
          : [config.root],
      returnFocus: this.getReturnFocus(config),
    };
    this.tabbables = {} as Tabbables;
    this.resume(true);
  };

  private pause = (): void => {
    if (process.env.NODE_ENV !== 'production') {
      if (!this.mutationObserver) throw new Error('Cannot pause inexistent trap.');
    }
    if (!this.mutationObserver) return;
    this.mutationObserver.disconnect();
    this.eventListeners('REMOVE');
  };

  private demolish = (): void => {
    if (process.env.NODE_ENV !== 'production') {
      if (!this.mutationObserver) throw new Error('Cannot demolish inexistent trap.');
    }
    if (!this.mutationObserver) return;
    this.pause();
    this.config.returnFocus?.focus();
    this.tabbables = undefined as unknown as Tabbables;
    this.config = undefined as unknown as Config;
    this.mutationObserver = undefined;
  };

  public controller = ({ action, config }: SingleTrapControllerArgs): void =>
    (this[action.toLowerCase() as keyof SingleTrap] as Function)(config);
}

const singleTrap = new SingleTrap().controller;

export { singleTrap };
export type { Focusable, SingleTrapConfig, SingleTrapControllerArgs };
