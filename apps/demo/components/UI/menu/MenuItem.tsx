import { Menu } from '@headlessui/react';

interface MenuItemProps {
  handleClick: React.MouseEventHandler<HTMLButtonElement>;
  children?: React.ReactNode;
}

export function MenuItem({ handleClick, children }: MenuItemProps) {
  return (
    <Menu.Item>
      <button
        type="button"
        onClick={handleClick}
        className="ui-active:bg-violet-500 ui-active:text-white group flex w-full items-center rounded-md px-2 py-2 text-sm text-gray-900"
      >
        {children}
      </button>
    </Menu.Item>
  );
}
