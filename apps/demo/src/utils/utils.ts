// The TreeWalker API (https://developer.mozilla.org/en-US/docs/Web/API/TreeWalker)
// looks like an overkill for the current use case.
export function getHTMLElementFlatSubTree(root: HTMLElement, filter = (_el: HTMLElement): boolean => true) {
  const flatSubTree: HTMLElement[] = [];

  (function recursivelyPushInSubTree(el: HTMLElement) {
    flatSubTree.push(el);
    Array.from(el.children).forEach(
      (child) => child instanceof HTMLElement && filter(child) && recursivelyPushInSubTree(child)
    );
  })(root);

  return flatSubTree;
}

export const strToBoolOrItself = (str: string) => (/^(true|false)$/.test(str) ? str === 'true' : str);
