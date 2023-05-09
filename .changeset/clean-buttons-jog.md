---
'@davidevmod/focus-trap': patch
---

Remove possibility to provide `escape` as a function.

It is unnecessary, as the user of the library can easily listen for `Esc` key presses by themselves.

As a side note, the implementation of the previous behaviour was buggy.
