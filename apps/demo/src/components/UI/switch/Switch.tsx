import { Switch as HeadlessUISwitch } from '@headlessui/react';

interface SwitchProps<T> {
  label: T;
  checked: boolean;
  handleChange: (checked: boolean, label: T) => void;
  disabled?: boolean;
}

export function Switch<T extends string>({ label, checked, handleChange, disabled }: SwitchProps<T>) {
  return (
    <HeadlessUISwitch.Group as="div" className="mt-3">
      <HeadlessUISwitch.Label className="p-3 align-top">{label}</HeadlessUISwitch.Label>
      <HeadlessUISwitch
        checked={checked}
        onChange={(checked: boolean) => handleChange(checked, label)}
        disabled={disabled}
        className={`${
          disabled ? 'bg-gray-200' : 'ui-checked:bg-blue-600 ui-not-checked:bg-gray-200'
        } relative inline-flex h-6 w-11 items-center rounded-full`}
        data-cy={`Toggle ${label} Switch`}
      >
        <span className="ui-checked:translate-x-6 ui-not-checked:translate-x-1 inline-block h-4 w-4 transform rounded-full bg-white transition" />
      </HeadlessUISwitch>
    </HeadlessUISwitch.Group>
  );
}
