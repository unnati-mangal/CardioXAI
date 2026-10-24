"""
Preprocessing — converts a validated PredictionInput (frontend schema) into
a pandas DataFrame with the exact column names and order the pipeline expects.

This is the only place where the frontend→training field renaming happens.
All downstream ML code receives training-schema DataFrames from this module.
"""

import pandas as pd

from app.ml.feature_config import FRONTEND_TO_TRAINING, TRAINING_FEATURE_ORDER


def input_to_dataframe(input_dict: dict) -> pd.DataFrame:
    """
    Convert a dict of frontend field names + values to a single-row DataFrame
    in training column order.

    Parameters
    ----------
    input_dict : dict
        Keys are frontend snake_case field names (age, sex, cigs_per_day, …).
        Boolean fields (bp_meds, prevalent_stroke, prevalent_hyp, diabetes)
        are cast to int (0/1) to match the training schema.

    Returns
    -------
    pd.DataFrame
        Shape (1, 13), columns = TRAINING_FEATURE_ORDER.
    """
    renamed: dict = {}
    for frontend_key, training_key in FRONTEND_TO_TRAINING.items():
        value = input_dict[frontend_key]
        # Cast booleans to int so the pipeline doesn't receive Python True/False
        if isinstance(value, bool):
            value = int(value)
        renamed[training_key] = value

    # Build a single-row DataFrame in the exact training column order
    df = pd.DataFrame([renamed], columns=TRAINING_FEATURE_ORDER)
    return df
