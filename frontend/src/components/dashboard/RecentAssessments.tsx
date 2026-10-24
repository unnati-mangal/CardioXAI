import { useNavigate } from 'react-router-dom';
import { HeartPulse, ChevronRight } from 'lucide-react';
import type { Assessment } from '../../types/assessment';
import { formatDate, formatRiskLabel } from '../../utils/formatters';

interface RecentAssessmentsProps {
  assessments: Assessment[];
}

function RiskBadge({ prob }: { prob: number | null }) {
  if (prob === null) return (
    <span className="text-xs px-2.5 py-1 rounded-full bg-neutral-100 text-brand-muted">Pending</span>
  );
  const r = formatRiskLabel(prob);
  const cls =
    r.level === 'high'     ? 'bg-red-50 text-red-600' :
    r.level === 'moderate' ? 'bg-amber-50 text-amber-700' :
                             'bg-brand-green-light text-brand-green';
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cls}`}>
      {r.label.replace(' Risk', '')}
    </span>
  );
}

export default function RecentAssessments({ assessments }: RecentAssessmentsProps) {
  const navigate = useNavigate();

  if (assessments.length === 0) {
    return (
      <div className="card p-8 flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-2xl bg-brand-green-light flex items-center justify-center mb-4">
          <HeartPulse className="w-6 h-6 text-brand-green" />
        </div>
        <p className="font-semibold text-brand-text mb-1">No assessments yet</p>
        <p className="text-sm text-brand-muted mb-5">
          Run your first cardiovascular risk assessment to see your results here.
        </p>
        <button onClick={() => navigate('/predict')} className="btn-primary">
          Start First Assessment
        </button>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-brand-text">Recent Assessments</h2>
        <button
          onClick={() => navigate('/assessments')}
          className="text-xs text-brand-green hover:underline"
        >
          View all →
        </button>
      </div>

      {/* Table header */}
      <div className="grid grid-cols-3 text-xs text-brand-muted font-medium pb-2 border-b border-brand-border">
        <span>Date</span>
        <span>Risk</span>
        <span>Status</span>
      </div>

      {/* Rows */}
      {assessments.slice(0, 5).map((a) => (
        <div
          key={a.id}
          className="grid grid-cols-3 items-center py-3 border-b border-brand-border last:border-0 cursor-pointer hover:bg-brand-bg rounded-lg px-1 -mx-1 transition-colors"
          onClick={() => navigate('/predict')}
        >
          <span className="text-sm text-brand-muted">{formatDate(a.created_at)}</span>
          <span className="text-sm text-brand-text font-medium">
            {a.prediction_probability !== null
              ? `${(a.prediction_probability * 100).toFixed(1)}%`
              : '—'
            }
          </span>
          <RiskBadge prob={a.prediction_probability} />
        </div>
      ))}
    </div>
  );
}
