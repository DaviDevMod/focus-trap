---
'use-simple-focus-trap': patch
---

Fix bug in `isAssistedTabbingRewuired`

The _either pre-order depth-first traversal or an arbitrary but consistent ordering_ of `Node.compareDocumentPosition()` doesn't take into account tab indexes when comparing, so `firstTabbable` and `lastTabbable` can't be used as reference points with it (unless the tab indexes are all zero or all positive).
The fix consisted in introducing a `topTabbable` and a `bottomTabbable`.
