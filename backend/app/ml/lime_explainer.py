"""
LIME explainer for the CardioXAI logistic regression pipeline.

Uses lime.lime_tabular.LimeTabularExplainer with a background of zeros
(median-like neutral values after imputation). Explains the positive class (CHD=1).

Returns a sorted list of dicts ready to be coerced into LimeEntry objects.
"""

import logging
from typing import Any

import numpy as np
import pandas as pd

from app.ml.feature_config import FEATURE_DISPLAY_LABELS, TRAINING_FEATURE_ORDER

logger = logging.getLogger(__name__)

# Number of features to return in the explanation
_TOP_N = 10


def _predict_proba(pipeline: Any, X: np.ndarray) -> np.ndarray:
    """Wrapper so LIME can call predict_proba on raw (unscaled) numpy arrays."""
    df = pd.DataFrame(X, columns=TRAINING_FEATURE_ORDER)
    return pipeline.predict_proba(df)


def compute_lime(pipeline: Any, df: pd.DataFrame) -> list[dict]:
    """
    Compute LIME feature weights for a single-row input DataFrame.

    Parameters
    ----------
    pipeline : sklearn.pipeline.Pipeline
        The loaded pipeline (imputer → scaler → classifier).
    df : pd.DataFrame
        Single-row input in training column order.

    Returns
    -------
    list[dict]
        Each dict has keys: feature, label, weight, direction, condition.
        Sorted by |weight| descending (most impactful first).
        Returns [] on any error so the prediction still succeeds.
    """
    try:
        from lime.lime_tabular import LimeTabularExplainer

        instance = df.values[0]  # shape (13,)

        # ── Background data: use the instance itself as a 1-sample "training set"
        # (LIME only needs it to determine feature statistics for perturbation)
        training_data = np.tile(instance, (50, 1))  # repeat 50× for stability
        # Add small Gaussian noise so LIME can estimate variances
        rng = np.random.default_rng(seed=42)
        training_data = training_data + rng.normal(0, 0.1, training_data.shape)

        # Identify categorical feature indices (binary 0/1 features)
        categorical_indices = [
            TRAINING_FEATURE_ORDER.index(f)
            for f in ["male", "BPMeds", "prevalentStroke", "prevalentHyp", "diabetes"]
        ]

        explainer = LimeTabularExplainer(
            training_data=training_data,
            feature_names=TRAINING_FEATURE_ORDER,
            class_names=["No CHD", "CHD"],
            categorical_features=categorical_indices,
            mode="classification",
            random_state=42,
            discretize_continuous=True,
        )

        explanation = explainer.explain_instance(
            data_row=instance,
            predict_fn=lambda X: _predict_proba(pipeline, X),
            num_features=_TOP_N,
            num_samples=500,
            labels=(1,),   # explain the positive class (CHD = 1)
        )

        # explanation.as_list(label=1) → [(condition_str, weight), ...]
        lime_list = explanation.as_list(label=1)

        results = []
        for condition, weight in lime_list:
            # condition is e.g. "sysBP > 130.00" or "0.50 < age <= 60.00"
            # Try to map back to the feature name from the condition string
            feat_name = _condition_to_feature(condition)
            results.append({
                "feature":   feat_name,
                "label":     FEATURE_DISPLAY_LABELS.get(feat_name, feat_name),
                "weight":    round(float(weight), 6),
                "direction": "positive" if weight >= 0 else "negative",
                "condition": condition,
            })

        # Sort by absolute weight
        results.sort(key=lambda x: abs(x["weight"]), reverse=True)
        return results

    except Exception as exc:
        logger.warning("LIME computation failed: %s", exc, exc_info=True)
        return []


def _condition_to_feature(condition: str) -> str:
    """
    Extract the training feature name from a LIME condition string.

    LIME discretiser produces strings like:
      "sysBP > 130.00"
      "0.50 < BMI <= 28.00"
      "age <= 55.00"
      "male=0"
    """
    for feat in TRAINING_FEATURE_ORDER:
        if feat in condition:
            return feat
    # Fallback: return the raw condition
    return condition.split()[0] if condition.split() else condition
