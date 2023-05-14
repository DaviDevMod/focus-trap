import { Listbox as HeadlessUIListbox } from '@headlessui/react';

import { Listbox } from '../../../UI/listbox/Listbox';
import { ListboxOption } from '../../../UI/listbox/ListboxOption';

interface IdListboxProps {
  id: string;
  options: string[];
  setSelectedButtonIdState: React.Dispatch<React.SetStateAction<string>>;
}

export function IdListbox({ id, options, setSelectedButtonIdState }: IdListboxProps) {
  const listboxOptions = (
    <HeadlessUIListbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
      {options.map((option) => (
        <ListboxOption key={option} value={option} />
      ))}
    </HeadlessUIListbox.Options>
  );

  const handleChange = (selectedId: string) => setSelectedButtonIdState(selectedId);

  return <Listbox label={'id'} value={id} handleChange={handleChange} options={listboxOptions} />;
}
