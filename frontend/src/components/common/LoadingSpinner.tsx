interface LoadingSpinnerProps {
  size?:  'sm' | 'md' | 'lg';
  color?: 'forest' | 'sage' | 'white' | 'neutral';
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
};

const colorClasses = {
  forest:  'border-forest-green/30 border-t-forest-green',
  sage:    'border-sage-green/30 border-t-sage-green',
  white:   'border-white/30 border-t-white',
  neutral: 'border-neutral-200 border-t-neutral-500',
};

export default function LoadingSpinner({
  size  = 'md',
  color = 'forest',
}: LoadingSpinnerProps) {
  return (
    <div
      className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full border-2 animate-spin`}
      role="status"
      aria-label="Loading"
    />
  );
}
