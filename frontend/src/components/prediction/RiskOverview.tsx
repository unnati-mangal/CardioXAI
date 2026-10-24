import type { PredictionResponse } from '../../types/prediction';

interface RiskOverviewProps {
  result: PredictionResponse;
}

/** Circular SVG donut gauge */
function Gauge({ pct, color }: { pct: number; color: string }) {
  const r    = 44;
  const circ = 2 * Math.PI * r;
  const filled = (Math.min(pct, 100) / 100) * circ;

  return (
    <svg viewBox="0 0 100 100" className="w-32 h-32" aria-hidden="true">
      <circle cx="50" cy="50" r={r} fill="none" stroke="#EAF2EC" strokeWidth="10" />
      <circle
        cx="50" cy="50" r={r}
        fill="none"
        stroke={color}
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={`${filled} ${circ}`}
        transform="rotate(-90 50 50)"
        style={{ transition: 'stroke-dasharray 0.8s ease' }}
      />
      <text x="50" y="47" textAnchor="middle" fontSize="16" fontWeight="700" fill={color}>
        {pct}%
      </text>
      <text x="50" y="60" textAnchor="middle" fontSize="7" fill="#6B7D72">
        10-year risk
      </text>
    </svg>
  );
}

export default function RiskOverview({ result }: RiskOverviewProps) {
  if (result.risk_score === null || result.risk_label === null) return null;

  const pct = Math.round(result.risk_score * 100);

  const { color, badge, desc } =
    pct <= 15
      ? { color: '#3D7A5A', badge: 'badge-low',      desc: 'Low Risk'      }
    : pct <= 30
      ? { color: '#D97706', badge: 'badge-moderate',  desc: 'Moderate Risk' }
      : { color: '#DC2626', badge: 'badge-high',       desc: 'High Risk'     };

  return (
    <div className="card p-6 flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-4">

      {/* Gauge */}
      <Gauge pct={pct} color={color} />

      {/* Details */}
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <span className={badge}>{desc}</span>
        </div>
        <p className="text-sm text-brand-muted leading-relaxed mb-3">
          Your predicted risk of heart disease in the next 10 years is <strong>{pct}%</strong>.
          This suggests you have a {desc.toLowerCase()} compared to the average person
          ({result.threshold ? `>{(result.threshold * 100).toFixed(1)}%` : '>16.8%'} is this dataset).
          Consider lifestyle changes and regular checkups.
        </p>
        {result.threshold !== null && (
          <p className="text-xs text-brand-muted">
            Classification threshold: {(result.threshold * 100).toFixed(1)}% (OOF F1-optimal, research use only)
          </p>
        )}
      </div>
    </div>
  );
}
