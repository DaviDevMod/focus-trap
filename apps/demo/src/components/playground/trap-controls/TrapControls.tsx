import { useEffect, useMemo, useReducer, useState } from 'react';
import { RequireExactlyOne } from 'type-fest';
import { focusTrap } from '@davidevmod/focus-trap';

import { ControlsKeysState } from '../Playground';
import { getHTMLElementFlatSubTree, strToBoolOrItself } from '../../../utils/utils';
import { TrapActionMenu } from './trap-action-menu/TrapActionMenu';
import { TrapConfigListbox } from './trap-config-listbox/TrapConfigListbox';
import { Switch } from '../../UI/switch/Switch';
import { SubmitButton } from '../../UI/submit-button/SubmitButton';
import { ResetButton } from '../../UI/reset-button/ResetButton';

interface TrapControlsProps {
  demoElementsRootNodeState: HTMLDivElement | undefined;
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

export function TrapControls({ demoElementsRootNodeState, setControlsKeysState, displayComponent }: TrapControlsProps) {
  const [demoElementsState, setDemoElementsState] = useState<HTMLElement[]>([]);
  const [trapControlsState, dispatchTrapControlsState] = useReducer(trapControlsStateReducer, initialControlsState);
  const [initialFocusFilterState, setInitialFocusFilterState] = useState(false);
  const { trapAction, trapConfig } = trapControlsState;

  useEffect(() => {
    // Filtering out nodes without an `id`, so it's trivial to add elements in `DemoElements.tsx` (just to improve the UX)
    // without having them (and their whole branch) appear as options for <TrapConfigListbox> renedered in this component.
    setDemoElementsState(getHTMLElementFlatSubTree(demoElementsRootNodeState, (el) => !!el.id));
  }, [demoElementsRootNodeState]);

  const rootsAndInitialFocusConfigValues = useMemo(
    () => ({ roots: trapConfig.roots, initialFocus: trapConfig.initialFocus }),
    [trapConfig.roots, trapConfig.initialFocus]
  );

  const returnFocusConfigValues = useMemo(() => ({ returnFocus: trapConfig.returnFocus }), [trapConfig.returnFocus]);

  const TrapActionIsnotBuild = trapAction !== 'BUILD';
  const handleSwitchChange = (checked: boolean, label: keyof Pick<DemoTrapConfig, 'lock' | 'escape'>) => {
    dispatchTrapControlsState({ [label]: checked } as TrapControlsStateReducerAction);
  };

  const handleReset = () => setControlsKeysState((prevState) => ({ ...prevState, trap: prevState.trap + 1 }));

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (trapAction === 'BUILD') {
      focusTrap({
        ...trapConfig,
        initialFocus: strToBoolOrItself(trapConfig.initialFocus),
        returnFocus: strToBoolOrItself(trapConfig.returnFocus),
      });
    } else if (trapAction) focusTrap(trapAction);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`${displayComponent ? 'block' : 'hidden'} flex flex-col justify-between gap-y-3`}
      data-cy="Trap Controls"
    >
      <TrapActionMenu dispatchTrapControlsState={dispatchTrapControlsState} />

      <TrapConfigListbox
        configProp="roots"
        configValues={rootsAndInitialFocusConfigValues}
        skeletonRootId={demoElementsRootNodeState?.id}
        filterState={initialFocusFilterState}
        setFilterState={setInitialFocusFilterState}
        demoElementsState={demoElementsState}
        dispatchTrapControlsState={dispatchTrapControlsState}
        disabled={TrapActionIsnotBuild}
      />

      <TrapConfigListbox
        configProp="initialFocus"
        configValues={rootsAndInitialFocusConfigValues}
        skeletonRootId={demoElementsRootNodeState?.id}
        filterState={initialFocusFilterState}
        setFilterState={setInitialFocusFilterState}
        demoElementsState={demoElementsState}
        dispatchTrapControlsState={dispatchTrapControlsState}
        disabled={TrapActionIsnotBuild}
      />

      <TrapConfigListbox
        configProp="returnFocus"
        configValues={returnFocusConfigValues}
        demoElementsState={demoElementsState}
        dispatchTrapControlsState={dispatchTrapControlsState}
        disabled={TrapActionIsnotBuild}
      />

      <Switch
        label="lock"
        checked={trapConfig.lock}
        handleChange={handleswitchChange}
        disabled={TrapActionIsnotBuild}
      />

      <Switch
        label="escape"
        checked={trapConfig.escape}
        handleChange={handleSwitchChange}
        disabled={TrapActionIsnotBuild}
      />

      <ResetButton disabled={trapAction === undefined} handleClick={handleReset} />

      <SubmitButton disabled={trapAction === undefined} label={trapAction} />
    </form>
  );
}
