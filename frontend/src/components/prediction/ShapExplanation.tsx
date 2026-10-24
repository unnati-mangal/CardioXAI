import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ReferenceLine, ResponsiveContainer, Cell,
} from 'recharts';
import type { ShapEntry } from '../../types/prediction';

interface ShapExplanationProps {
  values: ShapEntry[];
}

const POS = '#DC2626'; // red – increases risk
const NEG = '#3D7A5A'; // green – decreases risk

export default function ShapExplanation({ values }: ShapExplanationProps) {
  if (!values || values.length === 0) {
    return (
      <div className="card p-5 border-dashed">
        <p className="text-sm text-brand-muted text-center">
          SHAP values not available. Place model artifacts and restart the backend.
        </p>
      </div>
    );
  }

  const top = values.slice(0, 8);
  const chartData = top.map((e) => ({ label: e.label, value: e.shap_value }));

  return (
    <div className="card p-5">
      <h3 className="font-semibold text-brand-text text-sm mb-1">Top Factors (SHAP)</h3>
      <p className="text-xs text-brand-muted mb-4">
        Feature contributions in log-odds. Positive = increases risk; negative = decreases.
      </p>

      <div className="flex gap-4 mb-3 text-xs text-brand-muted">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-2 rounded-sm" style={{ background: POS }} />
          Increases risk
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-2 rounded-sm" style={{ background: NEG }} />
          Decreases risk
        </span>
      </div>

      <ResponsiveContainer width="100%" height={Math.max(180, top.length * 26)}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 0, right: 20, left: 4, bottom: 0 }}
        >
          <XAxis
            type="number"
            tick={{ fontSize: 10, fill: '#6B7D72' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            type="category"
            dataKey="label"
            width={120}
            tick={{ fontSize: 10, fill: '#1C2B22' }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            formatter={(v) => [typeof v === 'number' ? v.toFixed(4) : String(v), 'SHAP']}
            contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #DDE8DD' }}
          />
          <ReferenceLine x={0} stroke="#DDE8DD" />
          <Bar dataKey="value" radius={[0, 3, 3, 0]}>
            {chartData.map((entry, i) => (
              <Cell key={i} fill={entry.value >= 0 ? POS : NEG} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
