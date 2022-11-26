---
'single-focus-trap': patch
---

Bug Fix in `assistTabbing()` of "index.ts".

The logic to get a `surrogateIndex` for `target`s outside of the trap was picking up "the index of the first root that precedes target + 1" which is not necessarily the "Index of first root that follows target".

It would be so if the search was performed from the last root in document order towards the first one. The approach of "the index of the first root that precedes target + 1" would have been useful to automatically overwrite `-1` with a `0` (if implemented correctly) like so:
`const surrogateIndex = (roots.findLastIndex((el) => target.compareDocumentPosition(el) & 3) + 1) % roots.length;`
However reassigning to a `0` would not work in case `target.tabIndex === 0` because at a `Tab` key press the focus would have gone to the first zero tab index in the trap, which is not necessarily the first tabbable in the trap. To make the focus go to the first tabbable, `surrogateIndex` should be reassigned to `roots.length` (as if a new root, with `target` in it, was pushed in `roots`).

**So `surrogateIndex` is being found simply as the "Index of first root that follows target" and in case it's `-1`, this is reassinged to `roots.length`.**

As a side note, reassigning to `0` was working for `target.tabIndex < 0` because the logic here would have been to pass the focus to the first tabbable of the first root, which would have been also the first tabbable in the trap; and of course it was working also for `target.tabIndex > 0` because this case doesn't depend on `surrogateIndex`.
One could even tweak the `getDestination()` call for `target.tabIndex === 0` to make the `0` overwrite work even there, but the logic chosen in this fix is simpler.
