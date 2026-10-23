"""
Prediction service — orchestrates inference and explanation.

If the ML model is not loaded (pipeline.joblib missing), returns a stub
response with status='ml_not_ready' so the frontend shows a clear message
rather than a 500 error.
"""

import logging
from typing import Optional

from app.schemas.prediction_schema import PredictionInput, PredictionResponse

logger = logging.getLogger(__name__)


def run_prediction(
    inp: PredictionInput,
    user_id: Optional[str] = None,
    assessment_id: Optional[int] = None,
) -> PredictionResponse:
    """
    Run prediction pipeline for a validated input.

    Tries to import and use model_loader + preprocessing + explainers.
    On any failure (model not ready, import error), returns a stub response.
    """
    try:
        from app.ml.model_loader import (
            ModelNotReadyError,
            get_pipeline,
            get_threshold,
            get_positive_class_index,
            get_model_version,
        )
        from app.ml.preprocessing import input_to_dataframe
        from app.ml.shap_explainer import compute_shap
        from app.ml.lime_explainer import compute_lime
    except ImportError as exc:
        logger.warning("ML modules not importable: %s", exc)
        return PredictionResponse(
            status="ml_not_ready",
            message="ML dependencies are not installed. Install requirements.txt and restart.",
            assessment_id=assessment_id,
        )

    # ── Load pipeline ─────────────────────────────────────────────────────────
    try:
        pipeline = get_pipeline()
    except ModelNotReadyError as exc:
        logger.info("Model not ready: %s", exc)
        return PredictionResponse(
            status="ml_not_ready",
            message=str(exc),
            assessment_id=assessment_id,
        )

    # ── Build input DataFrame ─────────────────────────────────────────────────
    input_dict = inp.model_dump()
    df = input_to_dataframe(input_dict)

    # ── Inference ─────────────────────────────────────────────────────────────
    pos_idx   = get_positive_class_index()
    proba_row = pipeline.predict_proba(df)[0]
    risk_score = float(proba_row[pos_idx])

    threshold     = get_threshold()
    model_version = get_model_version()
    risk_label    = "Elevated Risk" if risk_score >= threshold else "Low Risk"

    # ── Explanations ──────────────────────────────────────────────────────────
    shap_vals = compute_shap(pipeline, df)
    lime_vals = compute_lime(pipeline, df)

    from app.schemas.prediction_schema import ShapEntry, LimeEntry

    return PredictionResponse(
        status="ok",
        message="Prediction generated successfully.",
        risk_score=round(risk_score, 4),
        risk_label=risk_label,
        threshold=threshold,
        model_version=model_version,
        assessment_id=assessment_id,
        shap_values=[ShapEntry(**s) for s in shap_vals],
        lime_values=[LimeEntry(**l) for l in lime_vals],
    )
