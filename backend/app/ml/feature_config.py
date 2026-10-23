"""
Feature configuration — single source of truth for the 13 Framingham features.

This file defines:
  - The CSV column names used during training (TRAINING_FEATURE_ORDER)
  - The mapping from frontend snake_case field names → training column names
  - Input validation bounds used in the Pydantic schema

Never change the order or names here without retraining the model.
"""

from typing import Final

# ── Ordered feature list (must match the pipeline's training column order) ────
TRAINING_FEATURE_ORDER: Final[list[str]] = [
    "age",
    "male",            # frontend field: sex  (0=Female, 1=Male)
    "cigsPerDay",      # frontend field: cigs_per_day
    "BPMeds",          # frontend field: bp_meds
    "prevalentStroke", # frontend field: prevalent_stroke
    "prevalentHyp",    # frontend field: prevalent_hyp
    "diabetes",
    "totChol",         # frontend field: tot_chol
    "sysBP",           # frontend field: sys_bp
    "diaBP",           # frontend field: dia_bp
    "BMI",             # frontend field: bmi
    "heartRate",       # frontend field: heart_rate
    "glucose",
]

# ── Frontend → training column mapping ────────────────────────────────────────
FRONTEND_TO_TRAINING: Final[dict[str, str]] = {
    "age":              "age",
    "sex":              "male",
    "cigs_per_day":     "cigsPerDay",
    "bp_meds":          "BPMeds",
    "prevalent_stroke": "prevalentStroke",
    "prevalent_hyp":    "prevalentHyp",
    "diabetes":         "diabetes",
    "tot_chol":         "totChol",
    "sys_bp":           "sysBP",
    "dia_bp":           "diaBP",
    "bmi":              "BMI",
    "heart_rate":       "heartRate",
    "glucose":          "glucose",
}

# ── Human-readable display labels (for SHAP / LIME output) ───────────────────
FEATURE_DISPLAY_LABELS: Final[dict[str, str]] = {
    "age":              "Age (years)",
    "male":             "Biological Sex (Male)",
    "cigsPerDay":       "Cigarettes per Day",
    "BPMeds":           "BP Medication",
    "prevalentStroke":  "History of Stroke",
    "prevalentHyp":     "Prevalent Hypertension",
    "diabetes":         "Diabetes",
    "totChol":          "Total Cholesterol (mg/dL)",
    "sysBP":            "Systolic BP (mmHg)",
    "diaBP":            "Diastolic BP (mmHg)",
    "BMI":              "BMI",
    "heartRate":        "Heart Rate (bpm)",
    "glucose":          "Glucose (mg/dL)",
}
