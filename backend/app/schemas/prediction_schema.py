"""
Pydantic schemas for the /api/predict endpoint.

PredictionInput  — validated request body (13 Framingham fields).
ShapEntry        — one feature's SHAP contribution.
LimeEntry        — one feature's LIME contribution.
PredictionResponse — full response including risk score + explanations.
"""

from typing import Optional
from pydantic import BaseModel, Field, field_validator


class PredictionInput(BaseModel):
    age:              float = Field(..., ge=20,  le=80,  description="Age in years")
    sex:              int   = Field(..., ge=0,   le=1,   description="0=Female, 1=Male")
    cigs_per_day:     float = Field(..., ge=0,   le=60,  description="Cigarettes smoked per day")
    bp_meds:          bool  = Field(...,                 description="Currently on BP medication")
    prevalent_stroke: bool  = Field(...,                 description="History of stroke")
    prevalent_hyp:    bool  = Field(...,                 description="Prevalent hypertension")
    diabetes:         bool  = Field(...,                 description="Diabetes diagnosis")
    tot_chol:         float = Field(..., ge=100, le=600, description="Total cholesterol mg/dL")
    sys_bp:           float = Field(..., ge=80,  le=250, description="Systolic BP mmHg")
    dia_bp:           float = Field(..., ge=40,  le=160, description="Diastolic BP mmHg")
    bmi:              float = Field(..., ge=10,  le=60,  description="Body Mass Index")
    heart_rate:       float = Field(..., ge=40,  le=150, description="Heart rate bpm")
    glucose:          float = Field(..., ge=40,  le=500, description="Glucose mg/dL")

    @field_validator("sex")
    @classmethod
    def sex_must_be_binary(cls, v: int) -> int:
        if v not in (0, 1):
            raise ValueError("sex must be 0 (Female) or 1 (Male)")
        return v

    model_config = {"json_schema_extra": {
        "example": {
            "age": 52, "sex": 1, "cigs_per_day": 10, "bp_meds": False,
            "prevalent_stroke": False, "prevalent_hyp": True, "diabetes": False,
            "tot_chol": 230, "sys_bp": 140, "dia_bp": 90,
            "bmi": 27.5, "heart_rate": 75, "glucose": 95,
        }
    }}


class ShapEntry(BaseModel):
    feature:    str
    label:      str
    shap_value: float
    direction:  str   # "positive" | "negative"


class LimeEntry(BaseModel):
    feature:   str
    label:     str
    weight:    float
    direction: str    # "positive" | "negative"
    condition: str    # full LIME condition string, e.g. "sysBP > 130"


class PredictionResponse(BaseModel):
    status:        str            # "ok" | "ml_not_ready"
    message:       str
    risk_score:    Optional[float]  = None   # probability 0–1
    risk_label:    Optional[str]    = None   # "Low" | "Elevated"
    threshold:     Optional[float]  = None   # threshold used for classification
    model_version: Optional[str]    = None
    assessment_id: Optional[int]    = None
    shap_values:   list[ShapEntry]  = []
    lime_values:   list[LimeEntry]  = []
