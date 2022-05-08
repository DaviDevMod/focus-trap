---
'use-simple-focus-trap': patch
---

Fix shallow comparison of `escape` properties by setting the default `true` before the falsy `undefined` and `false` are compared.
