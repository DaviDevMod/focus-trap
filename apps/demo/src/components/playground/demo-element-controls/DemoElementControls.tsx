import { useCallback, useEffect, useReducer, useState } from 'react';
import { RequireExactlyOne } from 'type-fest';

import { SkeletonButton } from '../../../hooks/useSkeleton';
import { ControlsKeysState, SelectClickedElement } from '../Playground';
import { IdListbox } from './id-listbox/IdListbox';
import { TabIndexListbox } from './tab-index-listbox/TabIndexListbox';
import { Switch } from '../../UI/switch/Switch';
import { SubmitButton } from '../../UI/submit-button/SubmitButton';
import { ResetButton } from '../../UI/reset-button/ResetButton';

interface DemoElementControlsProps {
  skeletonButtonsIds: string[];
  getSkeletonButtonById: (id: string) => SkeletonButton | undefined;
  patchSkeletonButton: (patch: SkeletonButton) => void;
  setSelectClickedElementState: React.Dispatch<React.SetStateAction<SelectClickedElement>>;
  setControlsKeysState: React.Dispatch<React.SetStateAction<ControlsKeysState>>;
  displayComponent?: boolean;
}

interface UnsubmittedProperties {
  id: string;
  tabIndex: string;
  disabled: boolean;
  display: boolean;
}

// An action is either an `UnsubmittedProperties` or one of its properties except the `id`.
export type UnsubmittedSelectedSkeletonButtonPropertiesStateReducerAction =
  | UnsubmittedProperties
  | RequireExactlyOne<Omit<UnsubmittedProperties, 'id'> & { id?: never }, Exclude<keyof UnsubmittedProperties, 'id'>>;

const initialUnsubmittedProperties: UnsubmittedProperties = {
  id: '',
  tabIndex: '',
  disabled: false,
  display: false,
};

const unsubmittedSelectedSkeletonButtonPropertiesStateReducer = (
  state: UnsubmittedProperties,
  action: UnsubmittedSelectedSkeletonButtonPropertiesStateReducerAction
): UnsubmittedProperties => {
  if (action.id !== undefined) return { ...action };
  return { ...state, ...action };
};

export function DemoElementControls({
  skeletonButtonsIds,
  getSkeletonButtonById,
  patchSkeletonButton,
  setSelectClickedElementState,
  setControlsKeysState,
  displayComponent,
}: DemoElementControlsProps) {
  const [selectedSkeletonButtonState, setSelectedSkeletonButtonState] = useState<SkeletonButton>();
  const [unsubmittedSelectedSkeletonButtonPropertiesState, dispatchUnsubmittedSelectedSkeletonButtonPropertiesState] =
    useReducer(unsubmittedSelectedSkeletonButtonPropertiesStateReducer, initialUnsubmittedProperties);
  const { id, tabIndex, disabled, display } = unsubmittedSelectedSkeletonButtonPropertiesState;

  // Resetting `selectClickedElementState.id` in the parent, whenever the `key` of the current component changes.
  useEffect(() => {
    setSelectClickedElementState((prevState) => ({ ...prevState, id }));
    // It may look cleaner to add the deps here and remove `setSelectClickedElementState` from
    // `setSelectedSkeletonButtonStateById`, but that would trigger an unnecessary render phase for the current
    // component when its states updates trigger states updates in the parent, while in this way they are batched.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setSelectedSkeletonButtonStateById = useCallback(
    (id: string) => {
      if (id === selectedSkeletonButtonState?.id) return;

      const newSkeletonButtonState = getSkeletonButtonById(id);

      if (!newSkeletonButtonState) {
        throw new Error(
          `Somehow the "${id}" id is selectable even though it doesn't belong to any button in the skeleton.`
        );
      }

      setSelectedSkeletonButtonState(newSkeletonButtonState);
      dispatchUnsubmittedSelectedSkeletonButtonPropertiesState(newSkeletonButtonState);
      setSelectClickedElementState((prevState) => ({ ...prevState, id }));
    },
    [selectedSkeletonButtonState?.id, getSkeletonButtonById, setSelectClickedElementState]
  );

  useEffect(() => {
    setSelectClickedElementState((prevState) => ({ ...prevState, setSelectedSkeletonButtonStateById }));
  }, [setSelectClickedElementState, setSelectedSkeletonButtonStateById]);

  const handleSwitchChange = (checked: boolean, label?: string) => {
    // A Union type can't be used to access properties: https://github.com/microsoft/TypeScript/issues/10530
    dispatchUnsubmittedSelectedSkeletonButtonPropertiesState({ [label as 'display']: checked });
  };

  const handleReset = () => {
    setControlsKeysState((prevState) => ({ ...prevState, demoElements: prevState.demoElements - 1 }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedSkeletonButtonState || !unsubmittedSelectedSkeletonButtonPropertiesState) {
      throw new Error('Elements controls submission should be disabled if no `id` is selected.');
    }

    patchSkeletonButton({
      ...selectedSkeletonButtonState,
      ...unsubmittedSelectedSkeletonButtonPropertiesState,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`${displayComponent ? 'block' : 'hidden'} flex flex-col justify-between gap-y-3`}
      data-cy="Element Controls"
    >
      <IdListbox
        id={id}
        options={skeletonButtonsIds}
        setSelectedSkeletonButtonStateById={setSelectedSkeletonButtonStateById}
      />

      <TabIndexListbox
        tabIndex={tabIndex}
        dispatchTabIndex={dispatchUnsubmittedSelectedSkeletonButtonPropertiesState}
      />

      <Switch label="disabled" checked={disabled} handleChange={handleSwitchChange} disabled={!id} />

      <Switch label="display" checked={display} handleChange={handleSwitchChange} disabled={!id} />

      <ResetButton disabled={!id} handleClick={handleReset} />

      <SubmitButton disabled={!id} />
    </form>
  );
}
