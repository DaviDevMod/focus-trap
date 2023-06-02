---
'@davidevmod/focus-trap': patch
---

Fix algorithm to find the next tabbable element with a positive tab index.

It was missing to check whether the element was actually focusable.
