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
