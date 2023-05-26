import { Listbox } from '@headlessui/react';
import { CheckIcon } from '@heroicons/react/20/solid';

interface ListboxOptionProps {
  value: string;
}

export function ListboxOption({ value }: ListboxOptionProps) {
  return (
    <Listbox.Option
      value={value}
      className="ui-active:bg-blue-100 ui-active:text-blue-950 relative cursor-default select-none py-2 pl-10 pr-4 text-gray-900"
    >
      {({ selected }) => (
        <>
          <span tabIndex={-1} className="ui-selected:font-semibold block truncate font-normal focus:outline-none">
            {value}
          </span>
          {selected ? (
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
              <CheckIcon className="h-5 w-5" aria-hidden="true" />
            </span>
          ) : null}
        </>
      )}
    </Listbox.Option>
  );
}
