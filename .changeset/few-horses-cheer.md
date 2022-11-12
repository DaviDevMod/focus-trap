---
'single-focus-trap': patch
---

Bug Fix.
Only elements contained by the `roots` were taken in consideration when building a trap.
Now the `roots` elements themself can be part of the trap.
