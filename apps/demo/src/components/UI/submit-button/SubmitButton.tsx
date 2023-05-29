import { useState } from 'react';

interface SubmitButtonProps {
  label?: string;
  disabled?: boolean;
}

export function SubmitButton({ disabled, label }: SubmitButtonProps) {
  // Used to change the styles of the button at every `mouseOver`.
  const [stylesCounterState, setStylesCounterState] = useState(0);

  const handleMouseOver = () => setStylesCounterState((prevState) => prevState + 1);

  return (
    <button
      type="submit"
      disabled={disabled}
      onMouseOver={handleMouseOver}
      className={`${
        disabled
          ? 'text-neutral-400'
          : `${stylesCounterState % 2 ? 'bg-blue-800 text-white' : 'text-blue-800'} ${
              ((stylesCounterState % 4) + 3) % 3 ? 'hover:rotate-2' : 'hover:-rotate-2'
            } hover:scale-110`
      } mx-auto my-1 w-1/2 rounded border border-current py-3 text-sm font-medium transition focus:outline-none focus:ring`}
    >
      {label ?? 'Submit'}
    </button>
  );
}
