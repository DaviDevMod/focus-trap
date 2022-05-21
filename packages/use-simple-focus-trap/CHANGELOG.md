# use-simple-focus-trap

## 0.0.4

### Patch Changes

- [`1885a70`](https://github.com/DaviDevMod/focus-trap/commit/1885a70ff14e943f678067ae1b46855e7ce742bc) Thanks [@DaviDevMod](https://github.com/DaviDevMod)! - Moved logic for a single-focus-trap in own separate package

- Updated dependencies [[`1885a70`](https://github.com/DaviDevMod/focus-trap/commit/1885a70ff14e943f678067ae1b46855e7ce742bc)]:
  - single-focus-trap@0.0.0

## 0.0.3

### Patch Changes

- [`7466edd`](https://github.com/DaviDevMod/focus-trap/commit/7466edd70d081bc5105b93ad764ef27bd8eb237f) Thanks [@DaviDevMod](https://github.com/DaviDevMod)! - Change repo links

## 1.0.0

### Major Changes

- [`cbf24a6`](https://github.com/DaviDevMod/use-simple-focus-trap/commit/cbf24a669aedf6dac372b7279224ae0b90b35b80) Thanks [@DaviDevMod](https://github.com/DaviDevMod)! - Set the `root` as a required property

### Patch Changes

- [`0110b9e`](https://github.com/DaviDevMod/use-simple-focus-trap/commit/0110b9e801596cc2a35d8b11176d7445952b893a) Thanks [@DaviDevMod](https://github.com/DaviDevMod)! - Remove redundant error in index.ts

* [`c6e1a06`](https://github.com/DaviDevMod/use-simple-focus-trap/commit/c6e1a06916bca6771cb7414d461269c18a17c395) Thanks [@DaviDevMod](https://github.com/DaviDevMod)! - Fix logic of `resolveConfig` and `areConfigsEquivalent` (former `deepCompareConfings`)

- [`586eca8`](https://github.com/DaviDevMod/use-simple-focus-trap/commit/586eca86b255611f5b4ad2375d1f73f1d7567e3e) Thanks [@DaviDevMod](https://github.com/DaviDevMod)! - Fix resolution of `escape`

* [`ff5b5bb`](https://github.com/DaviDevMod/use-simple-focus-trap/commit/ff5b5bbae6fd898a709d4468c164c95306510cae) Thanks [@DaviDevMod](https://github.com/DaviDevMod)! - Fill README with emoji

- [`1c196a9`](https://github.com/DaviDevMod/use-simple-focus-trap/commit/1c196a97db0edfe129d58d90a64aaf6765554a5e) Thanks [@DaviDevMod](https://github.com/DaviDevMod)! - Modify repository for use-simple-focus-trap

* [`246a673`](https://github.com/DaviDevMod/use-simple-focus-trap/commit/246a6739c85dcd82db4e2fcbe93161246dd73eb8) Thanks [@DaviDevMod](https://github.com/DaviDevMod)! - Chores on docs

- [`f5305f5`](https://github.com/DaviDevMod/use-simple-focus-trap/commit/f5305f526fe0d8bd45ce0a54333da672fe5cd260) Thanks [@DaviDevMod](https://github.com/DaviDevMod)! - Chores in comments

## 0.0.2

### Patch Changes

- [`c6d1e58`](https://github.com/DaviDevMod/use-simple-focus-trap/commit/c6d1e58c7d16a068ab288f98144823812431b99c) Thanks [@DaviDevMod](https://github.com/DaviDevMod)! - Fix exported types

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
