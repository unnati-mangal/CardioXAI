import { useNavigate } from 'react-router-dom';
import { Info } from 'lucide-react';
import type { PredictionResponse } from '../../types/prediction';
import RiskOverview from './RiskOverview';
import ShapExplanation from './ShapExplanation';
import LimeExplanation from './LimeExplanation';
import Button from '../common/Button';

interface PredictionResultProps {
  result: PredictionResponse;
  onNewPrediction: () => void;
}

export default function PredictionResult({ result, onNewPrediction }: PredictionResultProps) {
  const navigate  = useNavigate();
  const isStub    = result.status === 'ml_not_ready';
  const hasResult = result.risk_score !== null;

  return (
    <div className="flex flex-col gap-4">

      {/* ── ML not ready notice ─────────────────────────────── */}
      {isStub && (
        <div className="flex items-start gap-3 bg-white rounded-2xl border border-neutral-100 p-5 text-sm">
          <Info className="w-4 h-4 text-neutral-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-neutral-700 mb-1">Inputs received — model not yet connected</p>
            <p className="text-neutral-500">{result.message}</p>
            <p className="mt-2 text-xs text-neutral-400">
              Place <code className="bg-neutral-100 px-1 rounded">pipeline.joblib</code> in{' '}
              <code className="bg-neutral-100 px-1 rounded">model/artifacts/</code> and restart the backend.
            </p>
          </div>
        </div>
      )}

      {/* ── Risk overview ────────────────────────────────────── */}
      {hasResult && <RiskOverview result={result} />}

      {/* ── SHAP chart ───────────────────────────────────────── */}
      {hasResult && <ShapExplanation values={result.shap_values} />}

      {/* ── LIME chart ───────────────────────────────────────── */}
      {hasResult && <LimeExplanation values={result.lime_values} />}

      {/* ── What this means ─────────────────────────────────── */}
      {hasResult && (
        <div className="bg-white rounded-2xl border border-neutral-100 p-5 text-sm text-neutral-500 leading-relaxed">
          <p className="font-medium text-neutral-700 mb-2">Understanding this result</p>
          <ul className="list-disc list-inside space-y-1.5">
            <li>The percentage is the model's estimated probability for 10-year coronary heart disease risk based on the Framingham study cohort.</li>
            <li>Feature contributions describe model behaviour, not proof of medical causation.</li>
            <li>This result does not confirm whether you currently have heart disease.</li>
            <li>Consult a qualified healthcare professional for medical interpretation.</li>
          </ul>
        </div>
      )}

      {/* ── Actions ─────────────────────────────────────────── */}
      <div className="flex gap-3 flex-wrap">
        <Button variant="primary" onClick={onNewPrediction}>
          New Prediction
        </Button>
        <Button variant="secondary" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </Button>
      </div>

    </div>
  );
}
