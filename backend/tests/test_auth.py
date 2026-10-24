"""
Tests for authentication and JWT verification.

Run with:
    cd backend
    pytest tests/test_auth.py -v
"""

import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock

from app.main import app

client = TestClient(app)


# ── No token ──────────────────────────────────────────────────────────────────

def test_predict_no_token_returns_403():
    """Requests without Authorization header must be rejected."""
    resp = client.post("/api/predict", json={})
    assert resp.status_code == 403


def test_assessments_no_token_returns_403():
    """GET /api/assessments without a token must be rejected."""
    resp = client.get("/api/assessments")
    assert resp.status_code == 403


# ── Invalid / malformed token ─────────────────────────────────────────────────

def test_predict_invalid_token_returns_401():
    """A garbage token string should result in 401 Unauthorized."""
    with patch("app.core.security._verify_via_jwt", return_value=None), \
         patch("app.core.security._verify_via_supabase_api") as mock_api:
        mock_api.side_effect = __import__(
            "fastapi", fromlist=["HTTPException"]
        ).HTTPException(status_code=401, detail="Invalid token.")
        resp = client.post(
            "/api/predict",
            json={},
            headers={"Authorization": "Bearer not-a-real-jwt"},
        )
    assert resp.status_code == 401


# ── Token missing 'sub' claim ─────────────────────────────────────────────────

def test_missing_sub_returns_401():
    """A token that decodes but has no 'sub' field must be rejected."""
    with patch("app.core.security.verify_token", return_value={"email": "x@x.com"}):
        resp = client.get(
            "/api/assessments",
            headers={"Authorization": "Bearer fake-token"},
        )
    assert resp.status_code == 401


# ── Valid token path ──────────────────────────────────────────────────────────

def test_valid_token_reaches_endpoint():
    """A valid JWT payload should pass the auth layer and reach the handler."""
    valid_payload = {"sub": "user-uuid-abc123", "email": "user@example.com"}

    with patch("app.core.security.verify_token", return_value=valid_payload), \
         patch("app.services.assessment_service.get_assessments_for_user",
               return_value=[]):
        resp = client.get(
            "/api/assessments",
            headers={"Authorization": "Bearer valid-mock-token"},
        )
    # 200 OK — the auth layer passed and the handler returned an empty list
    assert resp.status_code == 200
    assert resp.json() == []


# ── Health check (no auth required) ──────────────────────────────────────────

def test_health_does_not_require_auth():
    """GET /api/health must be publicly accessible."""
    resp = client.get("/api/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"


# ── Local JWT verification unit tests ─────────────────────────────────────────

class TestVerifyViaJwt:
    """Unit tests for the local HS256 verification helper."""

    def test_returns_none_when_no_secret_configured(self):
        from app.core import security
        with patch.object(security, "SUPABASE_JWT_SECRET", ""):
            result = security._verify_via_jwt("any-token")
        assert result is None

    def test_returns_none_for_invalid_token(self):
        from app.core import security
        with patch.object(security, "SUPABASE_JWT_SECRET", "test-secret"):
            result = security._verify_via_jwt("definitely-not-a-jwt")
        assert result is None

    def test_returns_payload_for_valid_token(self):
        """Signs a real HS256 token and verifies it decodes correctly."""
        import jwt as pyjwt
        from app.core import security

        secret  = "test-secret-key"
        payload = {"sub": "user-123", "email": "test@example.com"}
        token   = pyjwt.encode(payload, secret, algorithm="HS256")

        with patch.object(security, "SUPABASE_JWT_SECRET", secret):
            result = security._verify_via_jwt(token)

        assert result is not None
        assert result["sub"] == "user-123"
