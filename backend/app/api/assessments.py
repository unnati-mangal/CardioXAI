"""GET /api/assessments and GET /api/assessments/{id} — history endpoints."""

import logging

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.security import get_user_id
from app.schemas.assessment_schema import AssessmentOut
from app.services.assessment_service import get_assessment_by_id, get_assessments_for_user

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get(
    "/assessments",
    response_model=list[AssessmentOut],
    summary="List assessments for the authenticated user",
)
def list_assessments(
    user_id: str = Depends(get_user_id),
) -> list[AssessmentOut]:
    rows = get_assessments_for_user(user_id)
    return [AssessmentOut(**r) for r in rows]


@router.get(
    "/assessments/{assessment_id}",
    response_model=AssessmentOut,
    summary="Get a single assessment (must belong to the authenticated user)",
)
def get_assessment(
    assessment_id: int,
    user_id: str = Depends(get_user_id),
) -> AssessmentOut:
    row = get_assessment_by_id(assessment_id, user_id)
    if row is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assessment not found.",
        )
    return AssessmentOut(**row)
