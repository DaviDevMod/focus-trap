import { useCallback, useEffect, useRef } from 'react';
import { singleTrap, Focusable } from '@single-focus-trap';

import { TrapConfig, ResolvedConfig, TrapsControllerParam, TrapParam, TrapRoot } from './types';
import { resolveConfig, areConfigsEquivalent, normalizeParam } from './utils';

function useSimpleFocusTrap(config?: TrapParam) {
  const trapsStack = useRef<ResolvedConfig[]>([]).current;

  const trapsController = useCallback((param: TrapsControllerParam): void => {
    if (process.env.NODE_ENV === 'development') {
      if (!param) throw new Error('Missing parameter.');
    }
    if (!param) return;

    const normalizedParam = normalizeParam(param);

    if (process.env.NODE_ENV === 'development') {
      if (!normalizedParam) {
        throw new Error('Invalid parameter.');
      }
    }
    if (!normalizedParam) return;

    const { action, config } = normalizedParam;

    if (action === 'PUSH' || action === 'BUILD') {
      const resolvedConfig = resolveConfig(config);

      if (process.env.NODE_ENV === 'development') {
        if (!resolvedConfig) throw new Error('No valid root found.');
      }
      if (!resolvedConfig) return;

      if (trapsStack.length && areConfigsEquivalent(trapsStack[trapsStack.length - 1], resolvedConfig)) return;

      if (action === 'PUSH') trapsStack.push(resolvedConfig);
      else trapsStack[trapsStack.length - 1] = resolvedConfig;

      return singleTrap({ action: 'BUILD', config: resolvedConfig });
    }
    if (action === 'DEMOLISH') {
      // Skip the step of demolishing a trap before resuming (actually rebuilding) the previous one,
      // thus need to take care of the `returnFocus`. This is just faster and recycles the previous MutationObserver.
      const resumeFocus = trapsStack.pop()?.returnFocus;
      const trapToResume = trapsStack[trapsStack.length - 1];
      if (trapToResume) {
        return singleTrap({
          action: 'BUILD',
          config: { ...trapToResume, initialFocus: resumeFocus ?? trapToResume.initialFocus },
        });
      }
      // Actually demolishing the trap only if it was at the bottomo of the stack.
      return singleTrap({ action });
    }
    singleTrap({ action });
  }, []);

  useEffect(() => {
    if (config) trapsController({ action: 'PUSH', config });
    else if (process.env.NODE_ENV === 'development') {
      // One may intend to call the hook just to get the returned controller, and only later build a trap.
      console.warn(
        '`use-simple-focus-trap` was called without a parameter. If it was intended, you can ignore this message.'
      );
    }
  }, []);

  return trapsController;
}

export { useSimpleFocusTrap, Focusable, TrapRoot, TrapConfig, TrapParam, TrapsControllerParam };
