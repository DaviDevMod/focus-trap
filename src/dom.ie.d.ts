// Extend `Element` interface to add support for the .matches() method in IE.
// see: https://caniuse.com/?search=matches
interface Element {
  msMatchesSelector(selectors: string): boolean;
}
