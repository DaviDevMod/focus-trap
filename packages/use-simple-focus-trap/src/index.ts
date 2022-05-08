import { useEffect, useRef } from 'react';
import { TrapsControllerArgs, SingleTrapConfig, TrapConfig } from './types';
import { noConfig, resolveConfig, deepCompareConfings } from './utils';
import useSingleTrap from './use-single-trap/useSingleTrap';

function useSimpleFocusTrap(config: TrapConfig) {
  const trapsStack = useRef<SingleTrapConfig[]>([]).current;
  const getPrevTrap = () => (trapsStack?.pop() && trapsStack.length ? trapsStack[trapsStack.length - 1] : noConfig);
  const singleTrapController = useSingleTrap(noConfig, getPrevTrap);

  const trapsController = ({ action, config }: TrapsControllerArgs) => {
    switch (action) {
      case 'BUILD':
        const resolvedConfig = resolveConfig(config);
        if (!resolvedConfig) return;
        if (trapsStack.length && deepCompareConfings(trapsStack[trapsStack.length - 1], resolvedConfig)) return;
        trapsStack.push(resolvedConfig);
        return singleTrapController({ action, config: resolvedConfig });
      case 'DEMOLISH':
        if (process.env.NODE_ENV === 'development') {
          if (!trapsStack.length) {
            throw new Error('Cannot demolish inexistent trap.');
          }
        }
        return singleTrapController({ action, config: getPrevTrap() });
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
