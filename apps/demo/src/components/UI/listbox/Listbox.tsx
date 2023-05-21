import { Fragment } from 'react';
import { Listbox as HeadlessUIListbox, Transition } from '@headlessui/react';
import { ChevronDoubleDownIcon } from '@heroicons/react/20/solid';

interface ListboxProps<T> {
  label: string;
  value: T;
  handleChange: (selectedOptions: T) => void;
  // TS doesn't check whether `options` is an <HeadlessUIListbox.Options>. The annotation here is just documenting.
  options: React.ReactElement<typeof HeadlessUIListbox.Options>;
  displayValue?: T;
  disabled?: boolean;
  multiple?: boolean;
}

export function Listbox<T extends string | string[]>({
  label,
  value,
  handleChange,
  options,
  displayValue,
  disabled,
  multiple,
}: ListboxProps<T>) {
  return (
    <HeadlessUIListbox disabled={!!disabled} value={value} onChange={handleChange} multiple={!!multiple}>
      <h3>{label}</h3>
      <div className="relative mb-4">
        <HeadlessUIListbox.Button
          className={`${
            disabled ? 'bg-gray-200 text-neutral-400' : 'bg-blue-300'
          } relative h-9 w-full cursor-default rounded-lg pl-3 pr-10 text-left text-sm shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300`}
        >
          {/* We don't want an empty string as a `displayValue`. Do not swap the `||` for a `??`. */}
          <span className="block w-[16vw] truncate">{displayValue || value}</span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronDoubleDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </span>
        </HeadlessUIListbox.Button>
        <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
          {options}
        </Transition>
      </div>
    </HeadlessUIListbox>
  );
}
