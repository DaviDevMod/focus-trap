# use-simple-focus-trap

## 0.0.2

### Patch Changes

- [`583cb2a`](https://github.com/DaviDevMod/use-simple-focus-trap/commit/583cb2aea8e24308d7efc53cc26ae3f4bdfb823c) Thanks [@DaviDevMod](https://github.com/DaviDevMod)! - Fix shallow comparison of `escape` properties by setting the default `true` before the falsy `undefined` and `false` are compared.

* [`e03d726`](https://github.com/DaviDevMod/use-simple-focus-trap/commit/e03d7262e8704f9acebb7d70fbc77838eb6a582c) Thanks [@DaviDevMod](https://github.com/DaviDevMod)! - Chores on docs

- [`e90eb56`](https://github.com/DaviDevMod/use-simple-focus-trap/commit/e90eb561031f31543babe4cda8616f4d4c5592b4) Thanks [@DaviDevMod](https://github.com/DaviDevMod)! - Refixed `assistTabbing`

  A previous fix didn't finish the job.
  Also added a comment explaining the logic behind the function.

* [`a08ea02`](https://github.com/DaviDevMod/use-simple-focus-trap/commit/a08ea02e5e254279b3abb3a985a63ee14a055285) Thanks [@DaviDevMod](https://github.com/DaviDevMod)! - Fix bug in `isAssistedTabbingRewuired`

  The _either pre-order depth-first traversal or an arbitrary but consistent ordering_ of `Node.compareDocumentPosition()` doesn't take into account tab indexes when comparing, so `firstTabbable` and `lastTabbable` can't be used as reference points with it (unless the tab indexes are all zero or all positive).
  The fix consisted in introducing a `topTabbable` and a `bottomTabbable`.

## 0.0.2

### Patch Changes

- [`cf213df`](https://github.com/DaviDevMod/use-simple-focus-trap/commit/cf213df0940263214b5383c1f6e77669221b5c0c) Thanks [@DaviDevMod](https://github.com/DaviDevMod)! - Chores in README

* [`1ce451e`](https://github.com/DaviDevMod/use-simple-focus-trap/commit/1ce451eef2704bb16e64e1b255d74f2ac7d916b0) Thanks [@DaviDevMod](https://github.com/DaviDevMod)! - Add error for attempting to build a trap with a missing or invalid configuration

- [`d5d03f2`](https://github.com/DaviDevMod/use-simple-focus-trap/commit/d5d03f230f489cb66e9d0eeaca58a22789c5f048) Thanks [@DaviDevMod](https://github.com/DaviDevMod)! - Chores on documentation

## 0.0.2

### Patch Changes

- [`c44624d`](https://github.com/DaviDevMod/use-simple-focus-trap/commit/c44624dd128f8e1364ab2ecabf3ed5444c354129) Thanks [@DaviDevMod](https://github.com/DaviDevMod)! - Testing CI for releasing packages

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
