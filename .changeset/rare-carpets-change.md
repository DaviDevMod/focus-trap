---
'@davidevmod/focus-trap': patch
---

Fix `demolish` logic in trap-actions.ts

`state.isBuilt` was set to `false` before calling `pause` and the focus trap was therefore left up and running (while an error would be thrown, saying _"Cannot pause inexistent trap"_ ).
