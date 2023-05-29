---
'@davidevmod/focus-trap': patch
---

Improve type of `locK`.

From a broad `boolean | Function` type to a stricter `boolean | ((event: KeyboardEvent) => void)`.
