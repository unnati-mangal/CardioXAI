import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label:        string;
  id:           string;
  error?:       string | null;
  helperText?:  string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, id, error, helperText, className = '', ...rest }, ref) => {
    const hasError = Boolean(error);

    return (
      <div className="flex flex-col gap-1">
        <label
          htmlFor={id}
          className="text-sm font-medium text-neutral-700"
        >
          {label}
        </label>

        <input
          ref={ref}
          id={id}
          className={[
            'w-full rounded-lg border px-3 py-2.5 text-sm text-neutral-800',
            'bg-white placeholder:text-neutral-400',
            'transition-colors duration-150',
            'focus:outline-none focus:ring-2 focus:ring-offset-0',
            hasError
              ? 'border-muted-coral focus:ring-muted-coral/40'
              : 'border-neutral-200 focus:ring-sage-green/50 focus:border-sage-green',
            className,
          ].join(' ')}
          aria-invalid={hasError}
          aria-describedby={
            error       ? `${id}-error`  :
            helperText  ? `${id}-helper` :
            undefined
          }
          {...rest}
        />

        {error && (
          <p id={`${id}-error`} className="text-xs text-muted-coral" role="alert">
            {error}
          </p>
        )}

        {!error && helperText && (
          <p id={`${id}-helper`} className="text-xs text-neutral-400">
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';

export default Input;
