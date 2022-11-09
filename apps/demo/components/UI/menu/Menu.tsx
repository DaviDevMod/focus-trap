import { Fragment } from 'react';
import { Menu as HeadlessUIMenu, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { MenuItem } from './MenuItem';

interface MenuProps {
  label: string;
  // TS doesn't check whether `items` is an array of <MenuItem>. The annotation here is just documenting.
  items: React.ReactElement<typeof MenuItem>[];
}

export function Menu({ label, items }: MenuProps) {
  return (
    <HeadlessUIMenu as="div" className="relative inline-block text-left">
      <HeadlessUIMenu.Button
        name={`Toggle ${label} Menu`}
        className="inline-flex w-full justify-center rounded-md bg-black bg-opacity-20 px-4 py-2 text-sm font-medium text-white hover:bg-opacity-30 focus:outline-amber-400"
      >
        {label}
        <ChevronDownIcon className="ml-2 -mr-1 h-5 w-5 text-violet-200 hover:text-violet-100" aria-hidden="true" />
      </HeadlessUIMenu.Button>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <HeadlessUIMenu.Items className="absolute z-10 mt-2 w-full origin-top-left divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          {items}
        </HeadlessUIMenu.Items>
      </Transition>
    </HeadlessUIMenu>
  );
}
