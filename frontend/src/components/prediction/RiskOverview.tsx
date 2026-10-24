import type { PredictionResponse } from '../../types/prediction';

interface RiskOverviewProps {
  result: PredictionResponse;
}

/** Circular SVG gauge — radius 42, stroke-dasharray trick */
function Gauge({ pct }: { pct: number }) {
  const r = 42;
  const circ = 2 * Math.PI * r;
  const filled = (Math.min(pct, 100) / 100) * circ;

  // Colour: ≤15% sage-green, ≤30% amber, >30% coral
  const stroke =
    pct <= 15 ? '#397653' :
    pct <= 30 ? '#D97706' :
               '#E88E84';

  return (
    <svg viewBox="0 0 100 100" className="w-28 h-28" aria-hidden="true">
      {/* Track */}
      <circle cx="50" cy="50" r={r} fill="none" stroke="#E4E8E0" strokeWidth="10" />
      {/* Fill — rotate so 0% starts at top */}
      <circle
        cx="50" cy="50" r={r}
        fill="none"
        stroke={stroke}
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={`${filled} ${circ}`}
        transform="rotate(-90 50 50)"
        style={{ transition: 'stroke-dasharray 0.7s ease' }}
      />
      {/* Percentage text */}
      <text x="50" y="54" textAnchor="middle" fontSize="18" fontWeight="700" fill={stroke}>
        {pct}%
      </text>
    </svg>
  );
}

export default function RiskOverview({ result }: RiskOverviewProps) {
  if (result.risk_score === null || result.risk_label === null) return null;

  const pct = Math.round(result.risk_score * 100);

  const labelStyle =
    pct <= 15 ? 'bg-[#DDE9DD] text-[#24573D]' :
    pct <= 30 ? 'bg-amber-50 text-amber-700' :
               'bg-[#F9E6E2] text-[#E88E84]';

  return (
    <div className="bg-white rounded-2xl border border-neutral-100 p-6">
      <h2 className="font-semibold text-neutral-800 mb-5">Your Prediction Results</h2>

      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">

        {/* Gauge */}
        <Gauge pct={pct} />

        {/* Details */}
        <div className="flex-1 flex flex-col gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-3xl font-bold text-[#253638]">{pct}%</span>
            <span className={`text-sm font-semibold px-3 py-1 rounded-full ${labelStyle}`}>
              {result.risk_label}
            </span>
          </div>

          <p className="text-sm text-[#687876] leading-relaxed">
            Estimated 10-year coronary heart disease risk based on the Framingham
            logistic regression model. This is a research estimate — not a clinical diagnosis.
          </p>

          {result.threshold !== null && (
            <p className="text-xs text-neutral-400">
              Classification threshold: <strong>{(result.threshold * 100).toFixed(1)}%</strong>{' '}
              (out-of-fold F1-optimal, research use only).
            </p>
          )}

          {result.model_version && (
            <p className="text-xs text-neutral-300">Model v{result.model_version}</p>
          )}
        </div>
      </div>
    </div>
  );
}
