---
'use-simple-focus-trap': patch
---

Renamed types and removed some logic in **use-simple-focus-trap**.

Now the hook can't be called directly with a config.
A config can only be served to the hook's return value.
