"""Central router — registers all API sub-routers."""

from fastapi import APIRouter

from app.api.prediction import router as prediction_router
from app.api.assessments import router as assessments_router

router = APIRouter()

router.include_router(prediction_router)
router.include_router(assessments_router)
