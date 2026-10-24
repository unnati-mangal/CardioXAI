import { Heart, AlertTriangle, Calendar } from 'lucide-react';
import type { Assessment } from '../../types/assessment';
import { formatDate, formatRiskLabel } from '../../utils/formatters';

interface AssessmentSummaryProps {
  assessments: Assessment[];
}

export default function AssessmentSummary({ assessments }: AssessmentSummaryProps) {
  const total = assessments.length;

  const latest = assessments[0] ?? null;
  const latestDate = latest ? formatDate(latest.created_at) : '—';

  // Highest risk
  const withProb = assessments.filter((a) => a.prediction_probability !== null);
  const highest = withProb.length > 0
    ? withProb.reduce((a, b) =>
        (a.prediction_probability ?? 0) > (b.prediction_probability ?? 0) ? a : b
      )
    : null;
  const highestRisk = highest?.prediction_probability != null
    ? formatRiskLabel(highest.prediction_probability)
    : null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

      {/* Total assessments */}
      <div className="card p-5 flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-brand-green-light flex items-center justify-center flex-shrink-0">
          <Heart className="w-5 h-5 text-brand-green" />
        </div>
        <div>
          <p className="text-xs text-brand-muted mb-0.5">Total Assessments</p>
          <p className="text-2xl font-bold text-brand-text">{total}</p>
          <button className="text-xs text-brand-green hover:underline mt-0.5">
            View history →
          </button>
        </div>
      </div>

      {/* Highest risk */}
      <div className="card p-5 flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
        </div>
        <div>
          <p className="text-xs text-brand-muted mb-0.5">Highest Risk Level</p>
          {highestRisk ? (
            <p className={`text-lg font-bold ${
              highestRisk.level === 'high' ? 'text-red-600' :
              highestRisk.level === 'moderate' ? 'text-amber-600' :
              'text-brand-green'
            }`}>
              {highestRisk.label.replace(' Risk', '')}
            </p>
          ) : (
            <p className="text-lg font-bold text-brand-muted">—</p>
          )}
        </div>
      </div>

      {/* Latest assessment */}
      <div className="card p-5 flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
          <Calendar className="w-5 h-5 text-blue-500" />
        </div>
        <div>
          <p className="text-xs text-brand-muted mb-0.5">Latest Assessment</p>
          <p className="text-sm font-bold text-brand-text">{latestDate}</p>
        </div>
      </div>

    </div>
  );
}
