import { Fragment, memo } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';

import type { TrapControlsReducerAction } from '../TrapControls';
import { TrapActions } from '../TrapControls';

interface TrapActionMenuProps {
  dispatchTrapControlsState: React.Dispatch<TrapControlsReducerAction>;
}

export const TrapActionMenu = memo(function TrapActionMenu({ dispatchTrapControlsState }: TrapActionMenuProps) {
  return (
    <Menu as="div" className="relative my-2 inline-block text-left">
      <Menu.Button className="ui-open:bg-blue-800 inline-flex w-full justify-center rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800">
        Action
        <ChevronDownIcon className="-mr-1 ml-2 h-5 w-5 text-violet-200 hover:text-violet-100" aria-hidden="true" />
      </Menu.Button>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute z-10 mt-2 w-full origin-top-left divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          {Object.values(TrapActions).map((trapAction) => (
            <Menu.Item key={trapAction}>
              <button
                type="button"
                onClick={() => dispatchTrapControlsState({ trapAction })}
                className="ui-active:bg-blue-700 ui-active:text-white group flex w-full items-center rounded-md px-2 py-2 text-sm text-gray-900"
              >
                {trapAction}
              </button>
            </Menu.Item>
          ))}
        </Menu.Items>
      </Transition>
    </Menu>
  );
});
