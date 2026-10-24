/**
 * Types for the prediction workflow.
 * Input fields match the 13 Framingham Heart Study features used by the model.
 * Response fields match backend/app/schemas/prediction_schema.py.
 */

/** All clinical input fields required by the Framingham logistic regression model */
export interface PredictionInput {
  age:              number;   // years, 20–80
  sex:              number;   // 0 = Female, 1 = Male
  cigs_per_day:     number;   // cigarettes per day, 0–60
  bp_meds:          boolean;  // currently on blood pressure medication
  prevalent_stroke: boolean;  // history of stroke
  prevalent_hyp:    boolean;  // prevalent hypertension
  diabetes:         boolean;  // diabetes diagnosis
  tot_chol:         number;   // total cholesterol mg/dL, 100–600
  sys_bp:           number;   // systolic blood pressure mmHg, 80–250
  dia_bp:           number;   // diastolic blood pressure mmHg, 40–160
  bmi:              number;   // body mass index, 10–60
  heart_rate:       number;   // heart rate bpm, 40–150
  glucose:          number;   // glucose mg/dL, 40–500
}

/** One SHAP feature contribution entry returned by the backend */
export interface ShapEntry {
  feature:    string;
  label:      string;
  shap_value: number;
  direction:  'positive' | 'negative';
}

/** One LIME feature contribution entry returned by the backend */
export interface LimeEntry {
  feature:   string;
  label:     string;
  weight:    number;
  direction: 'positive' | 'negative';
  condition: string;  // e.g. "sysBP > 130"
}

/**
 * Backend response from POST /api/predict.
 *
 * status === "ml_not_ready" → pipeline artifact not yet generated.
 * status === "ok"           → full result with risk_score, shap_values, lime_values.
 */
export interface PredictionResponse {
  status:        string;
  message:       string;
  risk_score:    number | null;
  risk_label:    string | null;
  threshold:     number | null;
  model_version: string | null;
  assessment_id: number | null;
  shap_values:   ShapEntry[];
  lime_values:   LimeEntry[];
}

/** Blank form state — all fields at their neutral/default values */
export const EMPTY_PREDICTION_INPUT: PredictionInput = {
  age:              0,
  sex:              0,
  cigs_per_day:     0,
  bp_meds:          false,
  prevalent_stroke: false,
  prevalent_hyp:    false,
  diabetes:         false,
  tot_chol:         0,
  sys_bp:           0,
  dia_bp:           0,
  bmi:              0,
  heart_rate:       0,
  glucose:          0,
};
