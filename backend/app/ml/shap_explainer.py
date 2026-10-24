"""
SHAP explainer for the CardioXAI logistic regression pipeline.

Uses shap.LinearExplainer on the final LogisticRegression step, passing
it the scaler-transformed data (the input the classifier actually sees).

Returns a sorted list of dicts ready to be coerced into ShapEntry objects.
"""

import logging
from typing import Any

import numpy as np
import pandas as pd

from app.ml.feature_config import FEATURE_DISPLAY_LABELS, TRAINING_FEATURE_ORDER

logger = logging.getLogger(__name__)


def compute_shap(pipeline: Any, df: pd.DataFrame) -> list[dict]:
    """
    Compute SHAP values for a single-row input DataFrame.

    Parameters
    ----------
    pipeline : sklearn.pipeline.Pipeline
        The loaded pipeline (imputer → scaler → classifier).
    df : pd.DataFrame
        Single-row input in training column order.

    Returns
    -------
    list[dict]
        Each dict has keys: feature, label, shap_value, direction.
        Sorted by |shap_value| descending (most impactful first).
        Returns [] on any error so the prediction still succeeds.
    """
    try:
        # ── Step 1: transform through imputer + scaler ────────────────────────
        # We need the data that the LogisticRegression classifier actually sees.
        imputer   = pipeline.named_steps["imputer"]
        scaler    = pipeline.named_steps["scaler"]
        classifier = pipeline.named_steps["classifier"]

        X_imputed  = imputer.transform(df)
        X_scaled   = scaler.transform(X_imputed)

        # ── Step 2: compute SHAP values analytically ─────────────────────────
        # For LogisticRegression the SHAP value for feature j is simply:
        #   phi_j = coef_j * (x_j - E[x_j])
        # where E[x_j] is the mean of the background (use zero vector = all features
        # at their scaled mean, i.e. the scaler has already centred the data).
        # This avoids LinearExplainer's background-size requirements entirely
        # and gives exact, numerically stable SHAP values for a linear model.
        coef       = classifier.coef_[0]           # shape (13,)
        x_scaled   = X_scaled[0]                   # shape (13,)
        background = np.zeros(x_scaled.shape)      # E[x] after StandardScaler ≈ 0
        values     = coef * (x_scaled - background)  # exact linear SHAP

        # ── Step 3: build output list ─────────────────────────────────────────
        results = []
        for feat, val in zip(TRAINING_FEATURE_ORDER, values):
            results.append({
                "feature":    feat,
                "label":      FEATURE_DISPLAY_LABELS.get(feat, feat),
                "shap_value": round(float(val), 6),
                "direction":  "positive" if val >= 0 else "negative",
            })

        # Sort by absolute impact, most important first
        results.sort(key=lambda x: abs(x["shap_value"]), reverse=True)
        return results

    except Exception as exc:
        logger.warning("SHAP computation failed: %s", exc, exc_info=True)
        return []
