import { useNavigate } from 'react-router-dom';
import { Info, Download } from 'lucide-react';
import type { PredictionResponse, PredictionInput } from '../../types/prediction';
import RiskOverview from './RiskOverview';
import ShapExplanation from './ShapExplanation';
import LimeExplanation from './LimeExplanation';
import PlainEnglishExplanation from './PlainEnglishExplanation';
import { downloadReport } from '../../utils/reportDownload';

interface PredictionResultProps {
  result:          PredictionResponse;
  input:           PredictionInput;
  onNewPrediction: () => void;
}

export default function PredictionResult({ result, input, onNewPrediction }: PredictionResultProps) {
  const navigate  = useNavigate();
  const isStub    = result.status === 'ml_not_ready';
  const hasResult = result.risk_score !== null;

  return (
    <div className="flex flex-col gap-4">

      {/* ML not ready */}
      {isStub && (
        <div className="card flex items-start gap-3 p-5 text-sm">
          <Info className="w-4 h-4 text-brand-muted flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-brand-text mb-1">Inputs received — model not connected</p>
            <p className="text-brand-muted">{result.message}</p>
            <p className="mt-2 text-xs text-brand-muted">
              Place <code className="bg-brand-bg px-1 rounded">pipeline.joblib</code> in{' '}
              <code className="bg-brand-bg px-1 rounded">model/artifacts/</code> and restart the backend.
            </p>
          </div>
        </div>
      )}

      {/* Risk gauge */}
      {hasResult && <RiskOverview result={result} />}

      {/* SHAP + "What This Means" side by side */}
      {hasResult && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          <ShapExplanation values={result.shap_values} />

          <div className="card p-5 flex flex-col gap-4">
            <div>
              <h3 className="font-semibold text-brand-text text-sm mb-2">What This Means</h3>
              <ul className="text-xs text-brand-muted space-y-2 list-none">
                {[
                  'High blood pressure and elevated cholesterol levels increase risk.',
                  'Physical activity and lower BMI help reduce your risk.',
                  'These are model insights only — consult a professional for medical advice.',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-brand-green mt-0.5">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-brand-text text-sm mb-2">Next Steps</h4>
              <ul className="text-xs text-brand-muted space-y-2">
                {[
                  'Consider lifestyle changes.',
                  'Monitor your health regularly.',
                  'Consult a healthcare professional.',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-brand-green mt-0.5">→</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* LIME explanation */}
      {hasResult && result.lime_values.length > 0 && (
        <LimeExplanation values={result.lime_values} />
      )}

      {/* Plain-English explanation + recommendations */}
      {hasResult && (
        <PlainEnglishExplanation result={result} input={input} />
      )}

      {/* Actions */}
      <div className="flex gap-3 flex-wrap">
        <button onClick={onNewPrediction} className="btn-primary">
          + New Prediction
        </button>
        <button onClick={() => navigate('/dashboard')} className="btn-outline">
          Back to Dashboard
        </button>
        {hasResult && (
          <button
            onClick={() => downloadReport(result, input)}
            className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold
                       border border-brand-border bg-white text-brand-text
                       hover:bg-brand-bg transition-colors"
          >
            <Download className="w-4 h-4" />
            Download Report
          </button>
        )}
      </div>

      <p className="text-xs text-brand-muted text-center">
        ⚠️ This tool is for research purposes only and not a medical diagnosis.
      </p>

    </div>
  );
}
