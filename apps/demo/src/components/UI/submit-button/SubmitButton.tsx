import { useState } from 'react';

interface SubmitButtonProps {
  disabled: boolean;
  label?: string | undefined;
}

export function SubmitButton({ disabled, label }: SubmitButtonProps) {
  // Used to change the styles of the button at every `mouseOver`.
  const [styleCounterState, setStylecounterState] = useState(0);

  const handleMouseOver = () => setStylecounterState((prevState) => prevState + 1);

  return (
    <button
      type="submit"
      disabled={disabled}
      onMouseOver={handleMouseOver}
      className={`${
        disabled
          ? 'text-neutral-400'
          : `${styleCounterState % 2 ? 'bg-indigo-600 text-white' : 'text-indigo-600'} ${
              ((styleCounterState % 4) + 3) % 3 ? 'hover:rotate-2' : 'hover:-rotate-2'
            } hover:scale-110`
      } m-auto mt-4 w-1/2 rounded border border-current py-3 text-sm font-medium transition focus:outline-none focus:ring`}
    >
      {label ?? 'Submit'}
    </button>
  );
}
