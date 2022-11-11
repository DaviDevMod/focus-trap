import { Menu } from '@headlessui/react';

interface MenuItemProps {
  label: string;
  handleClick: React.MouseEventHandler<HTMLButtonElement>;
}

export function MenuItem({ label, handleClick }: MenuItemProps) {
  // TODO: using <Menu.Item as='button'> submits the form on click. Look for another way to prevent that.
  return (
    <Menu.Item>
      <button
        type="button"
        onClick={handleClick}
        className="ui-active:bg-violet-500 ui-active:text-white group flex w-full items-center rounded-md px-2 py-2 text-sm text-gray-900"
        data-cy={`Select ${label} Action`}
      >
        {label}
      </button>
    </Menu.Item>
  );
}
