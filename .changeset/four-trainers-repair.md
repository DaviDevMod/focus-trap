---
'use-simple-focus-trap': patch
---

Fix bug in `updateTrap`.

When bringing the focus inside the trap, if `initialFocus` was `null`, falling back to `firstTabbable` could have been prevented.
