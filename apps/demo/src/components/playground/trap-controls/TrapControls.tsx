import type { RequireExactlyOne } from 'type-fest';
import { useEffect, useMemo, useReducer, useState } from 'react';
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
  displayComponent?: boolean;
  setRootsToHighlightState: React.Dispatch<React.SetStateAction<string[]>>;
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
// `TrapControlsReducerAction` is actually the union of object literals having a bunch of properties,
// all but one set to an optional `never`: we then rely on the compiler option "exactOptionalPropertyTypes"
// to ensure that the action can have only one property (and no additional properties set to `undefined`).
export type TrapControlsReducerAction = RequireExactlyOne<{ trapAction: keyof typeof TrapActions } & DemoTrapConfig>;

const initialControlsState: TrapControlsState = {
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
  setRootsToHighlightState,
}: TrapControlsProps) {
  const [demoElementsState, setDemoElementsState] = useState<HTMLElement[]>([]);
  const [{ trapAction, trapConfig }, dispatchTrapControlsState] = useReducer(trapControlsReducer, initialControlsState);
  const [initialFocusFilterState, setInitialFocusFilterState] = useState(false);
  const [lastTrapEscape, setLastTrapEscape] = useState(false);

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

  const trapActionIsNotBuild = trapAction !== 'BUILD';

  const handleSwitchChange = (checked: boolean, label: keyof Pick<DemoTrapConfig, 'lock' | 'escape'>) => {
    dispatchTrapControlsState({ [label]: checked } as TrapControlsReducerAction);
  };

  const handleReset = () => dispatchKeys('TrapControls');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    if (!trapAction) return;

    event.preventDefault();

    if (trapActionIsNotBuild) {
      setRootsToHighlightState(trapAction === 'RESUME' ? trapConfig.roots : []);

      focusTrap(trapAction);

      return;
    }

    setRootsToHighlightState(trapConfig.roots);

    setLastTrapEscape(
      focusTrap({
        ...trapConfig,
        initialFocus: strToBoolOrItself(trapConfig.initialFocus),
        returnFocus: strToBoolOrItself(trapConfig.returnFocus),
      }).escape
    );
  };

  useEffect(() => {
    const escHandler = (event: KeyboardEvent) => {
      if (event.key === 'Escape' || event.key === 'Esc' || event.keyCode === 27) {
        if (lastTrapEscape) setRootsToHighlightState([]);
      }
    };

    document.addEventListener('keydown', escHandler);
    return () => document.removeEventListener('keydown', escHandler);
  }, [lastTrapEscape, setRootsToHighlightState]);

  return (
    <form
      onSubmit={handleSubmit}
      className={`${displayComponent ? 'block' : 'hidden'} flex flex-col justify-between gap-y-3`}
    >
      <TrapActionMenu dispatchTrapControlsState={dispatchTrapControlsState} />

      <TrapConfigListbox
        configProp="roots"
        configValues={rootsAndInitialFocusConfigValues}
        skeletonRootId={demoElementsRootState?.id}
        filterState={initialFocusFilterState}
        setFilterState={setInitialFocusFilterState}
        demoElementsState={demoElementsState}
        dispatchTrapControlsState={dispatchTrapControlsState}
        disabled={trapActionIsNotBuild}
      />

      <TrapConfigListbox
        configProp="initialFocus"
        configValues={rootsAndInitialFocusConfigValues}
        skeletonRootId={demoElementsRootState?.id}
        filterState={initialFocusFilterState}
        setFilterState={setInitialFocusFilterState}
        demoElementsState={demoElementsState}
        dispatchTrapControlsState={dispatchTrapControlsState}
        disabled={trapActionIsNotBuild}
      />

      <TrapConfigListbox
        configProp="returnFocus"
        configValues={returnFocusConfigValues}
        demoElementsState={demoElementsState}
        dispatchTrapControlsState={dispatchTrapControlsState}
        disabled={trapActionIsNotBuild}
      />

      <Switch
        label="lock"
        checked={trapConfig.lock}
        handleChange={handleSwitchChange}
        disabled={trapActionIsNotBuild}
      />

      <Switch
        label="escape"
        checked={trapConfig.escape}
        handleChange={handleSwitchChange}
        disabled={trapActionIsNotBuild}
      />

      <ResetButton disabled={trapAction === undefined} handleClick={handleReset} />

      <SubmitButton disabled={trapAction === undefined} label={trapAction} />
    </form>
  );
}
