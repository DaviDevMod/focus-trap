import { Config, Focusable, SingleTrapConfig, SingleTrapControllerArgs, TrapRefs } from './types';
import {
  areTwoRadiosInSameGroup,
  focusable,
  getConsistentTabIndex,
  getTheCheckedRadio,
  isActuallyFocusable,
  isMutationAffectingTabbability,
  isRadioInput,
  mutattionObserverInit,
} from './utils';

class SingleTrap {
  private config!: Config;
  private refs!: TrapRefs;
  private mutationObserver?: MutationObserver;
  private isUpdateScheduled!: boolean;

  constructor(config?: SingleTrapConfig) {
    if (config) this.build(config);
  }

  // Push the `boundaries` and the `edges` of a `roots` into the `this.refs`
  // Returns a boolean telling whether there was at least one tabbable element in the given `list`.
  private pushRefs = (list: NodeListOf<HTMLElement | SVGElement>): boolean => {
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
    }

    if (!topTabbable) return false;

    this.refs.edges.push(topTabbable, bottomTabbable!);

    // Here we are potentially pushing `null`, but it's necessary to maintain proportionality between the refs in
    // `roots`, `boundaries` and `edges`. So using the `boundaries` array always needs some extra care to avoid `null`
    this.refs.boundaries.push(firstZero, lastZero);

    return true;
  };

  // Function that creates the arrays of tabbable elements that are found in `this.refs`.
  // Return a boolean telling whether there is at least one tabbable element in the trap.
  // In development, trows an error if there are no tabbabble elements in the trap.
  private updateRefs = (): boolean => {
    this.refs.roots = [];
    this.refs.boundaries = [];
    this.refs.edges = [];

    const listsOfFocusables: NodeListOf<HTMLElement | SVGElement>[] = [];
    for (const el of this.config.root) listsOfFocusables.push(el.querySelectorAll<HTMLElement | SVGElement>(focusable));

    for (let i = 0; i < listsOfFocusables.length; i++) {
      if (this.pushRefs(listsOfFocusables[i])) this.refs.roots.push(this.config.root[i]);
    }

    const positiveTabIndexes = listsOfFocusables
      .reduce((prev, curr) => {
        for (let i = 0; i < curr.length; i++) if (curr[i].tabIndex > 0) prev.push(curr[i]);
        return prev;
      }, [] as (HTMLElement | SVGElement)[])
      .sort((a, b) => a.tabIndex - b.tabIndex);

    this.refs.boundaries = this.refs.boundaries.concat(positiveTabIndexes);

    if (process.env.NODE_ENV === 'development') {
      if (!this.refs.boundaries.length) {
        throw new Error('It looks like there are no tabbable elements in the trap');
      }
    }
    if (!this.refs.boundaries.length) return false;

    // `isUpdateScheduled` has to be set only after returning `false`, otherwise next time a TAB event occurs
    // if `isUpdateScheduled` is `false`, `assistTabbing()` can't know that there are no tabbables in the trap.
    // I have not tested this scenario yet, but it should result in infinite loops in `assistTabbing()`.
    // Could set a flag on `this`, but it's a very remote edge case and the current solution is just fine.
    this.isUpdateScheduled = false;

    return true;
  };

  // Callback for MutationObserver's constructor. It just schedules `refs` updates when required.
  private mutationCallback: MutationCallback = (records) => {
    if (this.isUpdateScheduled) return;
    const index = this.refs.roots.findIndex((el) => el.contains(records[0].target));
    const topTabbable = this.refs.edges[index * 2];
    const bottomTabbable = this.refs.edges[index * 2 + 1];

    let i = records.length;
    while (i--) {
      const record = records[i];
      // If there are no positive tab indexes in the trap             (very likely)
      // and the mutation doesn't concern tab indexes,                (very likely)
      // it is possible to consider only mutations on outer elements. (quite rare)
      // The same could be done if there are no zero tab indexes, but it would be counter productive.
      if (!this.refs.boundaries[this.refs.boundaries.length - 1]!.tabIndex && record.attributeName !== 'tabindex') {
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

  private assistTabbing = (event: KeyboardEvent) => {
    const { target, shiftKey } = event;
    if (!(target instanceof HTMLElement || target instanceof SVGElement)) return;
    if (this.isUpdateScheduled && !this.updateRefs()) return;
    const { roots, boundaries, edges } = this.refs;
    let rootIndex = roots.findIndex((el) => el.contains(target as Node));
    let surrogateIndex = -1;
    if (rootIndex === -1) {
      // Index of first root that follows target, found as the index of the first root that precedes target + 1
      surrogateIndex =
        (boundaries.findIndex((el) => el && target.compareDocumentPosition(el) & 3) + 1) % boundaries.length;
    }
    let destination: Focusable | null = null;

    // All the loops that follow are here just to reassing `destination` in case it got assigned one of
    // the `null`s in `boundaries`. They are required, see comment at the end of `pushRefs` for some context.
    // The loops can't be infinite ones unless the trap is empty, but in this case `assistTabbing` returns early.

    // `target` is outside of the trap.
    if (rootIndex === -1) {
      if (target.tabIndex === 0) {
        for (let x = 0; !destination; x += 2) {
          destination = boundaries[(surrogateIndex * 2 + (shiftKey ? -x - 1 : x)) % boundaries.length];
        }
      } else if (target.tabIndex > 0) {
        // Creating a temporaty `newBoundaries` array with `target` in it,
        // then using the same logic used for positive tab indexes inside of the trap.
        const positiveTabIndexes = boundaries.slice(edges.length) as Focusable[];
        positiveTabIndexes.push(target);
        positiveTabIndexes.sort((a, b) =>
          a.tabIndex === b.tabIndex ? (a.compareDocumentPosition(b) & 4 ? -1 : 1) : a.tabIndex - b.tabIndex
        );
        const newBoundaries = boundaries.slice(0, edges.length).concat(positiveTabIndexes);
        const index = newBoundaries.findIndex((el) => el === target);
        for (let x = 1; !destination; x++) {
          destination = newBoundaries[(index + (shiftKey ? -x : x) + newBoundaries.length) % newBoundaries.length];
        }
      } else {
        destination = edges[(surrogateIndex * 2 - Number(shiftKey)) % edges.length];
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
            boundaries[(rootIndex * 2 + (shiftKey ? -x - 1 : x + 2) + boundaries.length) % boundaries.length];
        }
      }
    } else if (target.tabIndex > 0) {
      const index = boundaries.findIndex((el) => el === target);
      for (let x = 1; !destination; x++) {
        destination = boundaries[(index + (shiftKey ? -x : x) + boundaries.length) % boundaries.length];
      }
    } else {
      const precedesTopmost = target.compareDocumentPosition(edges[0]) & 5;
      const followsBottommost = target.compareDocumentPosition(edges[edges.length - 1]) & 3;
      if (precedesTopmost || followsBottommost) destination = edges[shiftKey ? edges.length - 1 : 0];
    }

    if (destination) {
      event.preventDefault();
      if (isRadioInput(destination) && !destination.checked) {
        getTheCheckedRadio(destination)?.focus();
      } else destination.focus();
    }
  };

  // Handler for clicks happening on nodes not belonging to the trap's root.
  private outsideClicksHandler = (event: MouseEvent | TouchEvent) => {
    const { root, lock } = this.config;
    if (root.every((el) => !el.contains(event.target as Node))) {
      if (lock instanceof Function) lock(event);
      else if (lock) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    }
  };

  // Handler for keybord events.
  private keyboardNavigationHandler = (event: KeyboardEvent) => {
    if (event.key === 'Tab' || event.keyCode === 9) {
      this.assistTabbing(event);
    } else if (event.key === 'Escape' || event.key === 'Esc' || event.keyCode === 27) {
      const escape = this.config.escape;
      if (escape instanceof Function) return escape();
      if (escape === true) this.demolish();
    }
  };

  // Funtion that adds and removes event listeners.
  private eventListeners = (action: 'ADD' | 'REMOVE') => {
    const actionMap = {
      ADD: 'addEventListener' as keyof Document,
      REMOVE: 'removeEventListener' as keyof Document,
    };
    const handlers: [keyof DocumentEventMap, React.EventHandler<any>][] = [
      ['keydown', this.keyboardNavigationHandler],
      ['mousedown', this.outsideClicksHandler],
      ['touchstart', this.outsideClicksHandler],
      ['click', this.outsideClicksHandler],
    ];
    // Spread operator for fixed lenght tuples has not been implemented yet
    // https://github.com/Microsoft/TypeScript/issues/4130#issuecomment-303486552
    for (const handler of handlers) (document[actionMap[action]] as Function)(handler[0], handler[1], true);
  };

  private resume = () => {
    if (process.env.NODE_ENV === 'development') {
      if (!this.mutationObserver) throw new Error('Cannot resume inexistent trap.');
    }
    if (!this.mutationObserver) return;
    for (const el of this.config.root) this.mutationObserver.observe(el, mutattionObserverInit);
    this.refs = {} as TrapRefs;
    this.isUpdateScheduled = true;
    this.eventListeners('ADD');
  };

  private build = (config: SingleTrapConfig) => {
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
    };
    this.resume();
  };

  private pause = () => {
    if (process.env.NODE_ENV === 'development') {
      if (!this.mutationObserver) throw new Error('Cannot pause inexistent trap.');
    }
    if (!this.mutationObserver) return;
    this.eventListeners('REMOVE');
    this.refs = undefined as unknown as TrapRefs;
    this.mutationObserver.disconnect();
  };

  private demolish = () => {
    this.pause();
    this.config.returnFocus?.focus();
    this.config = undefined as unknown as Config;
    this.mutationObserver = undefined;
  };

  public controller = ({ action, config }: SingleTrapControllerArgs): void =>
    (this[action.toLowerCase() as keyof SingleTrap] as Function)(config);
}

export { SingleTrap, Focusable, SingleTrapConfig, SingleTrapControllerArgs };
