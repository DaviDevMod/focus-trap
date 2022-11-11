# single-focus-trap

## 0.0.1

### Patch Changes

- [`ccd397e`](https://github.com/DaviDevMod/focus-trap/commit/ccd397e28610cceaaf0c787fdcc354cf31e1a1a3) Thanks [@DaviDevMod](https://github.com/DaviDevMod)! - Fix bug in `assistTabbing()` function, in single-focus-trap/src/index.ts

  When tabbing away from an element with negative tab index contained in a focus trap, there are three possible scenarios, with their own logic:

  - element precedes `topTabbable` of its root
  - element succeeds `bottomTabbable` of its root
  - element is within the `edges` of its root (in this case the tabbing is left up to the browser)

  Before the fix, single-focus-trap acted as if the trapped negative tab index was always succeding `bottomTabbable`.

- [`20b07d4`](https://github.com/DaviDevMod/focus-trap/commit/20b07d455724970757a66bd2e32b30dcff45013d) Thanks [@DaviDevMod](https://github.com/DaviDevMod)! - Renamed types and default export of `single-focus-trap`

- [`19afa7e`](https://github.com/DaviDevMod/focus-trap/commit/19afa7e4c84782a041715f0f79adb9f15f85fee3) Thanks [@DaviDevMod](https://github.com/DaviDevMod)! - Renamed `root` to `roots` in the config of both **single-focus-trap** and **use-simple-focus-trap**.

- [`51fb6c8`](https://github.com/DaviDevMod/focus-trap/commit/51fb6c8eb742c9349ad4d6468acaf2a611e29671) Thanks [@DaviDevMod](https://github.com/DaviDevMod)! - Modified the `TrapConfig` interface.

  Before, **songle-focus-trap** could have received the `roots` as either an `HTMLElement` or an array of `HTMLElement`s. Now it has to be an array.

## 0.0.0

### Patch Changes

- [`1885a70`](https://github.com/DaviDevMod/focus-trap/commit/1885a70ff14e943f678067ae1b46855e7ce742bc) Thanks [@DaviDevMod](https://github.com/DaviDevMod)! - Moved logic for a single-focus-trap in own separate package
