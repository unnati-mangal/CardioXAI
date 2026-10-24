import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ReferenceLine, ResponsiveContainer, Cell,
} from 'recharts';
import type { LimeEntry } from '../../types/prediction';

interface LimeExplanationProps {
  values: LimeEntry[];
}

const POS = '#DC2626';
const NEG = '#3D7A5A';

export default function LimeExplanation({ values }: LimeExplanationProps) {
  if (!values || values.length === 0) {
    return (
      <div className="card p-5 border-dashed">
        <p className="text-sm text-brand-muted text-center">
          LIME values not available. Place model artifacts and restart the backend.
        </p>
      </div>
    );
  }

  const top = values.slice(0, 8);
  const chartData = top.map((e) => ({ label: e.label, condition: e.condition, value: e.weight }));

  return (
    <div className="card p-5">
      <h3 className="font-semibold text-brand-text text-sm mb-1">LIME Explanation</h3>
      <p className="text-xs text-brand-muted mb-4">
        Local approximation around your inputs. Weights are in probability space.
      </p>

      <div className="flex gap-4 mb-3 text-xs text-brand-muted">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-2 rounded-sm" style={{ background: POS }} />
          Increases probability
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-2 rounded-sm" style={{ background: NEG }} />
          Decreases probability
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
            formatter={(v, _n, p) => [
              typeof v === 'number' ? v.toFixed(4) : String(v),
              (p.payload as { condition?: string })?.condition || 'LIME',
            ]}
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
