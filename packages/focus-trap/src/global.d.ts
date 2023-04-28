export {};

declare global {
  // See discussion: https://github.com/microsoft/TypeScript/issues/4689#issuecomment-690503791
  interface Document {
    getElementById<T extends HTMLElement | SVGElement = HTMLElement>(elementId: string): T | null;
  }

  // Support for `Array.prototype.findLast` ships with v5.0: https://github.com/microsoft/TypeScript/issues/48829
  interface Array<T> {
    findLast(predicate: (element: T, index: number, array: T[]) => unknown, thisArg?: any): T | undefined;
  }
}
