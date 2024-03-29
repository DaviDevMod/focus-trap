import type { RequireExactlyOne } from 'type-fest';
import { useReducer, useState } from 'react';

import type { SkeletonButton } from '../../../hooks/useSkeleton';
import { IdListbox } from './id-listbox/IdListbox';
import { TabIndexListbox } from './tab-index-listbox/TabIndexListbox';
import { Switch } from '../../UI/switch/Switch';
import { SubmitButton } from '../../UI/submit-button/SubmitButton';
import { ResetButton } from '../../UI/reset-button/ResetButton';

interface DemoButtonControlsProps {
  skeletonButtonsIds: string[];
  getSkeletonButtonById: (id: string) => SkeletonButton | undefined;
  patchSkeletonButton: (patch: SkeletonButton) => void;
  selectedButtonIdState: string;
  setSelectedButtonIdState: React.Dispatch<React.SetStateAction<string>>;
  displayComponent?: boolean;
}

interface UnsubmittedButtonPropsState {
  id: string;
  tabIndex: string;
  disabled: boolean;
  display: boolean;
}

// An action is either an `UnsubmittedButtonPropsState` or one of its properties except the `id`.
export type UnsubmittedButtonPropsReducerAction =
  | UnsubmittedButtonPropsState
  | RequireExactlyOne<
      Omit<UnsubmittedButtonPropsState, 'id'> & { id?: never },
      Exclude<keyof UnsubmittedButtonPropsState, 'id'>
    >;

const initialUnsubmittedButtonPropsState: UnsubmittedButtonPropsState = {
  id: '',
  tabIndex: '',
  disabled: false,
  display: false,
};

const unsubmittedButtonPropsReducer = (
  state: UnsubmittedButtonPropsState,
  action: UnsubmittedButtonPropsReducerAction
): UnsubmittedButtonPropsState => {
  if (action.id !== undefined) return { ...action };
  return { ...state, ...action };
};

export function DemoButtonControls({
  skeletonButtonsIds,
  getSkeletonButtonById,
  patchSkeletonButton,
  selectedButtonIdState,
  setSelectedButtonIdState,
  displayComponent,
}: DemoButtonControlsProps) {
  const [selectedSkeletonButtonState, setSelectedSkeletonButtonState] = useState<SkeletonButton>();
  const [unsubmittedButtonPropsState, dispatchUnsubmittedButtonProps] = useReducer(
    unsubmittedButtonPropsReducer,
    initialUnsubmittedButtonPropsState
  );
  const { id, tabIndex, disabled, display } = unsubmittedButtonPropsState;

  if (selectedButtonIdState !== id) {
    const newSkeletonButtonState = getSkeletonButtonById(selectedButtonIdState);

    if (!newSkeletonButtonState) {
      throw new Error(
        `Somehow the "${id}" id is selectable even though it doesn't belong to any button in the skeleton.`
      );
    }

    setSelectedSkeletonButtonState(newSkeletonButtonState);
    dispatchUnsubmittedButtonProps(newSkeletonButtonState);
  }

  const handleSwitchChange = (
    checked: boolean,
    label: keyof Pick<UnsubmittedButtonPropsState, 'disabled' | 'display'>
  ) => {
    dispatchUnsubmittedButtonProps({
      [label]: checked,
    } as UnsubmittedButtonPropsReducerAction);
  };

  const handleReset = () => {
    // Reset current component states.
    setSelectedSkeletonButtonState(undefined);
    dispatchUnsubmittedButtonProps(initialUnsubmittedButtonPropsState);
    // Reset `selectedButtonIdState` in the parent, because
    // it's used to populate states in current component at render time.
    setSelectedButtonIdState('');
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedSkeletonButtonState) {
      throw new Error('Button controls submitted without any selected element.');
    }

    patchSkeletonButton({
      ...selectedSkeletonButtonState,
      ...unsubmittedButtonPropsState,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`${displayComponent ? 'block' : 'hidden'} flex flex-col justify-between gap-y-3`}
    >
      <IdListbox id={id} options={skeletonButtonsIds} setSelectedButtonIdState={setSelectedButtonIdState} />

      <TabIndexListbox tabIndex={tabIndex} dispatchTabIndex={dispatchUnsubmittedButtonProps} />

      <Switch label="disabled" checked={disabled} handleChange={handleSwitchChange} disabled={!id} />

      <Switch label="display" checked={display} handleChange={handleSwitchChange} disabled={!id} />

      <ResetButton disabled={!id} handleClick={handleReset} label="Reset Values" />

      <SubmitButton disabled={!id} />
    </form>
  );
}
