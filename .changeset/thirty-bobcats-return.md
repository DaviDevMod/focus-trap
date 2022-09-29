---
'use-simple-focus-trap': patch
---

Fix bug in "use-simple-focus-trap/src/utils.ts"

The logic for the comparison of `lock` and `escape` properties, in areConfigsEquivalent was broken, again.
Will eventually write a unit test for this, but in the meantime couldn't leave it knowingly broken.
