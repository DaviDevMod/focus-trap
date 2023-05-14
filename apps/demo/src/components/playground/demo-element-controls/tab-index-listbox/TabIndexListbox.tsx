import { Listbox as HeadlessUIListbox } from '@headlessui/react';

import type { UnsubmittedButtonPropsReducerAction } from '../DemoElementControls';
import { Listbox } from '../../../UI/listbox/Listbox';
import { ListboxOption } from '../../../UI/listbox/ListboxOption';

interface TabIndexListboxProps {
  tabIndex: string;
  dispatchTabIndex: (value: UnsubmittedButtonPropsReducerAction) => void;
}

export function TabIndexListbox({ tabIndex, dispatchTabIndex }: TabIndexListboxProps) {
  const listboxOptions = (
    <HeadlessUIListbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
      {['-1', '0', '1', '2', '3', 'NaN'].map((option) => (
        <ListboxOption key={option} value={option} />
      ))}
    </HeadlessUIListbox.Options>
  );

  const handleChange = (selectedOption: string) => dispatchTabIndex({ tabIndex: selectedOption });

  return (
    <Listbox
      label={'tabindex'}
      value={tabIndex}
      handleChange={handleChange}
      options={listboxOptions}
      disabled={!tabIndex}
    />
  );
}
