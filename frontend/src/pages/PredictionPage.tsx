import { useState, useRef } from 'react';
import { AlertCircle } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import Disclaimer from '../components/common/Disclaimer';
import PredictionForm from '../components/prediction/PredictionForm';
import PredictionResult from '../components/prediction/PredictionResult';
import { submitPrediction } from '../services/predictionService';
import { ApiError } from '../services/api';
import type { PredictionInput, PredictionResponse } from '../types/prediction';

export default function PredictionPage() {
  const [result,    setResult]    = useState<PredictionResponse | null>(null);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const [formKey,   setFormKey]   = useState(0); // increment to reset form
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (input: PredictionInput) => {
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
      } else if (err instanceof Error) {
        setError(
          'Could not reach the backend server. ' +
          'Start the FastAPI server with: uvicorn app.main:app --reload',
        );
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleNewPrediction = () => {
    setResult(null);
    setError(null);
    setFormKey((k) => k + 1); // force PredictionForm to remount → resets all state
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-5 max-w-2xl">

        {/* Page header */}
        <div>
          <h1 className="text-xl font-bold text-[#253638]">Heart Disease Risk Assessment</h1>
          <p className="text-sm text-[#687876] mt-1">
            Enter your clinical measurements to estimate your 10-year cardiovascular risk
            using the Framingham logistic regression model.
          </p>
        </div>

        {/* Disclaimer — always visible above the form */}
        <Disclaimer />

        {/* Clinical input form — keyed so New Prediction fully resets it */}
        {!result && (
          <PredictionForm key={formKey} onSubmit={handleSubmit} loading={loading} />
        )}

        {/* Network / API error */}
        {error && (
          <div className="flex items-start gap-3 bg-white rounded-2xl border border-[#E88E84]/30 p-5 text-sm">
            <AlertCircle className="w-4 h-4 text-[#E88E84] flex-shrink-0 mt-0.5" />
            <p className="text-neutral-700">{error}</p>
          </div>
        )}

        {/* Results section — rendered after a successful API response */}
        {result && (
          <div ref={resultsRef} id="prediction-results">
            <PredictionResult
              result={result}
              onNewPrediction={handleNewPrediction}
            />
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
