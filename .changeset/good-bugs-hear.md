---
'@davidevmod/focus-trap': patch
---

Fix algorithm to find a destination for the focus.

When (during in the context of a <kbd>Tab</kbd> key press happening) `event.target` has a tab index of zero, the library should switch from looking for the next zero tabbable to look for a positive tabbable whenever `event.target` **is** or **precedes/follows** the **first/last zero tabbable in the whole focus trap**.

Before the fix, the switch in search would have happened only if `event.target` **was contained in** or **preceded/followed** the **first/last root in the focus-trap**.
