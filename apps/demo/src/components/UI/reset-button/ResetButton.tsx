interface ResetButtonProps {
  disabled: boolean;
  handleClick: React.MouseEventHandler<HTMLButtonElement>;
  label?: string | undefined;
}

export function ResetButton({ disabled, handleClick, label }: ResetButtonProps) {
  return (
    <button
      type="reset"
      disabled={disabled}
      onClick={handleClick}
      className={`${
        disabled ? 'text-neutral-400' : 'text-amber-600 hover:font-extrabold hover:text-red-500'
      } w-[max-content] border-b border-current bg-transparent`}
    >
      {label ?? 'Reset'}
    </button>
  );
}
