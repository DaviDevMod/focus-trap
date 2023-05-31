export {};

declare global {
  // See discussion: https://github.com/microsoft/TypeScript/issues/4689#issuecomment-690503791
  interface Document {
    getElementById<T extends Element>(elementId: string): T | null;
  }
}
