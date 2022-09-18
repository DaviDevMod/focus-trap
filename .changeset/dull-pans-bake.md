---
'single-focus-trap': patch
---

Fix bug in `assistTabbing()` function, in single-focus-trap/src/index.ts

When tabbing away from an element with negative tab index contained in a focus trap, there are three possible scenarios, with their own logic:

- element precedes `topTabbable` of its root
- element succeeds `bottomTabbable` of its root
- element is within the `edges` of its root (in this case the tabbing is left up to the browser)

Before the fix, single-focus-trap acted as if the trapped negative tab index was always succeding `bottomTabbable`.
