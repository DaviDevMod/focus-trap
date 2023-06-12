---
'@davidevmod/focus-trap': patch
---

Switch `isBuilt` to `true` only after getting `initialFocus`

If `getInitialFocus` fails, no trap is built.
