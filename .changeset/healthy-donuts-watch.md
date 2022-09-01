---
'use-simple-focus-trap': patch
---

Fix bug in use-simple-focus-trap/src/utils.ts

The whole logic for the comparison of `lock` and `escape` properties, in `areConfigsEquivalent`, was broken.
