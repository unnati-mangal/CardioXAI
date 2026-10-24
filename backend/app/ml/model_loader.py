"""
Model loader — loads the joblib pipeline once at startup and caches it.

The pipeline contains:
  1. SimpleImputer (median strategy)
  2. StandardScaler
  3. LogisticRegression

Call `get_pipeline()` from any service; it raises ModelNotReadyError if the
artifact has not been exported yet. That error surfaces as HTTP 503 so the
frontend can display a clear "model not ready" state instead of a crash.
"""

import json
import logging
from pathlib import Path
from typing import Optional

import joblib

from app.core.config import METADATA_PATH, PIPELINE_PATH, DEFAULT_THRESHOLD

logger = logging.getLogger(__name__)


class ModelNotReadyError(Exception):
    """Raised when the pipeline artifact does not exist or failed to load."""


# Module-level singletons — loaded once when the module is first imported
_pipeline = None
_metadata: Optional[dict] = None
_load_error: Optional[str] = None


def _load() -> None:
    """Attempt to load the pipeline and metadata from disk."""
    global _pipeline, _metadata, _load_error

    if not PIPELINE_PATH.exists():
        _load_error = (
            f"Model artifact not found at {PIPELINE_PATH}. "
            "Run model/train_and_export.py to generate the pipeline, "
            "then restart the backend."
        )
        logger.warning(_load_error)
        return

    try:
        _pipeline = joblib.load(PIPELINE_PATH)
        logger.info("Pipeline loaded from %s", PIPELINE_PATH)
    except Exception as exc:
        _load_error = f"Failed to load pipeline: {exc}"
        logger.error(_load_error)
        return

    if METADATA_PATH.exists():
        try:
            with open(METADATA_PATH) as f:
                _metadata = json.load(f)
            logger.info("Model metadata loaded (version %s)", _metadata.get("model_version"))
        except Exception as exc:
            logger.warning("Could not load metadata: %s", exc)
            _metadata = None


# Load on import
_load()


def get_pipeline():
    """
    Return the loaded sklearn Pipeline.
    Raises ModelNotReadyError if the artifact is not available.
    """
    if _pipeline is None:
        raise ModelNotReadyError(_load_error or "Model pipeline is not loaded.")
    return _pipeline


def get_metadata() -> dict:
    """Return model metadata dict (may be empty if metadata.json is absent)."""
    return _metadata or {}


def get_threshold() -> float:
    """
    Return the classification threshold.
    Reads from metadata.json if available; falls back to DEFAULT_THRESHOLD.
    This threshold was selected via out-of-fold F1 optimisation during research.
    It is NOT a clinically validated cutoff.
    """
    if _metadata:
        return float(_metadata.get("threshold", DEFAULT_THRESHOLD))
    return DEFAULT_THRESHOLD


def get_positive_class_index() -> int:
    """Return the column index of the positive class in predict_proba output."""
    if _metadata:
        return int(_metadata.get("positive_class_index", 1))
    return 1


def get_model_version() -> str:
    if _metadata:
        return str(_metadata.get("model_version", "unknown"))
    return "unknown"
