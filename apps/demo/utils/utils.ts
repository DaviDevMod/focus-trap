// I just discovered the TreeWalker API: https://developer.mozilla.org/en-US/docs/Web/API/TreeWalker
// But it looks like an overkill. I'll stick with the simple recursion below and keep this comment
// just in case the use case becomes complex enough to justify a TreWalker implementation.
export const getHTMLElementFlatSubTree = (
  root: HTMLElement | undefined,
  filter = (el: HTMLElement): boolean => true
) => {
  const flatSubTree: HTMLElement[] = [];

  const recursivePushInSubTree = (el: HTMLElement) => {
    flatSubTree.push(el);
    Array.from(el.children).forEach(
      (child) => child instanceof HTMLElement && filter(child) && recursivePushInSubTree(child)
    );
  };

  if (root) recursivePushInSubTree(root);

  return flatSubTree;
};

export const strToBoolOrItself = (str: string) => (/^(true|false)$/.test(str) ? str === 'true' : str);
