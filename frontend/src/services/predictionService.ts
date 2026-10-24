import { apiFetch } from './api';
import type { PredictionInput, PredictionResponse } from '../types/prediction';

/**
 * Submit a prediction request to the backend.
 *
 * Backend integration point: POST /api/predict
 * Until the ML model is connected, the backend returns:
 *   { status: "ml_not_ready", message: "...", risk_score: null, risk_label: null }
 *
 * When the model is connected, risk_score and risk_label will be populated.
 */
export async function submitPrediction(
  input: PredictionInput,
): Promise<PredictionResponse> {
  return apiFetch<PredictionResponse>('/api/predict', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}
