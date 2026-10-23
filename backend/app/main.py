"""CardioXAI FastAPI application entry point."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.prediction import router as prediction_router
from app.api.assessments import router as assessments_router
from app.core.config import CORS_ORIGINS
from app.core.logging_config import configure_logging

configure_logging()

app = FastAPI(
    title="CardioXAI API",
    version="1.0.0",
    description=(
        "Research prototype — Framingham Heart Study logistic regression "
        "with SHAP and LIME explainability. Not a clinical diagnostic tool."
    ),
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

# ── Routes — include each sub-router directly so FastAPI resolves all paths ───
app.include_router(prediction_router,  prefix="/api", tags=["prediction"])
app.include_router(assessments_router, prefix="/api", tags=["assessments"])


@app.get("/api/health", tags=["health"], summary="Backend health check")
def health() -> dict:
    """Returns model readiness status alongside the basic health check."""
    model_ready   = False
    model_version = "unavailable"
    try:
        from app.ml.model_loader import get_pipeline, get_model_version
        get_pipeline()
        model_ready   = True
        model_version = get_model_version()
    except Exception:
        pass

    return {
        "status":        "ok",
        "model_ready":   model_ready,
        "model_version": model_version,
    }
