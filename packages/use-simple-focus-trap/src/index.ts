import { useCallback, useEffect, useRef } from 'react';
import { SingleTrap } from '@single-focus-trap';

import { TrapConfig, TrapsControllerParam, TrapParam, ResolvedConfig } from './types';
import { resolveConfig, areConfigsEquivalent, normalizeParam } from './utils';

function useSimpleFocusTrap(config?: TrapParam) {
  const trapsStack = useRef<ResolvedConfig[]>([]).current;
  const getPrevTrap = () => (trapsStack.pop() && trapsStack.length ? trapsStack[trapsStack.length - 1] : null);
  const singleTrapController = useRef(new SingleTrap().controller).current;

  const trapsController = useCallback((param: TrapsControllerParam): void => {
    if (process.env.NODE_ENV === 'development') {
      if (!param) throw new Error('Missing parameter for focus traps controller.');
    }
    if (!param) return;

    const { action, config } = normalizeParam(param);

    if (action === 'BUILD') {
      const resolvedConfig = resolveConfig(config);
      // In development an error is thrown inside of `resolveConfig()`
      if (!resolvedConfig) return;
      if (trapsStack.length && areConfigsEquivalent(trapsStack[trapsStack.length - 1], resolvedConfig)) return;
      trapsStack.push(resolvedConfig);
      return singleTrapController({ action, config: resolvedConfig });
    }
    if (action === 'DEMOLISH') {
      if (process.env.NODE_ENV === 'development') {
        if (!trapsStack.length) {
          throw new Error('Cannot demolish inexistent trap.');
        }
      }
      if (trapsStack.length) return;
      const prevTrap = getPrevTrap();
      if (prevTrap) return singleTrapController({ action: 'BUILD', config: prevTrap });
      return singleTrapController({ action });
    }
    return singleTrapController({ action });
  }, []);

  useEffect(() => {
    if (config) trapsController({ action: 'BUILD', config });
    else if (process.env.NODE_ENV === 'development') {
      // One may intend to call the hook just to get the returned controller, and only later build a trap.
      console.warn(
        'useSimpleFocusTrap was given a nullish parameter. If this was intended, you can ignore this message.'
      );
    }
  }, []);

  return trapsController;
}

export { useSimpleFocusTrap, TrapsControllerParam, TrapConfig };
