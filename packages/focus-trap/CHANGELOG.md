# @davidevmod/focus-trap

## 1.0.0

### Major Changes

- [`c4c8696`](https://github.com/DaviDevMod/focus-trap/commit/c4c8696048e275be74c4d95c2cc16f54a8da5b6a) Thanks [@DaviDevMod](https://github.com/DaviDevMod)! - Bump to v1.0

### Patch Changes

- [`2c17880`](https://github.com/DaviDevMod/focus-trap/commit/2c17880cdb4364afeec490a0f1ec39c49eaf54df) Thanks [@DaviDevMod](https://github.com/DaviDevMod)! - Remove possibility to provide `escape` as a function.

  It is unnecessary, as the user of the library can easily listen for `Esc` key presses by themselves.

  As a side note, the implementation of the previous behaviour was buggy.

- [`d95f7df`](https://github.com/DaviDevMod/focus-trap/commit/d95f7df5e2547a7b5ca4fe906e8c153f8e224c5f) Thanks [@DaviDevMod](https://github.com/DaviDevMod)! - Fix logic to "normalise" `returnFocus` in normalise.ts

  The default `document.activeElement` was not given in case `returnFocus` was `undefined` or a string not corresponding to any ID in the DOM.
  It was given only when `returnFocus === true`.

- [`fd6cf73`](https://github.com/DaviDevMod/focus-trap/commit/fd6cf73d6cad7b31f8bd73dfabde63473c061022) Thanks [@DaviDevMod](https://github.com/DaviDevMod)! - Fix algorithm to find a destination for the focus.

  When (during in the context of a <kbd>Tab</kbd> key press happening) `event.target` has a tab index of zero, the library should switch from looking for the next zero tabbable to look for a positive tabbable whenever `event.target` **is** or **precedes/follows** the **first/last zero tabbable in the whole focus trap**.

  Before the fix, the switch in search would have happened only if `event.target` **was contained in** or **preceded/followed** the **first/last root in the focus-trap**.

- [`2c5bd1c`](https://github.com/DaviDevMod/focus-trap/commit/2c5bd1c2ae4b7cf8a242f064d0da1555085c8b5a) Thanks [@DaviDevMod](https://github.com/DaviDevMod)! - Remove custom type annotation for `Array.prototype.findLast`.

  It is now buit-in since TypeScript v5.0 (https://github.com/microsoft/TypeScript/issues/48829#issuecomment-1442649966).

- [`0d154e8`](https://github.com/DaviDevMod/focus-trap/commit/0d154e84db7648a99ff395c739ca39f1a8e0343e) Thanks [@DaviDevMod](https://github.com/DaviDevMod)! - Fix `demolish` logic in trap-actions.ts

  `state.isBuilt` was set to `false` before calling `pause` and the focus trap was therefore left up and running (while an error would be thrown, saying _"Cannot pause inexistent trap"_ ).

- [`0d90cba`](https://github.com/DaviDevMod/focus-trap/commit/0d90cba8dcb7e3a7f73a8d1376950886ec7dfb35) Thanks [@DaviDevMod](https://github.com/DaviDevMod)! - Export types

- [`79b0e44`](https://github.com/DaviDevMod/focus-trap/commit/79b0e4421c2846396a8d3cd49c37407007751211) Thanks [@DaviDevMod](https://github.com/DaviDevMod)! - Fix inefficient code in destination.ts
