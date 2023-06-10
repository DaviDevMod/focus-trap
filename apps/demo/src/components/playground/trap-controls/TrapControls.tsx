import type { RequireExactlyOne } from 'type-fest';
import { Fragment, useMemo, useReducer, useState } from 'react';
import { focusTrap } from '@davidevmod/focus-trap';

import type { DemoTrapConfig, DemoTrapState } from '../Playground';
import { getHTMLElementFlatSubTree, strToBoolOrItself } from '../../../utils/utils';
import { TrapActionMenu } from './trap-action-menu/TrapActionMenu';
import { TrapConfigListbox } from './trap-config-listbox/TrapConfigListbox';
import { Switch } from '../../UI/switch/Switch';
import { SubmitButton } from '../../UI/submit-button/SubmitButton';
import { ResetButton } from '../../UI/reset-button/ResetButton';

interface TrapControlsProps {
  demoElementsRootState: HTMLDivElement | undefined;
  displayComponent: boolean;
  lastDemoTrapState: DemoTrapState;
  setLastDemoTrapState: React.Dispatch<React.SetStateAction<DemoTrapState>>;
  setRootsToHighlightState: React.Dispatch<React.SetStateAction<string[]>>;
}

export enum TrapActions {
  BUILD = 'BUILD',
  DEMOLISH = 'DEMOLISH',
  RESUME = 'RESUME',
  PAUSE = 'PAUSE',
}

interface TrapControlsState {
  trapAction: keyof typeof TrapActions;
  trapConfig: DemoTrapConfig;
}

// A dispatchable action is either
// - An object with only a `trapAction` property
// - An object with only one of the properties in `DemoTrapConfig`
// - A whole `DemoTrapConfig`
// Relying on the compiler option "exactOptionalPropertyTypes" to ensure that (when applicable)
// the action can have only one property (and no additional properties set to `undefined`).
export type TrapControlsReducerAction =
  | RequireExactlyOne<{ trapAction: keyof typeof TrapActions } & DemoTrapConfig>
  | ({ trapAction?: never } & DemoTrapConfig);

const trapControlsReducer = (state: TrapControlsState, action: TrapControlsReducerAction): TrapControlsState => {
  if (action.trapAction) return { ...state, ...action };

  return { ...state, trapConfig: { ...state.trapConfig, ...action } };
};

const initialTrapConfig: DemoTrapConfig = {
  roots: [],
  initialFocus: 'true',
  returnFocus: 'true',
  lock: true,
  escape: true,
};

const initialTrapControlsState: TrapControlsState = {
  trapAction: 'BUILD',
  trapConfig: initialTrapConfig,
};

export function TrapControls({
  demoElementsRootState,
  displayComponent,
  lastDemoTrapState,
  setLastDemoTrapState,
  setRootsToHighlightState,
}: TrapControlsProps) {
  const [demoElementsState, setDemoElementsState] = useState<HTMLElement[]>([]);
  const [{ trapAction, trapConfig }, dispatchTrapControlsState] = useReducer(
    trapControlsReducer,
    initialTrapControlsState
  );
  const [initialFocusFilterState, setInitialFocusFilterState] = useState(false);

  if (demoElementsRootState && demoElementsRootState !== demoElementsState[0]) {
    // Filtering out nodes without an `id`, so it's trivial to add elements in `DemoElements.tsx` (just to improve the UX)
    // without having them (and their whole subtree) appear as options for <TrapConfigListbox> renedered in this component.
    setDemoElementsState(getHTMLElementFlatSubTree(demoElementsRootState, (el) => !!el.id));
  }

  const rootsAndInitialFocusConfigValues = useMemo(
    () => ({ roots: trapConfig.roots, initialFocus: trapConfig.initialFocus }),
    [trapConfig.roots, trapConfig.initialFocus]
  );

  const returnFocusConfigValues = useMemo(() => ({ returnFocus: trapConfig.returnFocus }), [trapConfig.returnFocus]);

  const handleSwitchChange = (checked: boolean, label: keyof Pick<DemoTrapConfig, 'lock' | 'escape'>) => {
    dispatchTrapControlsState({ [label]: checked } as TrapControlsReducerAction);
  };

  const handleReset = () => dispatchTrapControlsState(initialTrapConfig);

  // TODO: Add error handling for the `focus-trap` calls.
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    if (!trapAction) return;

    event.preventDefault();

    if (trapAction === 'BUILD') {
      focusTrap({
        ...trapConfig,
        initialFocus: strToBoolOrItself(trapConfig.initialFocus),
        returnFocus: strToBoolOrItself(trapConfig.returnFocus),
      });

      setLastDemoTrapState({ isBuilt: true, trapConfig });

      setRootsToHighlightState(trapConfig.roots);

      return;
    }

    focusTrap(trapAction);

    if (trapAction === 'DEMOLISH') setLastDemoTrapState({ isBuilt: false, trapConfig: initialTrapConfig });

    setRootsToHighlightState(
      trapAction === 'RESUME' && lastDemoTrapState.isBuilt ? lastDemoTrapState.trapConfig.roots : []
    );
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`${displayComponent ? 'block' : 'hidden'} flex flex-col justify-between gap-y-3`}
    >
      <TrapActionMenu dispatchTrapControlsState={dispatchTrapControlsState} />
      {trapAction === 'BUILD' && (
        <Fragment>
          <TrapConfigListbox
            configProp="roots"
            configValues={rootsAndInitialFocusConfigValues}
            skeletonRootId={demoElementsRootState?.id}
            filterState={initialFocusFilterState}
            setFilterState={setInitialFocusFilterState}
            demoElementsState={demoElementsState}
            dispatchTrapControlsState={dispatchTrapControlsState}
          />

          <TrapConfigListbox
            configProp="initialFocus"
            configValues={rootsAndInitialFocusConfigValues}
            skeletonRootId={demoElementsRootState?.id}
            filterState={initialFocusFilterState}
            setFilterState={setInitialFocusFilterState}
            demoElementsState={demoElementsState}
            dispatchTrapControlsState={dispatchTrapControlsState}
          />

          <TrapConfigListbox
            configProp="returnFocus"
            configValues={returnFocusConfigValues}
            demoElementsState={demoElementsState}
            dispatchTrapControlsState={dispatchTrapControlsState}
          />

          <Switch label="lock" checked={trapConfig.lock} handleChange={handleSwitchChange} />

          <Switch label="escape" checked={trapConfig.escape} handleChange={handleSwitchChange} />

          <ResetButton handleClick={handleReset} label="Reset Values" />
        </Fragment>
      )}

      <SubmitButton label={trapAction} disabled={trapAction === 'BUILD' && !trapConfig.roots.length} />
    </form>
  );
}
