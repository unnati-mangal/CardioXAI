"""
Tests for SHAP and LIME explanation generation.

Run with:
    cd backend
    pytest tests/test_explanations.py -v
"""

import pytest
import numpy as np
import pandas as pd
from unittest.mock import MagicMock, patch


# ── SHAP explainer ─────────────────────────────────────────────────────────────

class TestShapExplainer:
    """Tests for app.ml.shap_explainer.compute_shap()"""

    def _make_pipeline(self, n_features=13):
        """Build a minimal mock sklearn Pipeline for testing."""
        pipeline = MagicMock()
        scaler = MagicMock()
        classifier = MagicMock()

        scaler.mean_    = np.zeros(n_features)
        scaler.scale_   = np.ones(n_features)
        scaler.transform.return_value = np.ones((1, n_features))

        classifier.coef_    = np.random.randn(1, n_features)
        classifier.classes_ = np.array([0, 1])

        pipeline.named_steps = {"scaler": scaler, "classifier": classifier}
        pipeline["scaler"]    = scaler
        pipeline["classifier"] = classifier
        return pipeline

    def _sample_df(self):
        from app.ml.feature_config import FEATURE_NAMES
        return pd.DataFrame(
            [[52, 1, 10, 0, 0, 1, 0, 230, 140, 90, 27.5, 75, 95]],
            columns=FEATURE_NAMES,
        )

    def test_returns_list_of_shap_entries(self):
        from app.ml.shap_explainer import compute_shap
        from app.schemas.prediction_schema import ShapEntry
        pipeline = self._make_pipeline()
        df       = self._sample_df()
        results  = compute_shap(pipeline, df)
        assert isinstance(results, list)
        assert all(isinstance(e, ShapEntry) for e in results)

    def test_shap_count_equals_feature_count(self):
        from app.ml.shap_explainer import compute_shap
        from app.ml.feature_config import FEATURE_NAMES
        pipeline = self._make_pipeline()
        df       = self._sample_df()
        results  = compute_shap(pipeline, df)
        assert len(results) == len(FEATURE_NAMES)

    def test_shap_direction_matches_sign(self):
        from app.ml.shap_explainer import compute_shap
        pipeline = self._make_pipeline()
        df       = self._sample_df()
        for entry in compute_shap(pipeline, df):
            if entry.shap_value > 0:
                assert entry.direction == "positive"
            elif entry.shap_value < 0:
                assert entry.direction == "negative"

    def test_shap_values_are_finite(self):
        from app.ml.shap_explainer import compute_shap
        pipeline = self._make_pipeline()
        df       = self._sample_df()
        for entry in compute_shap(pipeline, df):
            assert np.isfinite(entry.shap_value), \
                f"Non-finite SHAP value for feature {entry.feature}"


# ── LIME explainer ─────────────────────────────────────────────────────────────

class TestLimeExplainer:
    """Tests for app.ml.lime_explainer.compute_lime()"""

    def _sample_df(self):
        from app.ml.feature_config import FEATURE_NAMES
        return pd.DataFrame(
            [[52, 1, 10, 0, 0, 1, 0, 230, 140, 90, 27.5, 75, 95]],
            columns=FEATURE_NAMES,
        )

    def test_returns_list_of_lime_entries(self):
        """Smoke test — requires a real pipeline.joblib in model/artifacts/."""
        pytest.importorskip("lime")
        try:
            from app.ml.model_loader import get_pipeline
            from app.ml.lime_explainer import compute_lime
            from app.schemas.prediction_schema import LimeEntry
            pipeline = get_pipeline()
            df = self._sample_df()
            results = compute_lime(pipeline, df)
            assert isinstance(results, list)
            assert all(isinstance(e, LimeEntry) for e in results)
        except FileNotFoundError:
            pytest.skip("pipeline.joblib not present — skipping LIME smoke test")

    def test_lime_entries_have_condition(self):
        pytest.importorskip("lime")
        try:
            from app.ml.model_loader import get_pipeline
            from app.ml.lime_explainer import compute_lime
            pipeline = get_pipeline()
            df = self._sample_df()
            for entry in compute_lime(pipeline, df):
                assert isinstance(entry.condition, str)
                assert len(entry.condition) > 0
        except FileNotFoundError:
            pytest.skip("pipeline.joblib not present — skipping LIME smoke test")

    def test_lime_direction_matches_sign(self):
        pytest.importorskip("lime")
        try:
            from app.ml.model_loader import get_pipeline
            from app.ml.lime_explainer import compute_lime
            pipeline = get_pipeline()
            df = self._sample_df()
            for entry in compute_lime(pipeline, df):
                if entry.weight > 0:
                    assert entry.direction == "positive"
                elif entry.weight < 0:
                    assert entry.direction == "negative"
        except FileNotFoundError:
            pytest.skip("pipeline.joblib not present — skipping LIME smoke test")


# ── Preprocessing ──────────────────────────────────────────────────────────────

class TestPreprocessing:
    """Tests for app.ml.preprocessing.input_to_dataframe()"""

    def test_output_is_dataframe(self):
        from app.ml.preprocessing import input_to_dataframe
        from app.schemas.prediction_schema import PredictionInput
        inp = PredictionInput(
            age=52, sex=1, cigs_per_day=10, bp_meds=False,
            prevalent_stroke=False, prevalent_hyp=True, diabetes=False,
            tot_chol=230, sys_bp=140, dia_bp=90, bmi=27.5,
            heart_rate=75, glucose=95,
        )
        df = input_to_dataframe(inp)
        assert isinstance(df, pd.DataFrame)
        assert df.shape[0] == 1

    def test_output_column_count_matches_features(self):
        from app.ml.preprocessing import input_to_dataframe
        from app.ml.feature_config import FEATURE_NAMES
        from app.schemas.prediction_schema import PredictionInput
        inp = PredictionInput(
            age=52, sex=1, cigs_per_day=10, bp_meds=False,
            prevalent_stroke=False, prevalent_hyp=True, diabetes=False,
            tot_chol=230, sys_bp=140, dia_bp=90, bmi=27.5,
            heart_rate=75, glucose=95,
        )
        df = input_to_dataframe(inp)
        assert list(df.columns) == FEATURE_NAMES
