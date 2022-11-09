import { useCallback, useEffect, useReducer, useState } from 'react';
import { RequireExactlyOne } from 'type-fest';

import { SkeletonButton } from '../../../hooks/useTrapElementsSkeleton';
import { ControlsKeysState, SelectClickedElement } from '../Playground';
import { IdListbox } from './id-listbox/IdListbox';
import { TabIndexListbox } from './tab-index-listbox/TabIndexListbox';
import { Switch } from '../../UI/switch/Switch';
import { SubmitButton } from '../../UI/submit-button/SubmitButton';
import { ResetButton } from '../../UI/reset-button/ResetButton';

interface TrapElementsControlsProps {
  skeletonButtonsIds: string[];
  getSkeletonButtonElementById: (id: string) => SkeletonButton | undefined;
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
) => {
  // With "exactOptionalPropertyTypes" enabled, there's no way to dispatch an action with
  // `id: undefined`, but the `in` operator is currently unable to narrow the `action`.
  // This issue (opened just 2 weeks ago) https://github.com/microsoft/TypeScript/issues/51303
  // mentions that they are working on it: "If you use `in` on a union of objects,
  // we remove the objects that don't explicitly declare the appropriate keys."
  // For the moment, the below `action.id !== undefined` reads as `'id' in action`.
  if (action.id !== undefined) return { ...action };
  return { ...state, ...action };
};

export function TrapElementsControls({
  skeletonButtonsIds,
  getSkeletonButtonElementById,
  patchSkeletonButton,
  setSelectClickedElementState,
  setControlsKeysState,
  displayComponent,
}: TrapElementsControlsProps) {
  const [selectedSkeletonButtonState, setSelectedSkeletonButtonState] = useState<SkeletonButton>();
  const [unsubmittedSelectedSkeletonButtonPropertiesState, dispatchUnsubmittedSelectedSkeletonButtonPropertiesState] =
    useReducer(unsubmittedSelectedSkeletonButtonPropertiesStateReducer, initialUnsubmittedProperties);
  const { id, tabIndex, disabled, display } = unsubmittedSelectedSkeletonButtonPropertiesState;

  // Resetting `selectClickedElementState.id` in the parent, whenever the `key` of the current component changes.
  useEffect(() => {
    setSelectClickedElementState((prevState) => ({ ...prevState, id }));
    // It may be visually cleaner to add the deps here and remove `setSelectClickedElementState` from
    // `setSelectedSkeletonButtonStateById`, but that would trigger an unnecessary render phase for the current
    // component when its states updates trigger states updates in the parent, while in this way they are batched.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // This is the only place in which `getSkeletonButtonElementById` should ever be called, in this component.
  // Otherwise it would become possible to call `setSelectedSkeletonButtonState` directly (rather than through
  // `setSelectedSkeletonButtonStateById`) with a skeleton button that differs from the one used to get the
  // `unsubmittedSelectedSkeletonButtonPropertiesState`, allowing for a buggy `patchSkeletonButton` call at submission.
  const setSelectedSkeletonButtonStateById = useCallback(
    (id: string) => {
      if (id === selectedSkeletonButtonState?.id) return;

      const newSkeletonButtonState = getSkeletonButtonElementById(id);

      if (!newSkeletonButtonState) {
        throw new Error(
          `Somehow the "${id}" id is selectable even though it doesn't belong to any button in the skeleton.`
        );
      }

      setSelectedSkeletonButtonState(newSkeletonButtonState);
      dispatchUnsubmittedSelectedSkeletonButtonPropertiesState(newSkeletonButtonState);
      setSelectClickedElementState((prevState) => ({ ...prevState, id }));
    },
    [selectedSkeletonButtonState?.id, getSkeletonButtonElementById, setSelectClickedElementState]
  );

  useEffect(() => {
    setSelectClickedElementState((prevState) => ({ ...prevState, setSelectedSkeletonButtonStateById }));
  }, [setSelectClickedElementState, setSelectedSkeletonButtonStateById]);

  // TS struggles with dynamic keys: https://github.com/DefinitelyTyped/DefinitelyTyped/issues/26635#issuecomment-399807238
  // TS specs: https://github.com/microsoft/TypeScript/blob/main/doc/spec-ARCHIVED.md#413-property-access
  const handleSwitchChange = (checked: boolean, label?: string) =>
    dispatchUnsubmittedSelectedSkeletonButtonPropertiesState({ [label as 'display']: checked });

  const handleReset = () =>
    setControlsKeysState((prevState) => ({ ...prevState, trapElements: prevState.trapElements - 1 }));

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

      <Switch label={'disabled'} checked={disabled} handleChange={handleSwitchChange} disabled={!id} />

      <Switch label={'display'} checked={display} handleChange={handleSwitchChange} disabled={!id} />

      <ResetButton disabled={!id} handleClick={handleReset} />

      <SubmitButton disabled={!id} />
    </form>
  );
}
