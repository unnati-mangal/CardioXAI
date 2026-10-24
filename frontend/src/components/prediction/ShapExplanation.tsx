import { FlaskConical } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ReferenceLine, ResponsiveContainer, Cell,
} from 'recharts';
import type { ShapEntry } from '../../types/prediction';

interface ShapExplanationProps {
  values: ShapEntry[];
}

const POSITIVE_COLOR = '#397653'; // forest-green — pushes risk up
const NEGATIVE_COLOR = '#7C9A7E'; // sage-green   — pushes risk down

export default function ShapExplanation({ values }: ShapExplanationProps) {
  if (!values || values.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-neutral-100 border-dashed p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg bg-[#DDE9DD] flex items-center justify-center flex-shrink-0">
            <FlaskConical className="w-4 h-4 text-[#397653]" />
          </div>
          <h3 className="font-semibold text-neutral-700">What Influenced This Prediction?</h3>
        </div>
        <p className="text-sm text-neutral-400">
          SHAP values were not returned. Ensure the ML pipeline is loaded and restart the backend.
        </p>
      </div>
    );
  }

  // Show top 10 by absolute value
  const top = values.slice(0, 10);

  const chartData = top.map((e) => ({
    label: e.label,
    value: e.shap_value,
  }));

  return (
    <div className="bg-white rounded-2xl border border-neutral-100 p-6">

      <div className="flex items-center gap-3 mb-1">
        <div className="w-8 h-8 rounded-lg bg-[#DDE9DD] flex items-center justify-center flex-shrink-0">
          <FlaskConical className="w-4 h-4 text-[#397653]" />
        </div>
        <h3 className="font-semibold text-neutral-700">What Influenced This Prediction?</h3>
      </div>

      <p className="text-xs text-neutral-400 mb-4 ml-11">
        SHAP contributions in log-odds space. Positive bars increase the model score;
        negative bars reduce it. SHAP describes model behaviour — not medical causation.
      </p>

      {/* Legend */}
      <div className="flex gap-4 mb-4 text-xs text-neutral-500">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm" style={{ background: POSITIVE_COLOR }} />
          Increases risk score
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm" style={{ background: NEGATIVE_COLOR }} />
          Decreases risk score
        </span>
      </div>

      <ResponsiveContainer width="100%" height={Math.max(220, top.length * 28)}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 0, right: 24, left: 8, bottom: 0 }}
        >
          <XAxis
            type="number"
            tick={{ fontSize: 11, fill: '#687876' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            type="category"
            dataKey="label"
            width={160}
            tick={{ fontSize: 11, fill: '#253638' }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            formatter={(v) => [typeof v === 'number' ? v.toFixed(4) : String(v), 'SHAP (log-odds)']}
            contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E4E8E0' }}
          />
          <ReferenceLine x={0} stroke="#E4E8E0" />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {chartData.map((entry, i) => (
              <Cell
                key={i}
                fill={entry.value >= 0 ? POSITIVE_COLOR : NEGATIVE_COLOR}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

    </div>
  );
}
