// The TreeWalker API (https://developer.mozilla.org/en-US/docs/Web/API/TreeWalker)
// looks like an overkill for the current usecase.
export const getHTMLElementFlatSubTree = (
  root: HTMLElement | undefined,
  filter = (el: HTMLElement): boolean => true
) => {
  const flatSubTree: HTMLElement[] = [];

  const recursivelyPushInSubTree = (el: HTMLElement) => {
    flatSubTree.push(el);
    Array.from(el.children).forEach(
      (child) => child instanceof HTMLElement && filter(child) && recursivelyPushInSubTree(child)
    );
  };

  if (root) recursivelyPushInSubTree(root);

  return flatSubTree;
};

export const strToBoolOrItself = (str: string) => (/^(true|false)$/.test(str) ? str === 'true' : str);
