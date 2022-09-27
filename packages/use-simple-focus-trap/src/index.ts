import { useCallback, useRef } from 'react';
import { singleFocusTrap, Focusable } from 'single-focus-trap';

import { TrapConfig, ResolvedConfig, TrapArg, TrapRoot } from './types';
import { resolveConfig, areConfigsEquivalent, normalizeTrapArg } from './utils';

function useSimpleFocusTrap() {
  const trapsStack = useRef<ResolvedConfig[]>([]).current;

  const trapsController = useCallback((arg: TrapArg): void => {
    if (process.env.NODE_ENV !== 'production') {
      if (arg == null) throw new Error('Missing argument.');
    }
    if (arg == null) return;

    const normalizedParam = normalizeTrapArg(arg);

    if (process.env.NODE_ENV !== 'production') {
      if (!normalizedParam) {
        throw new Error('Invalid argument.');
      }
    }
    if (!normalizedParam) return;

    const { action, config } = normalizedParam;

    if (action === 'PUSH' || action === 'BUILD') {
      const resolvedConfig = resolveConfig(config);

      if (process.env.NODE_ENV !== 'production') {
        if (!resolvedConfig) throw new Error('No valid root found.');
      }
      if (!resolvedConfig) return;

      if (trapsStack.length && areConfigsEquivalent(trapsStack[trapsStack.length - 1], resolvedConfig)) return;

      if (action === 'PUSH') trapsStack.push(resolvedConfig);
      else trapsStack[trapsStack.length - 1] = resolvedConfig;

      return singleFocusTrap({ action: 'BUILD', config: resolvedConfig });
    }
    if (action === 'DEMOLISH') {
      // Skip the step of demolishing a trap before resuming (actually rebuilding) the previous one,
      // thus need to take care of the `returnFocus`. This is just faster and recycles the previous MutationObserver.
      const resumeFocus = trapsStack.pop()?.returnFocus;
      const trapToResume = trapsStack[trapsStack.length - 1];
      if (trapToResume) {
        return singleFocusTrap({
          action: 'BUILD',
          config: { ...trapToResume, initialFocus: resumeFocus ?? trapToResume.initialFocus },
        });
      }
      // Actually demolishing the trap only if it was at the bottomo of the stack.
      return singleFocusTrap({ action });
    }
    singleFocusTrap({ action });
  }, []);

  return trapsController;
}

export { useSimpleFocusTrap };
export type { Focusable, TrapRoot, TrapConfig, TrapArg };
