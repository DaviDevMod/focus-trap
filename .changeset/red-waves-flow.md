---
'@davidevmod/focus-trap': major
---

Add "tabbable" as dependency

Since v6.2.0, "tabbable" adds `getTabIndex()` to its API, reducing the friction to being adopted as a dependency.
https://github.com/focus-trap/tabbable/releases/tag/v6.2.0

Now the only code that has to be duplicated is the `candidateSelector` used to query elements that are likely to be tabbable.

Using "tabbable" marginally affects the performance of the library (in a bad way) and significantly increases (doubles up) the final bundle size.
However I believe that it's best to have it as a dependency; at least for the long term maintainability of the library, but also to give the right credits to the people who wrote the code "@davidevmod/focus-trap" is using.
