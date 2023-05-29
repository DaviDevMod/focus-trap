interface ResetButtonProps {
  disabled: boolean;
  handleClick: React.MouseEventHandler<HTMLButtonElement>;
  label?: string;
}

export function ResetButton({ disabled, handleClick, label }: ResetButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={handleClick}
      className={`${
        disabled ? 'text-neutral-400' : 'text-amber-600 hover:font-extrabold hover:text-red-500'
      } mx-auto my-1 w-[max-content] border-b border-current bg-transparent`}
    >
      {label ?? 'Reset'}
    </button>
  );
}
