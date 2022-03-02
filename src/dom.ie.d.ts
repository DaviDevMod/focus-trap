// Extend `Element` interface to add support for the .matches() method in IE.
// see: https://caniuse.com/matchesselector
interface Element {
  msMatchesSelector(selectors: string): boolean;
}
