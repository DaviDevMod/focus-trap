import { useEffect, useRef } from 'react';
import { TrapsControllerArgs, SingleTrapConfig, TrapConfig } from './types';
import { noConfig, resolveConfig, deepCompareConfings } from './utils';
import useSingleTrap from './use-single-trap/useSingleTrap';

function useSimpleFocusTrap(config: TrapConfig) {
  const trapStack = useRef<SingleTrapConfig[]>([]).current;
  const popTrapStack = () => (trapStack.length ? trapStack.pop()! : noConfig);
  const singleTrapController = useSingleTrap(noConfig, popTrapStack);

  const trapsController = ({ action, config }: TrapsControllerArgs) => {
    switch (action) {
      case 'BUILD':
        const resolvedConfig = resolveConfig(config);
        if (!resolvedConfig) return;
        if (trapStack.length && deepCompareConfings(trapStack[trapStack.length - 1], resolvedConfig)) return;
        trapStack.push(resolvedConfig);
        return singleTrapController({ action, config: resolvedConfig });
      case 'DEMOLISH':
        if (process.env.NODE_ENV === 'development') {
          if (!trapStack.length) {
            throw new Error('Cannot demolish inexistent trap.');
          }
        }
        return singleTrapController({ action, config: popTrapStack() });
      default:
        return singleTrapController({ action });
    }
  };

  useEffect(() => {
    trapsController({ action: 'BUILD', config });
  }, []);

  // TODO: Think about whether it's the case to memoize `trapsController`.
  return trapsController;
}

export default useSimpleFocusTrap;
