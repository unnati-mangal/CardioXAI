import { Microscope } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ReferenceLine, ResponsiveContainer, Cell,
} from 'recharts';
import type { LimeEntry } from '../../types/prediction';

interface LimeExplanationProps {
  values: LimeEntry[];
}

const POSITIVE_COLOR = '#E88E84'; // muted-coral — locally increases probability
const NEGATIVE_COLOR = '#7C9A7E'; // sage-green  — locally decreases probability

export default function LimeExplanation({ values }: LimeExplanationProps) {
  if (!values || values.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-neutral-100 border-dashed p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg bg-[#F9E6E2] flex items-center justify-center flex-shrink-0">
            <Microscope className="w-4 h-4 text-[#E88E84]" />
          </div>
          <h3 className="font-semibold text-neutral-700">Local Explanation — LIME</h3>
        </div>
        <p className="text-sm text-neutral-400">
          LIME values were not returned. Ensure the ML pipeline is loaded and restart the backend.
        </p>
      </div>
    );
  }

  // Show top 10 by absolute weight
  const top = values.slice(0, 10);

  const chartData = top.map((e) => ({
    label: e.label,
    condition: e.condition,
    value: e.weight,
  }));

  return (
    <div className="bg-white rounded-2xl border border-neutral-100 p-6">

      <div className="flex items-center gap-3 mb-1">
        <div className="w-8 h-8 rounded-lg bg-[#F9E6E2] flex items-center justify-center flex-shrink-0">
          <Microscope className="w-4 h-4 text-[#E88E84]" />
        </div>
        <h3 className="font-semibold text-neutral-700">Local Explanation — LIME</h3>
      </div>

      <p className="text-xs text-neutral-400 mb-4 ml-11">
        LIME approximates the model locally around your submitted values. Weights are in
        probability space. This explanation is specific to your inputs, not a global rule.
      </p>

      {/* Legend */}
      <div className="flex gap-4 mb-4 text-xs text-neutral-500">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm" style={{ background: POSITIVE_COLOR }} />
          Locally increases probability
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm" style={{ background: NEGATIVE_COLOR }} />
          Locally decreases probability
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
            formatter={(v, _name, props) => [
              typeof v === 'number' ? v.toFixed(4) : String(v),
              (props.payload as { condition?: string })?.condition || 'LIME weight',
            ]}
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
