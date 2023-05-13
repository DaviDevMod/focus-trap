---
'demo': patch
---

Fix "change" handlers for `<Switch>` components in TrapControls.tsx

They were using a potentially out of date state.
In the process some typings have changed.
