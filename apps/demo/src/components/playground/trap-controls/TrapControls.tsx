import type { RequireExactlyOne } from 'type-fest';
import { Fragment, useMemo, useReducer, useState } from 'react';
import { focusTrap } from '@davidevmod/focus-trap';

import type { KeysState } from '../Playground';
import { getHTMLElementFlatSubTree, strToBoolOrItself } from '../../../utils/utils';
import { TrapActionMenu } from './trap-action-menu/TrapActionMenu';
import { TrapConfigListbox } from './trap-config-listbox/TrapConfigListbox';
import { Switch } from '../../UI/switch/Switch';
import { SubmitButton } from '../../UI/submit-button/SubmitButton';
import { ResetButton } from '../../UI/reset-button/ResetButton';

interface TrapControlsProps {
  demoElementsRootState: HTMLDivElement | undefined;
  dispatchKeys: React.Dispatch<keyof KeysState>;
  displayComponent: boolean;
  setLastTrapEscapeState: React.Dispatch<boolean>;
  setRootsToHighlightState: React.Dispatch<React.SetStateAction<string[]>>;
}

export enum TrapActions {
  BUILD = 'BUILD',
  DEMOLISH = 'DEMOLISH',
  RESUME = 'RESUME',
  PAUSE = 'PAUSE',
}
// Basically `TrapConfig` from '@davidevmod/focus-trap', but with types dictated by the inputs in the demo.
// The boolean values of `initialFocus` and `returnFocus` are being stored as strings and
// converted to actual booleans only once, right before to feed the config to `useSimpleFocusTrap`.
export interface DemoTrapConfig {
  roots: string[];
  initialFocus: string;
  returnFocus: string;
  lock: boolean;
  escape: boolean;
}

interface TrapControlsState {
  trapAction: keyof typeof TrapActions;
  trapConfig: DemoTrapConfig;
}

// A dispatchable action is an object with either a `trapAction` or one of the properties in `DemoTrapConfig`.
// `TrapControlsReducerAction` is actually the union of object literals having a bunch of properties,
// all but one set to an optional `never`: we then rely on the compiler option "exactOptionalPropertyTypes"
// to ensure that the action can have only one property (and no additional properties set to `undefined`).
export type TrapControlsReducerAction = RequireExactlyOne<{ trapAction: keyof typeof TrapActions } & DemoTrapConfig>;

const initialControlsState: TrapControlsState = {
  trapAction: 'BUILD',
  trapConfig: { roots: [], initialFocus: 'true', returnFocus: 'true', lock: true, escape: true },
};

const trapControlsReducer = (state: TrapControlsState, action: TrapControlsReducerAction): TrapControlsState => {
  if (action.trapAction) return { ...state, ...action };

  return { ...state, trapConfig: { ...state.trapConfig, ...action } };
};

export function TrapControls({
  demoElementsRootState,
  dispatchKeys,
  displayComponent,
  setLastTrapEscapeState,
  setRootsToHighlightState,
}: TrapControlsProps) {
  const [demoElementsState, setDemoElementsState] = useState<HTMLElement[]>([]);
  const [{ trapAction, trapConfig }, dispatchTrapControlsState] = useReducer(trapControlsReducer, initialControlsState);
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

  const handleReset = () => dispatchKeys('TrapControls');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    if (!trapAction) return;

    event.preventDefault();

    setRootsToHighlightState(trapAction === 'BUILD' || trapAction === 'RESUME' ? trapConfig.roots : []);

    trapAction === 'BUILD'
      ? // Storing `escape` so that the trap can(not) be demolished with the `Esc` key
        // even after the component states are reset (and the `trapConfig` ot the running trap is lost).
        setLastTrapEscapeState(
          focusTrap({
            ...trapConfig,
            initialFocus: strToBoolOrItself(trapConfig.initialFocus),
            returnFocus: strToBoolOrItself(trapConfig.returnFocus),
          }).escape
        )
      : focusTrap(trapAction);
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

          <ResetButton disabled={trapAction === undefined} handleClick={handleReset} label="Reset Values" />
        </Fragment>
      )}

      <SubmitButton disabled={trapAction === undefined} label={trapAction} />
    </form>
  );
}
