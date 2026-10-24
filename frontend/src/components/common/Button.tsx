import type { ReactNode } from 'react';
import LoadingSpinner from './LoadingSpinner';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';
type ButtonType    = 'button' | 'submit' | 'reset';

interface ButtonProps {
  children:   ReactNode;
  variant?:   ButtonVariant;
  type?:      ButtonType;
  loading?:   boolean;
  disabled?:  boolean;
  onClick?:   () => void;
  className?: string;
  fullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:   'bg-forest-green text-white hover:bg-forest-green/90 border border-transparent',
  secondary: 'bg-transparent text-sage-green border border-sage-green hover:bg-sage-green/10',
  ghost:     'bg-transparent text-neutral-600 border border-transparent hover:bg-neutral-100',
};

export default function Button({
  children,
  variant   = 'primary',
  type      = 'button',
  loading   = false,
  disabled  = false,
  onClick,
  className = '',
  fullWidth = false,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={[
        'inline-flex items-center justify-center gap-2',
        'rounded-lg px-5 py-2.5 text-sm font-medium',
        'transition-colors duration-150',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-forest-green focus-visible:ring-offset-2',
        variantClasses[variant],
        isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
        fullWidth  ? 'w-full' : '',
        className,
      ].join(' ')}
    >
      {loading && <LoadingSpinner size="sm" color={variant === 'primary' ? 'white' : 'forest'} />}
      <span className={loading ? 'opacity-0 absolute' : ''}>{children}</span>
    </button>
  );
}
