## The State

The library manages a global [state](https://github.com/DaviDevMod/focus-trap/blob/main/packages/focus-trap/src/state.ts) containing:

- A `rawConfig`, which is the one provided by the user of the package
- A `normalisedConfig` that is the one actually used by the library, it has default values set and IDs resolved to actual elements
- An `isBuilt` boolean indicating whether a focus trap has been built (and not demolished yet)

## The Build

When [focus-trap](https://github.com/DaviDevMod/focus-trap/blob/main/packages/focus-trap/src/index.ts) is called with a `TrapConfig` (or at least the `Roots`) a [build](https://github.com/DaviDevMod/focus-trap/blob/main/packages/focus-trap/src/trap-actions.ts) action is performed:

- Demolish any already built trap
- Update the global state
- Give the `initialFocus`
- Add event listeners to the DOM

## The Events

There are only two [event handlers](https://github.com/DaviDevMod/focus-trap/blob/main/packages/focus-trap/src/events.ts):

- One meant to handle click outside of the trap
- The other handling <kbd>Tab</kbd> and <kbd>Esc</kbd> key presses

The main fuctionality of the package lies in the handling of <kbd>Tab</kbd> key presses.

On a <kbd>Tab</kbd> key press, the `roots` of the `normalisedConfig` are updated (to account for any relevant DOM mutation since the last key press) and the right destination element is found and focused.

## The Destination

There are three kinds of elements, based on tab index and document order, that need to be considered to find a [destination](https://github.com/DaviDevMod/focus-trap/blob/main/packages/focus-trap/src/destination.ts):

- `topOrBottomTabbable` is the first/last tabbable element in document order within a given root element
- `firstOrLastZeroTabbable` is the first/last tabbable element, with a tab index of zero, in document order within a given root element
- `positiveTabbable` is a tabbable element with a positive tab index that could be anywhere in the trap

Whether to consider _top_ rather than _bottom_ or _first_ rather than _last_ depends on `event.shiftKey`, where `event` is the keyboard event fired by the <kbd>Tab</kbd> key press.

Note that in most cases the focus handling can and will be left up to the browser.  
The library intervenes only if `event.target`:

- Does not belong to the trap
- Is a particular element at the edges of its `root`
- Has a positive tab index.

Given that it is the case to intervene, the right destination for the focus is found based on the `tabIndex` of `event.target` like so:

- If `tabIndex < 0`, the destination is the `topOrBottomTabbable` following `event.target`
- if `tabIndex === 0`, the destination is the `firstOrLastTabbable` following `event.target` or, after reaching the `firstOrLastZeroTabbable` of the whole trap, the `positiveTabbable` with the lowest/greatest tab index (resolving ties by document order)
- if `tabIndex > 0`, the destination is the next `positiveTabbable` in value (resolving ties by document order) or, after reaching the first/last `positiveTabbable`, the `firstOrLastZeroTabbable` of the whole trap
