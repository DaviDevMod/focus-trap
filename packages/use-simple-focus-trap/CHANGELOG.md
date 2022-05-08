# use-simple-focus-trap

## 0.0.2

### Patch Changes

- [`a8d0e3f`](https://github.com/DaviDevMod/use-simple-focus-trap/commit/a8d0e3fca48e4abd988a1bf063f2b25944ef3d5c) Thanks [@DaviDevMod](https://github.com/DaviDevMod)! - Fix exported types

## 0.0.2

### Patch Changes

- [`a18b245`](https://github.com/DaviDevMod/use-simple-focus-trap/commit/a18b2453f74e4e775139ee7ed70ab3369b2f8a50) Thanks [@DaviDevMod](https://github.com/DaviDevMod)! - Fix exported types

## 0.0.2

### Patch Changes

- [`411030b`](https://github.com/DaviDevMod/use-simple-focus-trap/commit/411030b1a9c8d0bc36224d3ab693cb448559abab) Thanks [@DaviDevMod](https://github.com/DaviDevMod)! - Fix bug in `updateTrap`.

  When bringing the focus inside the trap, if `initialFocus` was `null`, falling back to `firstTabbable` could have been prevented.

* [`b9f0d8d`](https://github.com/DaviDevMod/use-simple-focus-trap/commit/b9f0d8d2815e3a94573d7442b399c6af3e3b7fe0) Thanks [@DaviDevMod](https://github.com/DaviDevMod)! - Fix bug in `useSimpleFocusTrap`.

  `popTrapStack`, now called `getPrevTrap`, was returning the config of already demolished traps.
