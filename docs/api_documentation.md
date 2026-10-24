# CardioXAI — API Documentation

Base URL (local development): `http://localhost:8000`  
Interactive Swagger UI: `http://localhost:8000/docs`  
ReDoc: `http://localhost:8000/redoc`

> All endpoints except `/api/health` require a valid **Supabase JWT** in the
> `Authorization: Bearer <token>` header. The token is obtained automatically
> by the frontend after sign-in.

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [GET /api/health](#2-get-apihealth)
3. [POST /api/predict](#3-post-apipredict)
4. [GET /api/assessments](#4-get-apiassessments)
5. [GET /api/assessments/{id}](#5-get-apiassessmentsid)
6. [Data Schemas](#6-data-schemas)
7. [Error Responses](#7-error-responses)

---

## 1. Authentication

Every protected endpoint reads the JWT from the HTTP `Authorization` header:

```
Authorization: Bearer <supabase-access-token>
```

The backend uses a two-stage verification strategy:

1. **Local HS256 verification** using `SUPABASE_JWT_SECRET` (fast, no network call)
2. **Supabase Auth API fallback** — calls `GET /auth/v1/user` if local verification fails or the secret is not set (supports all Supabase key formats including new `sb_` scheme)

If verification fails the endpoint returns `401 Unauthorized`.

---

## 2. GET /api/health

Health check — does **not** require authentication.

### Response `200 OK`

```json
{
  "status": "ok",
  "model_ready": true,
  "model_version": "1.0.0"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `status` | `string` | Always `"ok"` if the server is running |
| `model_ready` | `boolean` | `true` if `pipeline.joblib` loaded successfully |
| `model_version` | `string` | Version string from `metadata.json`, or `"unavailable"` |

---

## 3. POST /api/predict

Run a 10-year coronary heart disease risk prediction for the authenticated user.

**Requires authentication.**

### Request Body

`Content-Type: application/json`

```json
{
  "age": 52,
  "sex": 1,
  "cigs_per_day": 10,
  "bp_meds": false,
  "prevalent_stroke": false,
  "prevalent_hyp": true,
  "diabetes": false,
  "tot_chol": 230,
  "sys_bp": 140,
  "dia_bp": 90,
  "bmi": 27.5,
  "heart_rate": 75,
  "glucose": 95
}
```

#### Input Fields (`PredictionInput`)

| Field | Type | Range | Description |
|-------|------|-------|-------------|
| `age` | `float` | 20–80 | Age in years |
| `sex` | `int` | `0` or `1` | `0` = Female, `1` = Male |
| `cigs_per_day` | `float` | 0–60 | Average cigarettes smoked per day (0 if non-smoker) |
| `bp_meds` | `bool` | — | Currently on blood pressure medication |
| `prevalent_stroke` | `bool` | — | History of stroke |
| `prevalent_hyp` | `bool` | — | Prevalent hypertension diagnosis |
| `diabetes` | `bool` | — | Diabetes diagnosis |
| `tot_chol` | `float` | 100–600 | Total cholesterol (mg/dL) |
| `sys_bp` | `float` | 80–250 | Systolic blood pressure (mmHg) |
| `dia_bp` | `float` | 40–160 | Diastolic blood pressure (mmHg) |
| `bmi` | `float` | 10–60 | Body Mass Index (kg/m²) |
| `heart_rate` | `float` | 40–150 | Resting heart rate (bpm) |
| `glucose` | `float` | 40–500 | Fasting glucose level (mg/dL) |

### Response `200 OK`

```json
{
  "status": "ok",
  "message": "Prediction complete.",
  "risk_score": 0.213,
  "risk_label": "Elevated Risk",
  "threshold": 0.1684,
  "model_version": "1.0.0",
  "assessment_id": 42,
  "shap_values": [
    {
      "feature": "sysBP",
      "label": "Systolic BP",
      "shap_value": 0.0821,
      "direction": "positive"
    }
  ],
  "lime_values": [
    {
      "feature": "sysBP",
      "label": "Systolic BP",
      "weight": 0.0654,
      "direction": "positive",
      "condition": "sysBP > 130.00"
    }
  ]
}
```

#### Response Fields (`PredictionResponse`)

| Field | Type | Description |
|-------|------|-------------|
| `status` | `string` | `"ok"` if ML succeeded, `"ml_not_ready"` if model not loaded |
| `message` | `string` | Human-readable status message |
| `risk_score` | `float \| null` | Predicted probability of CHD (0.0–1.0) |
| `risk_label` | `string \| null` | `"Low Risk"` or `"Elevated Risk"` based on threshold |
| `threshold` | `float \| null` | Classification threshold used (default `0.1684`) |
| `model_version` | `string \| null` | Model version from metadata |
| `assessment_id` | `int \| null` | ID of the saved row in `public.assessments` |
| `shap_values` | `ShapEntry[]` | SHAP feature contributions (all 13 features, sorted by absolute value) |
| `lime_values` | `LimeEntry[]` | LIME local explanation weights (top features) |

#### `ShapEntry` fields

| Field | Type | Description |
|-------|------|-------------|
| `feature` | `string` | Internal training feature name (e.g. `"sysBP"`) |
| `label` | `string` | Human-readable label (e.g. `"Systolic BP"`) |
| `shap_value` | `float` | Contribution to log-odds (positive = increases risk) |
| `direction` | `string` | `"positive"` if risk-increasing, `"negative"` if risk-decreasing |

#### `LimeEntry` fields

| Field | Type | Description |
|-------|------|-------------|
| `feature` | `string` | Internal feature name |
| `label` | `string` | Human-readable label |
| `weight` | `float` | LIME weight for this instance |
| `direction` | `string` | `"positive"` or `"negative"` |
| `condition` | `string` | LIME condition string, e.g. `"sysBP > 130.00"` |

### `status: "ml_not_ready"` response

If `pipeline.joblib` is missing, the endpoint still returns `200 OK` but with:

```json
{
  "status": "ml_not_ready",
  "message": "ML model not loaded. Place pipeline.joblib in model/artifacts/ and restart.",
  "risk_score": null,
  "shap_values": [],
  "lime_values": []
}
```

The assessment stub row is still saved to Supabase.

---

## 4. GET /api/assessments

Retrieve all past assessments for the authenticated user, sorted newest first.

**Requires authentication.**

### Response `200 OK`

```json
[
  {
    "id": 42,
    "created_at": "2026-10-24T09:15:33.000Z",
    "age": 52.0,
    "sex": 1,
    "cigs_per_day": 10.0,
    "bp_meds": false,
    "prevalent_stroke": false,
    "prevalent_hyp": true,
    "diabetes": false,
    "tot_chol": 230.0,
    "sys_bp": 140.0,
    "dia_bp": 90.0,
    "bmi": 27.5,
    "heart_rate": 75.0,
    "glucose": 95.0,
    "prediction_probability": 0.213,
    "prediction_label": "Elevated Risk",
    "model_version": "1.0.0",
    "threshold_used": 0.1684,
    "is_stub": false
  }
]
```

Returns an empty array `[]` if the user has no assessments.

---

## 5. GET /api/assessments/{id}

Retrieve a single assessment by its integer ID.

**Requires authentication.** The assessment must belong to the requesting user
(enforced via Supabase RLS and backend ownership check). Returns `404` if not
found or owned by a different user.

### Path Parameter

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | `integer` | Assessment row ID |

### Response `200 OK`

Same schema as a single item from `GET /api/assessments`.

### Response `404 Not Found`

```json
{ "detail": "Assessment not found." }
```

---

## 6. Data Schemas

### `AssessmentOut`

All fields returned from the assessments endpoints.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `int` | Auto-increment primary key |
| `created_at` | `datetime` | ISO 8601 timestamp (UTC) |
| `age` | `float` | Input: age |
| `sex` | `int` | Input: sex (`0`/`1`) |
| `cigs_per_day` | `float` | Input: cigarettes per day |
| `bp_meds` | `bool` | Input: on BP medication |
| `prevalent_stroke` | `bool` | Input: history of stroke |
| `prevalent_hyp` | `bool` | Input: hypertension |
| `diabetes` | `bool` | Input: diabetes |
| `tot_chol` | `float \| null` | Input: total cholesterol |
| `sys_bp` | `float \| null` | Input: systolic BP |
| `dia_bp` | `float \| null` | Input: diastolic BP |
| `bmi` | `float \| null` | Input: BMI |
| `heart_rate` | `float \| null` | Input: heart rate |
| `glucose` | `float \| null` | Input: glucose |
| `prediction_probability` | `float \| null` | ML output: predicted risk 0–1 |
| `prediction_label` | `string \| null` | `"Low Risk"` or `"Elevated Risk"` |
| `model_version` | `string \| null` | Model version used |
| `threshold_used` | `float \| null` | Threshold applied for label |
| `is_stub` | `bool` | `true` if prediction did not run (model missing) |

---

## 7. Error Responses

All errors follow FastAPI's standard format:

```json
{ "detail": "Human-readable error message." }
```

| HTTP Status | Meaning |
|-------------|---------|
| `400 Bad Request` | Invalid input — field validation error (FastAPI returns `422` for schema errors) |
| `401 Unauthorized` | Missing, expired, or invalid JWT |
| `404 Not Found` | Assessment ID does not exist or belongs to another user |
| `422 Unprocessable Entity` | Request body failed Pydantic validation (field out of range, wrong type) |
| `500 Internal Server Error` | Unexpected server error during prediction |
| `503 Service Unavailable` | Supabase credentials not configured on the server |
