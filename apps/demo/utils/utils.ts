// I just discovered the TreeWalker API: https://developer.mozilla.org/en-US/docs/Web/API/TreeWalker
// But it looks like an overkill. I'll stick with the simple recursion below and keep this comment
// just in case the use case becomes complex enough to justify a TreWalker implementation.
export const getHTMLElementFlatSubTree = (
  root: HTMLElement | undefined,
  filter = (el: HTMLElement): boolean => true
) => {
  const array: HTMLElement[] = [];

  const pushElementSubTree = (el: HTMLElement) => {
    array.push(el);
    Array.from(el.children).forEach(
      (child) => child instanceof HTMLElement && filter(child) && pushElementSubTree(child)
    );
  };

  if (root) pushElementSubTree(root);

  return array;
};

export const strToBoolOrItself = (str: string) => (/^(true|false)$/.test(str) ? str === 'true' : str);
