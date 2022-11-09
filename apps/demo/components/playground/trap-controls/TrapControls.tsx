import { useEffect, useMemo, useReducer, useState } from 'react';
import { RequireExactlyOne } from 'type-fest';
import { useSimpleFocusTrap } from 'use-simple-focus-trap';

import { ControlsKeysState } from '../Playground';
import { getHTMLElementFlatSubTree, strToBoolOrItself } from '../../../utils/utils';
import { TrapActionMenu } from './trap-action-menu/TrapActionMenu';
import { TrapConfigListbox } from './trap-config-listbox/TrapConfigListbox';
import { Switch } from '../../UI/switch/Switch';
import { SubmitButton } from '../../UI/submit-button/SubmitButton';
import { ResetButton } from '../../UI/reset-button/ResetButton';

interface TrapControlsProps {
  trapElementsRootNodeState: HTMLDivElement | undefined;
  setControlsKeysState: React.Dispatch<React.SetStateAction<ControlsKeysState>>;
  displayComponent?: boolean;
}

// Defined as a value rather than just a type so that we can loop through it to render the actions.
export enum TrapActions {
  BUILD = 'BUILD',
  DEMOLISH = 'DEMOLISH',
  RESUME = 'RESUME',
  PAUSE = 'PAUSE',
}

// Basically `TrapConfig` from `use-simple-focus-trap` but without elements nor optional properties.
// Also the boolean values of `initialFocus` and `returnFocus` are being stored as strings and
// converted to actual booleans only once, right before to feed the config to `useSimpleFocusTrap`.
export interface DemoTrapConfig {
  roots: string[];
  initialFocus: string;
  returnFocus: string;
  lock: boolean;
  escape: boolean;
}

interface TrapControlsState {
  trapAction?: keyof typeof TrapActions;
  trapConfig: DemoTrapConfig;
}

// A dispatchable action is an object with either a `trapAction` or one of the properties in `DemoTrapConfig`.
// `TrapControlsStateReducerAction` is actually the union of object literals having a bunch of properties,
// all but one set to an optional `never`: we then rely on the compiler option "exactOptionalPropertyTypes"
// to ensure that the action can have only one property (and no additional properties set to `undefined`).
export type TrapControlsStateReducerAction = RequireExactlyOne<
  { trapAction: keyof typeof TrapActions } & DemoTrapConfig
>;

const initialControlsState: TrapControlsState = {
  trapConfig: { roots: [], initialFocus: 'true', returnFocus: 'true', lock: true, escape: true },
};

const trapControlsStateReducer = (
  state: TrapControlsState,
  action: TrapControlsStateReducerAction
): TrapControlsState => {
  // For the moment not resetting `state.trapConfig` when navigating between actions, as it may be frustrating for the user.
  // TODO: Maybe keep this logic and add a reset button?
  if (action.trapAction) return { ...state, ...action };

  return { ...state, trapConfig: { ...state.trapConfig, ...action } };
};

export function TrapControls({ trapElementsRootNodeState, setControlsKeysState, displayComponent }: TrapControlsProps) {
  const [trapElementsState, setTrapElementsState] = useState<HTMLElement[]>([]);
  const [trapControlsState, dispatchTrapControlsState] = useReducer(trapControlsStateReducer, initialControlsState);
  const [initialFocusFilterState, setInitialFocusFilterState] = useState(false);
  const controller = useSimpleFocusTrap();
  const { trapAction, trapConfig } = trapControlsState;

  useEffect(() => {
    // Filtering out nodes without an `id`, so it's trivial to add elements in `TrapElements.tsx` (just to improve the UX)
    // without having them (and their whole branch) appear as options for <TrapConfigListbox> renedered in this component.
    setTrapElementsState(getHTMLElementFlatSubTree(trapElementsRootNodeState, (el) => !!el.id));
  }, [trapElementsRootNodeState]);

  const rootsAndInitialFocusConfigValues = useMemo(
    () => ({ roots: trapConfig.roots, initialFocus: trapConfig.initialFocus }),
    [trapConfig.roots, trapConfig.initialFocus]
  );

  const returnFocusConfigValues = useMemo(() => ({ returnFocus: trapConfig.returnFocus }), [trapConfig.returnFocus]);

  const handleLockChange = () => dispatchTrapControlsState({ lock: !trapConfig.lock });

  const handleEscapeChange = () => dispatchTrapControlsState({ escape: !trapConfig.escape });

  const isTrapActionNotBUILD = trapAction !== 'BUILD';

  const handleReset = () => setControlsKeysState((prevState) => ({ ...prevState, trap: prevState.trap + 1 }));

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (trapAction === 'BUILD') {
      controller({
        action: trapAction,
        config: {
          ...trapConfig,
          initialFocus: strToBoolOrItself(trapConfig.initialFocus),
          returnFocus: strToBoolOrItself(trapConfig.returnFocus),
        },
      });
    } else if (trapAction) controller(trapAction);
  };

  return (
    <form
      name="Trap Controls"
      onSubmit={handleSubmit}
      className={`${displayComponent ? 'block' : 'hidden'} flex flex-col justify-between gap-y-3`}
    >
      <TrapActionMenu dispatchTrapControlsState={dispatchTrapControlsState} />

      <TrapConfigListbox
        configProp="roots"
        configValues={rootsAndInitialFocusConfigValues}
        skeletonRootId={trapElementsRootNodeState?.id}
        filterState={initialFocusFilterState}
        setFilterState={setInitialFocusFilterState}
        trapElementsState={trapElementsState}
        dispatchTrapControlsState={dispatchTrapControlsState}
        disabled={isTrapActionNotBUILD}
      />

      <TrapConfigListbox
        configProp="initialFocus"
        configValues={rootsAndInitialFocusConfigValues}
        skeletonRootId={trapElementsRootNodeState?.id}
        filterState={initialFocusFilterState}
        setFilterState={setInitialFocusFilterState}
        trapElementsState={trapElementsState}
        dispatchTrapControlsState={dispatchTrapControlsState}
        disabled={isTrapActionNotBUILD}
      />

      <TrapConfigListbox
        configProp="returnFocus"
        configValues={returnFocusConfigValues}
        trapElementsState={trapElementsState}
        dispatchTrapControlsState={dispatchTrapControlsState}
        disabled={isTrapActionNotBUILD}
      />

      <Switch label="lock" checked={trapConfig.lock} handleChange={handleLockChange} disabled={isTrapActionNotBUILD} />

      <Switch
        label="escape"
        checked={trapConfig.escape}
        handleChange={handleEscapeChange}
        disabled={isTrapActionNotBUILD}
      />

      <ResetButton disabled={trapAction === undefined} handleClick={handleReset} />

      <SubmitButton disabled={trapAction === undefined} label={trapAction} />
    </form>
  );
}
