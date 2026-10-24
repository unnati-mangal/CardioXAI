"""POST /api/predict — prediction endpoint."""

import logging

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.security import get_user_id
from app.schemas.prediction_schema import PredictionInput, PredictionResponse
from app.services.assessment_service import save_assessment
from app.services.prediction_service import run_prediction

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post(
    "/predict",
    response_model=PredictionResponse,
    summary="Run heart disease risk prediction",
)
def predict(
    inp: PredictionInput,
    user_id: str = Depends(get_user_id),
) -> PredictionResponse:
    """
    Validate the 13 Framingham inputs, run the ML pipeline (if available),
    save the assessment to Supabase, and return the risk score + explanations.
    """
    is_stub = False
    assessment_id = None

    try:
        # Save a stub row first so we have an id even if inference fails
        assessment_id = save_assessment(
            user_id=user_id,
            input_dict=inp.model_dump(),
            risk_score=None,
            risk_label=None,
            model_version=None,
            threshold_used=None,
            is_stub=True,
        )

        result = run_prediction(inp, user_id=user_id, assessment_id=assessment_id)
        is_stub = result.status == "ml_not_ready"

        # Update the saved row with actual result if ML succeeded
        if not is_stub and assessment_id is not None:
            # Re-save with full result (Supabase PATCH)
            try:
                import httpx
                from app.core.config import SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
                headers = {
                    "apikey":        SUPABASE_SERVICE_ROLE_KEY,
                    "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
                    "Content-Type":  "application/json",
                    "Prefer":        "return=minimal",
                }
                with httpx.Client(timeout=10) as client:
                    client.patch(
                        f"{SUPABASE_URL}/rest/v1/assessments",
                        params={"id": f"eq.{assessment_id}"},
                        json={
                            "prediction_probability": result.risk_score,
                            "prediction_label":       result.risk_label,
                            "model_version":          result.model_version,
                            "threshold_used":         result.threshold,
                            "is_stub":                False,
                        },
                        headers=headers,
                    )
            except Exception as patch_exc:
                logger.warning("Could not update assessment row: %s", patch_exc)

        result.assessment_id = assessment_id
        return result

    except Exception as exc:
        logger.error("Prediction endpoint error: %s", exc, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred during prediction. Please try again.",
        )
