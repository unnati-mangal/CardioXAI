"""
Assessment service — saves and retrieves assessment records via Supabase REST API.

Uses the service-role key (server-side only, never exposed to the frontend)
to write rows, and relies on RLS to restrict reads to the authenticated user.

If Supabase is not configured, functions degrade gracefully so the prediction
endpoint still works without storing history.
"""

import logging
from typing import Optional

import httpx

from app.core.config import SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

logger = logging.getLogger(__name__)

_TABLE = "assessments"


def _headers() -> dict:
    return {
        "apikey":        SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
        "Content-Type":  "application/json",
        "Prefer":        "return=representation",
    }


def _configured() -> bool:
    return bool(SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY)


def save_assessment(
    user_id: str,
    input_dict: dict,
    risk_score: Optional[float],
    risk_label: Optional[str],
    model_version: Optional[str],
    threshold_used: Optional[float],
    is_stub: bool,
) -> Optional[int]:
    """
    Insert a new assessment row.  Returns the new row's id, or None on failure.
    Never raises — a save failure should not break the prediction response.
    """
    if not _configured():
        logger.info("Supabase not configured — assessment not saved.")
        return None

    payload = {
        "user_id":                user_id,
        "age":                    input_dict.get("age"),
        "sex":                    input_dict.get("sex"),
        "cigs_per_day":           input_dict.get("cigs_per_day"),
        "bp_meds":                input_dict.get("bp_meds"),
        "prevalent_stroke":       input_dict.get("prevalent_stroke"),
        "prevalent_hyp":          input_dict.get("prevalent_hyp"),
        "diabetes":               input_dict.get("diabetes"),
        "tot_chol":               input_dict.get("tot_chol"),
        "sys_bp":                 input_dict.get("sys_bp"),
        "dia_bp":                 input_dict.get("dia_bp"),
        "bmi":                    input_dict.get("bmi"),
        "heart_rate":             input_dict.get("heart_rate"),
        "glucose":                input_dict.get("glucose"),
        "prediction_probability": risk_score,
        "prediction_label":       risk_label,
        "model_version":          model_version,
        "threshold_used":         threshold_used,
        "is_stub":                is_stub,
    }

    try:
        with httpx.Client(timeout=10) as client:
            resp = client.post(
                f"{SUPABASE_URL}/rest/v1/{_TABLE}",
                json=payload,
                headers=_headers(),
            )
            resp.raise_for_status()
            rows = resp.json()
            if rows and isinstance(rows, list):
                return int(rows[0]["id"])
    except Exception as exc:
        logger.warning("Failed to save assessment: %s", exc)

    return None


def get_assessments_for_user(user_id: str) -> list[dict]:
    """Fetch all assessments belonging to user_id, newest first."""
    if not _configured():
        return []

    try:
        with httpx.Client(timeout=10) as client:
            resp = client.get(
                f"{SUPABASE_URL}/rest/v1/{_TABLE}",
                params={
                    "user_id": f"eq.{user_id}",
                    "order":   "created_at.desc",
                    "limit":   "50",
                },
                headers=_headers(),
            )
            resp.raise_for_status()
            return resp.json() or []
    except Exception as exc:
        logger.warning("Failed to fetch assessments: %s", exc)
        return []


def get_assessment_by_id(assessment_id: int, user_id: str) -> Optional[dict]:
    """Fetch a single assessment, enforcing ownership."""
    if not _configured():
        return None

    try:
        with httpx.Client(timeout=10) as client:
            resp = client.get(
                f"{SUPABASE_URL}/rest/v1/{_TABLE}",
                params={
                    "id":      f"eq.{assessment_id}",
                    "user_id": f"eq.{user_id}",
                    "limit":   "1",
                },
                headers=_headers(),
            )
            resp.raise_for_status()
            rows = resp.json()
            return rows[0] if rows else None
    except Exception as exc:
        logger.warning("Failed to fetch assessment %s: %s", assessment_id, exc)
        return None
