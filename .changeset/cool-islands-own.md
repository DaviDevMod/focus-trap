---
'@davidevmod/focus-trap': patch
---

Fix logic to "normalise" `returnFocus` in normalise.ts

The default `document.activeElement` was not given in case `returnFocus` was `undefined` or a string not corresponding to any ID in the DOM.
It was given only when `returnFocus === true`.
