import type { ElementType } from 'react';
import { ClipboardList, Calendar } from 'lucide-react';
import type { Assessment } from '../../types/assessment';
import { formatDate } from '../../utils/formatters';

interface AssessmentSummaryProps {
  assessments: Assessment[];
}

interface StatCardProps {
  icon:    ElementType;
  label:   string;
  value:   string;
  accent?: boolean;
}

function StatCard({ icon: Icon, label, value, accent = false }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-neutral-100 p-5 flex items-center gap-4">
      <div className={[
        'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
        accent ? 'bg-muted-coral/10' : 'bg-sage-green/10',
      ].join(' ')}>
        <Icon className={['w-5 h-5', accent ? 'text-muted-coral' : 'text-sage-green'].join(' ')} />
      </div>
      <div>
        <p className="text-xs text-neutral-400 mb-0.5">{label}</p>
        <p className="text-lg font-bold text-neutral-800">{value}</p>
      </div>
    </div>
  );
}

export default function AssessmentSummary({ assessments }: AssessmentSummaryProps) {
  const total    = assessments.length;
  const lastDate = total > 0
    ? formatDate(assessments[0].created_at)
    : '—';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <StatCard
        icon={ClipboardList}
        label="Total Assessments"
        value={total === 0 ? '0' : String(total)}
      />
      <StatCard
        icon={Calendar}
        label="Last Assessment"
        value={lastDate}
        accent
      />
    </div>
  );
}
