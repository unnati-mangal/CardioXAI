import { useNavigate } from 'react-router-dom';
import { HeartPulse, ChevronRight, FlaskConical } from 'lucide-react';
import type { Assessment } from '../../types/assessment';
import { formatDateTime, formatRiskLabel } from '../../utils/formatters';
import Button from '../common/Button';

interface RecentAssessmentsProps {
  assessments: Assessment[];
}

const riskColour = {
  low:      'text-sage-green   bg-sage-green/10',
  moderate: 'text-yellow-600   bg-yellow-50',
  high:     'text-muted-coral  bg-muted-coral/10',
};

function AssessmentRow({ assessment }: { assessment: Assessment }) {
  const navigate = useNavigate();
  const hasResult = !assessment.is_stub && assessment.prediction_probability !== null;

  const riskInfo = hasResult && assessment.prediction_probability !== null
    ? formatRiskLabel(assessment.prediction_probability)
    : null;

  return (
    <div
      className="flex items-center justify-between gap-4 py-3 border-b border-neutral-50 last:border-0 cursor-pointer hover:bg-neutral-50 rounded-lg px-2 -mx-2 transition-colors"
      onClick={() => navigate(`/predict`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate('/predict')}
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-sage-green/10 flex items-center justify-center flex-shrink-0">
          <HeartPulse className="w-4 h-4 text-sage-green" />
        </div>
        <div>
          <p className="text-sm font-medium text-neutral-800">
            Assessment #{assessment.id}
          </p>
          <p className="text-xs text-neutral-400">
            {formatDateTime(assessment.created_at)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {riskInfo ? (
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${riskColour[riskInfo.level]}`}>
            {riskInfo.label}
          </span>
        ) : (
          <span className="text-xs font-medium px-2.5 py-1 rounded-full text-neutral-400 bg-neutral-100 flex items-center gap-1">
            <FlaskConical className="w-3 h-3" />
            Pending ML
          </span>
        )}
        <ChevronRight className="w-4 h-4 text-neutral-300" />
      </div>
    </div>
  );
}

function EmptyState() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-12 h-12 rounded-2xl bg-sage-green/10 flex items-center justify-center mb-4">
        <HeartPulse className="w-6 h-6 text-sage-green" />
      </div>
      <p className="font-medium text-neutral-700 mb-1">No assessments yet</p>
      <p className="text-sm text-neutral-400 mb-5">
        Run your first cardiovascular risk assessment to see your results here.
      </p>
      <Button variant="primary" onClick={() => navigate('/predict')}>
        Start First Assessment
      </Button>
    </div>
  );
}

export default function RecentAssessments({ assessments }: RecentAssessmentsProps) {
  return (
    <div className="bg-white rounded-2xl border border-neutral-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-neutral-800">Recent Assessments</h2>
        {assessments.length > 0 && (
          <span className="text-xs text-neutral-400">
            {assessments.length} total
          </span>
        )}
      </div>

      {assessments.length === 0 ? (
        <EmptyState />
      ) : (
        <div>
          {assessments.slice(0, 5).map((a) => (
            <AssessmentRow key={a.id} assessment={a} />
          ))}
        </div>
      )}
    </div>
  );
}
