"""Pydantic schemas for the /api/assessments endpoints."""

from typing import Optional
from pydantic import BaseModel
from datetime import datetime


class AssessmentOut(BaseModel):
    id:                     int
    user_id:                str
    created_at:             datetime

    # 13 input fields stored at submission time
    age:                    float
    sex:                    int
    cigs_per_day:           float
    bp_meds:                bool
    prevalent_stroke:       bool
    prevalent_hyp:          bool
    diabetes:               bool
    tot_chol:               float
    sys_bp:                 float
    dia_bp:                 float
    bmi:                    float
    heart_rate:             float
    glucose:                float

    # Result fields
    prediction_label:       Optional[str]   = None
    prediction_probability: Optional[float] = None
    model_version:          Optional[str]   = None
    threshold_used:         Optional[float] = None
    is_stub:                bool            = False

    model_config = {"from_attributes": True}
