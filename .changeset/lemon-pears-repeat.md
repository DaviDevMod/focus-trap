---
'use-simple-focus-trap': patch
---

Fix bug in `useSimpleFocusTrap`.

`popTrapStack`, now called `getPrevTrap`, was returning the config of already demolished traps.
