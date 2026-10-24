"""
Tests for the POST /api/predict endpoint.

Run with:
    cd backend
    pytest tests/test_prediction.py -v
"""

import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock

from app.main import app

client = TestClient(app)

# ── Shared fixtures ────────────────────────────────────────────────────────────

VALID_PAYLOAD = {
    "age": 52,
    "sex": 1,
    "cigs_per_day": 10,
    "bp_meds": False,
    "prevalent_stroke": False,
    "prevalent_hyp": True,
    "diabetes": False,
    "tot_chol": 230,
    "sys_bp": 140,
    "dia_bp": 90,
    "bmi": 27.5,
    "heart_rate": 75,
    "glucose": 95,
}

MOCK_JWT_PAYLOAD = {"sub": "test-user-uuid-1234", "email": "test@example.com"}


def _auth_headers():
    return {"Authorization": "Bearer fake-test-token"}


# ── Unauthenticated requests ───────────────────────────────────────────────────

def test_predict_requires_auth():
    """POST /api/predict without a token should return 403."""
    resp = client.post("/api/predict", json=VALID_PAYLOAD)
    assert resp.status_code == 403


# ── Input validation ──────────────────────────────────────────────────────────

@patch("app.core.security.verify_token", return_value=MOCK_JWT_PAYLOAD)
def test_predict_rejects_age_out_of_range(mock_verify):
    payload = {**VALID_PAYLOAD, "age": 10}  # below minimum 20
    resp = client.post("/api/predict", json=payload, headers=_auth_headers())
    assert resp.status_code == 422


@patch("app.core.security.verify_token", return_value=MOCK_JWT_PAYLOAD)
def test_predict_rejects_invalid_sex(mock_verify):
    payload = {**VALID_PAYLOAD, "sex": 5}  # must be 0 or 1
    resp = client.post("/api/predict", json=payload, headers=_auth_headers())
    assert resp.status_code == 422


@patch("app.core.security.verify_token", return_value=MOCK_JWT_PAYLOAD)
def test_predict_rejects_missing_field(mock_verify):
    payload = {k: v for k, v in VALID_PAYLOAD.items() if k != "glucose"}
    resp = client.post("/api/predict", json=payload, headers=_auth_headers())
    assert resp.status_code == 422


# ── ml_not_ready behaviour (no pipeline.joblib) ───────────────────────────────

@patch("app.core.security.verify_token", return_value=MOCK_JWT_PAYLOAD)
@patch("app.services.assessment_service.save_assessment", return_value=99)
@patch("app.services.prediction_service.run_prediction")
def test_predict_returns_ml_not_ready_when_model_missing(
    mock_run, mock_save, mock_verify
):
    """When the ML model is unavailable the endpoint should return 200 with
    status='ml_not_ready' rather than crashing."""
    from app.schemas.prediction_schema import PredictionResponse
    mock_run.return_value = PredictionResponse(
        status="ml_not_ready",
        message="Model not loaded.",
        risk_score=None,
        shap_values=[],
        lime_values=[],
    )
    resp = client.post("/api/predict", json=VALID_PAYLOAD, headers=_auth_headers())
    assert resp.status_code == 200
    body = resp.json()
    assert body["status"] == "ml_not_ready"
    assert body["risk_score"] is None
    assert body["shap_values"] == []


# ── Successful prediction ─────────────────────────────────────────────────────

@patch("app.core.security.verify_token", return_value=MOCK_JWT_PAYLOAD)
@patch("app.services.assessment_service.save_assessment", return_value=42)
@patch("app.services.prediction_service.run_prediction")
def test_predict_success_shape(mock_run, mock_save, mock_verify):
    """A successful prediction should return risk_score + shap_values + lime_values."""
    from app.schemas.prediction_schema import PredictionResponse, ShapEntry, LimeEntry
    mock_run.return_value = PredictionResponse(
        status="ok",
        message="Prediction complete.",
        risk_score=0.213,
        risk_label="Elevated Risk",
        threshold=0.1684,
        model_version="1.0.0",
        assessment_id=42,
        shap_values=[
            ShapEntry(feature="sysBP", label="Systolic BP",
                      shap_value=0.08, direction="positive"),
        ],
        lime_values=[
            LimeEntry(feature="sysBP", label="Systolic BP",
                      weight=0.06, direction="positive", condition="sysBP > 130"),
        ],
    )
    resp = client.post("/api/predict", json=VALID_PAYLOAD, headers=_auth_headers())
    assert resp.status_code == 200
    body = resp.json()
    assert body["status"] == "ok"
    assert isinstance(body["risk_score"], float)
    assert 0.0 <= body["risk_score"] <= 1.0
    assert len(body["shap_values"]) > 0
    assert len(body["lime_values"]) > 0
    assert "feature" in body["shap_values"][0]
    assert "condition" in body["lime_values"][0]


# ── Health check (no auth needed) ─────────────────────────────────────────────

def test_health_check():
    resp = client.get("/api/health")
    assert resp.status_code == 200
    body = resp.json()
    assert body["status"] == "ok"
    assert "model_ready" in body
