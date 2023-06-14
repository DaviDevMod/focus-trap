# @davidevmod/focus-trap

## 4.0.1

### Patch Changes

- [`173b47b`](https://github.com/DaviDevMod/focus-trap/commit/173b47b885c68075a6726f410f2b8ad4fdda4caa) Thanks [@DaviDevMod](https://github.com/DaviDevMod)! - Fix name UMD module in package.json

- [`3f01c26`](https://github.com/DaviDevMod/focus-trap/commit/3f01c2626d169a4d96191aa25012a07c12645370) Thanks [@DaviDevMod](https://github.com/DaviDevMod)! - Switch `isBuilt` to `true` only after getting `initialFocus`

  If `getInitialFocus` fails, no trap is built.

## 4.0.0

### Major Changes

- [`c1c9aa3`](https://github.com/DaviDevMod/focus-trap/commit/c1c9aa381a9edecc4570a45e4e242d191e047473) Thanks [@DaviDevMod](https://github.com/DaviDevMod)! - Move "true-myth" from "devDependencies" to "dependencies" and remove it from the bundle

## 3.0.1

### Patch Changes

- [`4f90a03`](https://github.com/DaviDevMod/focus-trap/commit/4f90a031a6b3058e48ebfd83439cbb7df1699ead) Thanks [@DaviDevMod](https://github.com/DaviDevMod)! - Fix handling of `Tab` from elements with a positive tab index.

- [`0cfe93f`](https://github.com/DaviDevMod/focus-trap/commit/0cfe93f3bd32b547aa7b8b373e81242c366d7b1f) Thanks [@DaviDevMod](https://github.com/DaviDevMod)! - Fix algorithm to find the next tabbable element with a positive tab index.

  It was missing to check whether the element was actually focusable.

## 3.0.0

### Major Changes

- [`d6d2ecc`](https://github.com/DaviDevMod/focus-trap/commit/d6d2ecceb0c7d14b27c41b55fd785cf2bd93cd14) Thanks [@DaviDevMod](https://github.com/DaviDevMod)! - Remove possibility to preovide `lock` as a function.

- [`95eb8a4`](https://github.com/DaviDevMod/focus-trap/commit/95eb8a45b32f87594ffa1cceef29c0b851d295bf) Thanks [@DaviDevMod](https://github.com/DaviDevMod)! - Return just a shallow copy of the `NormalisedTrapConfig`.

## 2.0.0

### Major Changes

- [`bcb45df`](https://github.com/DaviDevMod/focus-trap/commit/bcb45dff1d507b67f7c4cd6dd8b3f44ebf311370) Thanks [@DaviDevMod](https://github.com/DaviDevMod)! - Remove exceptions.ts and throw errors even in production.

- [`f70f79b`](https://github.com/DaviDevMod/focus-trap/commit/f70f79b9a14d7ea29759dd53b00eb15f06c38170) Thanks [@DaviDevMod](https://github.com/DaviDevMod)! - Add `isBuilt` to the return value.

### Patch Changes

- [`3eae44c`](https://github.com/DaviDevMod/focus-trap/commit/3eae44c906efa648864415619a2d9e2e4487804c) Thanks [@DaviDevMod](https://github.com/DaviDevMod)! - Improve type of `locK`.

  From a broad `boolean | Function` type to a stricter `boolean | ((event: KeyboardEvent) => void)`.

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
