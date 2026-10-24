import { useState, useRef } from 'react';
import { AlertCircle, ShieldCheck, Brain, FileText, HeartPulse } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import PredictionForm from '../components/prediction/PredictionForm';
import PredictionResult from '../components/prediction/PredictionResult';
import { submitPrediction } from '../services/predictionService';
import { ApiError } from '../services/api';
import type { PredictionInput, PredictionResponse } from '../types/prediction';

const INFO_CARDS = [
  {
    icon: Brain,
    bg: 'bg-brand-green-light',
    color: 'text-brand-green',
    title: 'AI-Powered Analysis',
    text: 'Our model uses SHAP & LIME to explain every prediction — not just a number, but the reasons behind it.',
  },
  {
    icon: ShieldCheck,
    bg: 'bg-blue-50',
    color: 'text-blue-500',
    title: 'Framingham Validated',
    text: 'Built on the Framingham Heart Study — one of the most trusted cardiovascular datasets in history.',
  },
  {
    icon: FileText,
    bg: 'bg-amber-50',
    color: 'text-amber-500',
    title: 'Downloadable Report',
    text: 'After your prediction, download a full PDF report with your results, SHAP/LIME charts, and personalised recommendations.',
  },
  {
    icon: HeartPulse,
    bg: 'bg-red-50',
    color: 'text-red-400',
    title: '10-Year CHD Risk',
    text: 'The model estimates your probability of developing coronary heart disease over the next decade based on 13 clinical factors.',
  },
];

export default function PredictionPage() {
  const [result,    setResult]    = useState<PredictionResponse | null>(null);
  const [lastInput, setLastInput] = useState<PredictionInput | null>(null);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const [formKey,   setFormKey]   = useState(0);
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (input: PredictionInput) => {
    setLastInput(input);
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const response = await submitPrediction(input);
      setResult(response);
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          setError('Your session has expired. Please sign in again.');
        } else if (err.status === 422) {
          setError('One or more input values are invalid. Please check the form and try again.');
        } else {
          setError(`Backend error: ${err.message}`);
        }
      } else {
        setError('Could not reach the backend. Start the FastAPI server with: uvicorn app.main:app --reload');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleNewPrediction = () => {
    setResult(null);
    setError(null);
    setFormKey((k) => k + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <DashboardLayout>

      {/* ── Page header ── */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-text">Heart Disease Prediction</h1>
        <p className="text-sm text-brand-muted mt-1">
          Enter your details below to get a 10-year coronary heart disease risk estimate
          with AI-powered explanations.
        </p>
      </div>

      {/* ── Two-column layout when showing form ── */}
      {!result ? (
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6 items-start">

          {/* Left: form */}
          <div>
            <PredictionForm key={formKey} onSubmit={handleSubmit} loading={loading} />

            {error && (
              <div className="card flex items-start gap-3 p-4 mt-4 text-sm border-red-200">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-brand-muted">{error}</p>
              </div>
            )}
          </div>

          {/* Right: info sidebar */}
          <div className="flex flex-col gap-4">
            {/* Quick guide */}
            <div className="card p-5">
              <p className="text-xs font-bold text-brand-muted uppercase tracking-wide mb-4">
                About this tool
              </p>
              <div className="flex flex-col gap-4">
                {INFO_CARDS.map(({ icon: Icon, bg, color, title, text }) => (
                  <div key={title} className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}>
                      <Icon className={`w-4 h-4 ${color}`} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-brand-text">{title}</p>
                      <p className="text-xs text-brand-muted mt-0.5 leading-relaxed">{text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Input reference */}
            <div className="card p-5">
              <p className="text-xs font-bold text-brand-muted uppercase tracking-wide mb-3">
                Normal ranges
              </p>
              <div className="flex flex-col gap-2 text-xs">
                {[
                  ['Systolic BP',    '< 120 mmHg'],
                  ['Diastolic BP',   '< 80 mmHg'],
                  ['Total Chol.',    '< 200 mg/dL'],
                  ['Fasting Glucose','70–99 mg/dL'],
                  ['BMI',            '18.5–24.9'],
                  ['Heart Rate',     '60–100 bpm'],
                ].map(([label, range]) => (
                  <div key={label} className="flex items-center justify-between py-1.5 border-b border-brand-border last:border-0">
                    <span className="text-brand-muted">{label}</span>
                    <span className="font-semibold text-brand-green">{range}</span>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-xs text-brand-muted text-center leading-relaxed px-1">
              ⚠️ Research use only — not a medical diagnosis.
            </p>
          </div>
        </div>
      ) : (
        /* ── Result view (full width) ── */
        <div ref={resultsRef}>
          <PredictionResult
            result={result}
            input={lastInput!}
            onNewPrediction={handleNewPrediction}
          />
        </div>
      )}

    </DashboardLayout>
  );
}
