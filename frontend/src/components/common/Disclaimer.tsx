interface DisclaimerProps {
  compact?: boolean;
}

export default function Disclaimer({ compact = false }: DisclaimerProps) {
  return (
    <div
      className={[
        'border-l-4 border-muted-coral bg-muted-coral/10 rounded-r-lg text-neutral-600',
        compact ? 'px-4 py-2.5 text-xs' : 'px-5 py-4 text-sm',
      ].join(' ')}
      role="note"
      aria-label="Research disclaimer"
    >
      <p className="font-medium text-neutral-700 mb-0.5">
        Research & Educational Use Only
      </p>
      <p className={compact ? 'leading-relaxed' : 'leading-relaxed'}>
        CardioXAI is an educational research prototype. It does{' '}
        <strong>not</strong> provide medical advice and is{' '}
        <strong>not</strong> a substitute for professional clinical assessment.
        Always consult a qualified healthcare professional for medical decisions.
      </p>
    </div>
  );
}
