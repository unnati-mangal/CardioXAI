# CardioXAI — Architecture

> **Research prototype.** Not a clinical diagnostic tool.

---

## Table of Contents

1. [High-Level Overview](#1-high-level-overview)
2. [Technology Stack](#2-technology-stack)
3. [Repository Layout](#3-repository-layout)
4. [Frontend Architecture](#4-frontend-architecture)
5. [Backend Architecture](#5-backend-architecture)
6. [ML Pipeline](#6-ml-pipeline)
7. [Authentication & Security](#7-authentication--security)
8. [Database Schema](#8-database-schema)
9. [Data Flow — Prediction Request](#9-data-flow--prediction-request)
10. [Design System](#10-design-system)

---

## 1. High-Level Overview

```
Browser (React SPA)
        │  HTTPS / REST JSON
        ▼
FastAPI Backend  ──────────  Supabase
  (port 8000)               (PostgreSQL + Auth)
        │
        ▼
   sklearn Pipeline
   (pipeline.joblib)
        │
   SHAP  +  LIME
   Explainers
```

CardioXAI is a **single-page application** paired with a **Python REST API**.
The frontend handles routing, authentication state, and rendering. All
prediction logic and database writes happen on the backend.

---

## 2. Technology Stack

### Frontend

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript |
| Build tool | Vite |
| Routing | React Router v6 |
| Styling | Tailwind CSS v3 with custom design tokens |
| Auth client | `@supabase/supabase-js` |
| HTTP | Native `fetch` with JWT injection |
| Charts | Recharts (SHAP/LIME bar charts) |

### Backend

| Layer | Technology |
|-------|-----------|
| Framework | FastAPI + Uvicorn |
| Validation | Pydantic v2 |
| ML inference | scikit-learn `1.6.1` |
| SHAP | `shap` library (analytical LinearExplainer) |
| LIME | `lime` library (LimeTabularExplainer) |
| Auth verification | PyJWT + Supabase Auth API fallback |
| HTTP client | `httpx` (for Supabase REST calls) |

### Infrastructure

| Service | Purpose |
|---------|---------|
| Supabase | PostgreSQL database + user authentication |
| Supabase Auth | JWT-based user sessions, Google OAuth |
| Supabase RLS | Row-level security (users only see their own rows) |

---

## 3. Repository Layout

```
CardioXAI/
├── backend/
│   ├── .env                          # secrets (gitignored)
│   ├── requirements.txt
│   └── app/
│       ├── main.py                   # FastAPI app, CORS, router registration
│       ├── api/
│       │   ├── prediction.py         # POST /api/predict
│       │   └── assessments.py        # GET /api/assessments[/{id}]
│       ├── core/
│       │   ├── config.py             # env var loading
│       │   ├── security.py           # JWT verification (HS256 + Supabase API)
│       │   └── logging_config.py     # structured logging setup
│       ├── ml/
│       │   ├── feature_config.py     # 13 feature names + display labels
│       │   ├── model_loader.py       # loads pipeline.joblib at startup
│       │   ├── preprocessing.py      # dict → pandas DataFrame
│       │   ├── shap_explainer.py     # analytical SHAP for LogisticRegression
│       │   └── lime_explainer.py     # LIME local explanations
│       ├── schemas/
│       │   ├── prediction_schema.py  # PredictionInput / PredictionResponse
│       │   └── assessment_schema.py  # AssessmentOut
│       └── services/
│           ├── prediction_service.py # orchestrates inference + explanations
│           └── assessment_service.py # Supabase read/write for assessments
├── frontend/
│   ├── .env                          # Vite env vars (gitignored)
│   ├── tailwind.config.ts
│   └── src/
│       ├── index.css                 # design tokens + component classes
│       ├── App.tsx                   # BrowserRouter + ProtectedRoute
│       ├── pages/
│       │   ├── LandingPage.tsx
│       │   ├── AuthPage.tsx
│       │   ├── DashboardPage.tsx
│       │   ├── PredictionPage.tsx
│       │   └── PastAssessmentsPage.tsx
│       ├── components/
│       │   ├── layout/               # DashboardLayout, Sidebar
│       │   ├── dashboard/            # WelcomeSection, AssessmentSummary, RecentAssessments
│       │   └── prediction/           # PredictionForm, PredictionResult, SHAP/LIME/Plain-English
│       ├── services/                 # api.ts, predictionService.ts, assessmentService.ts
│       ├── types/                    # TypeScript interfaces
│       ├── hooks/                    # useAuth.tsx (Supabase session)
│       └── utils/                   # reportDownload.ts, formatters.ts
├── model/
│   └── artifacts/                   # pipeline.joblib, feature_names.json, metadata.json
└── database/
    ├── schema.sql
    └── rls_policies.sql
```

---

## 4. Frontend Architecture

### Route structure

```
/                 LandingPage      (public)
/auth             AuthPage         (public, redirects to /dashboard if signed in)
/dashboard        DashboardPage    (protected)
/predict          PredictionPage   (protected)
/assessments      PastAssessmentsPage (protected)
```

`ProtectedRoute` in `App.tsx` reads the Supabase session from `useAuth()` and
redirects unauthenticated users to `/auth`.

### State management

No global state library is used. State is managed locally:

- **Auth state** — `useAuth()` hook wraps `supabase.auth.getSession()` and
  `onAuthStateChange`
- **Dashboard data** — fetched on every navigation using `useLocation().key`
  as a `useEffect` dependency (forces re-fetch when user navigates back)
- **Prediction flow** — `PredictionPage` owns `result` and `lastInput` state,
  passing them down to `PredictionForm` and `PredictionResult`

### Component hierarchy (prediction flow)

```
PredictionPage
├── PredictionForm            ← 13 input fields + validation
└── PredictionResult
    ├── RiskOverview          ← gauge + risk label
    ├── ShapExplanation       ← horizontal bar chart (Recharts)
    ├── LimeExplanation       ← horizontal bar chart (Recharts)
    ├── PlainEnglishExplanation  ← risk factors + recommendations in plain language
    └── [Download Report button] → reportDownload.ts → print-to-PDF
```

---

## 5. Backend Architecture

### Request lifecycle

```
HTTP POST /api/predict
    │
    ├── HTTPBearer extracts JWT
    ├── security.verify_token()  →  user_id (UUID string)
    │
    ├── Pydantic validates PredictionInput (13 fields)
    │
    ├── assessment_service.save_assessment()  →  writes stub row to Supabase
    │
    ├── prediction_service.run_prediction()
    │       ├── model_loader.get_pipeline()   →  sklearn Pipeline
    │       ├── preprocessing.input_to_dataframe()
    │       ├── pipeline.predict_proba()      →  risk_score (float 0–1)
    │       ├── shap_explainer.compute_shap() →  List[ShapEntry]
    │       └── lime_explainer.compute_lime() →  List[LimeEntry]
    │
    ├── PATCH Supabase row with actual probability + label
    │
    └── Return PredictionResponse (JSON)
```

### Startup behaviour

On first import of `model_loader`, the pipeline is loaded once and cached in
module-level memory. Subsequent requests reuse the cached object — no disk
reads per request.

If `pipeline.joblib` is absent, the loader raises `FileNotFoundError` which is
caught gracefully — the API still starts and returns `status: "ml_not_ready"`
responses.

---

## 6. ML Pipeline

### Model

`LogisticRegression` trained on the **Framingham Heart Study** dataset,
predicting 10-year coronary heart disease (CHD) risk (binary: 0 = no CHD,
1 = CHD). Wrapped in a sklearn `Pipeline`:

```
Step 1 — imputer   : SimpleImputer(strategy="median")
Step 2 — scaler    : StandardScaler()
Step 3 — classifier: LogisticRegression(...)
```

**sklearn must be `==1.6.1`** — the pipeline was serialised with that version.

### Feature names (training order)

```
age, male, cigsPerDay, BPMeds, prevalentStroke,
prevalentHyp, diabetes, totChol, sysBP, diaBP,
BMI, heartRate, glucose
```

The frontend sends snake_case (`sys_bp`, `tot_chol`, etc.) which
`preprocessing.py` maps to the training feature names before inference.

### SHAP — analytical computation

For `LogisticRegression`, SHAP values are computed analytically:

```
φⱼ = coef_j × (x_j_scaled - 0)
```

where `x_j_scaled` is the post-scaler value. This is exact for linear models
and avoids the instability of `shap.LinearExplainer` with small background
datasets (1-row background would cause errors).

### LIME

`LimeTabularExplainer` is used with 500 perturbation samples per instance.
The explainer is created fresh per prediction (LIME is inherently local).
Feature importances are returned sorted by absolute weight.

### Classification threshold

Default threshold: **0.1684** (from Framingham research literature). Can be
overridden via `PREDICTION_THRESHOLD` env var or `metadata.json`.

---

## 7. Authentication & Security

### JWT verification (two-stage)

```
Bearer token received
        │
        ▼
SUPABASE_JWT_SECRET set?
   Yes → PyJWT.decode(token, secret, algorithms=["HS256"])
         ├── Success → user_id = payload["sub"]
         └── Failure → fall through to stage 2
   No  → stage 2
        │
        ▼
Supabase Auth API: GET /auth/v1/user
(works with all key formats: legacy + new sb_ format)
   200 → user_id = user["id"]
   401 → raise HTTP 401
```

### Row-Level Security (Supabase)

The `public.assessments` table uses RLS policies (see `database/rls_policies.sql`):
- Users can only **SELECT** their own rows (`user_id = auth.uid()`)
- Users can only **INSERT** rows where `user_id = auth.uid()`
- **UPDATE/DELETE** is handled server-side via the service role key

### Secrets

| Secret | Who uses it | How |
|--------|-------------|-----|
| `SUPABASE_SERVICE_ROLE_KEY` | Backend only | Supabase REST PATCH calls |
| `SUPABASE_JWT_SECRET` | Backend only | Local JWT verification |
| `SUPABASE_ANON_KEY` | Frontend + Backend | Supabase Auth API calls |

The service role key is **never** sent to the browser.

---

## 8. Database Schema

Single table: `public.assessments`

```sql
CREATE TABLE public.assessments (
    id                      BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id                 UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- 13 Framingham inputs
    age                     NUMERIC(5,2) NOT NULL,
    sex                     SMALLINT     NOT NULL CHECK (sex IN (0, 1)),
    cigs_per_day            NUMERIC(5,2) NOT NULL DEFAULT 0,
    bp_meds                 BOOLEAN      NOT NULL DEFAULT FALSE,
    prevalent_stroke        BOOLEAN      NOT NULL DEFAULT FALSE,
    prevalent_hyp           BOOLEAN      NOT NULL DEFAULT FALSE,
    diabetes                BOOLEAN      NOT NULL DEFAULT FALSE,
    tot_chol                NUMERIC(6,2),
    sys_bp                  NUMERIC(6,2),
    dia_bp                  NUMERIC(6,2),
    bmi                     NUMERIC(5,2),
    heart_rate              NUMERIC(5,2),
    glucose                 NUMERIC(6,2),

    -- Prediction output
    prediction_probability  DOUBLE PRECISION,
    prediction_label        TEXT,
    model_version           TEXT,
    threshold_used          DOUBLE PRECISION,
    is_stub                 BOOLEAN NOT NULL DEFAULT TRUE
);
```

---

## 9. Data Flow — Prediction Request

```
User fills form (PredictionForm)
        │  { age, sex, sys_bp, ... }
        ▼
predictionService.ts
  → fetch POST /api/predict
  → headers: { Authorization: Bearer <token> }
        │
        ▼
FastAPI: security.get_user_id()   verify JWT → UUID
        │
        ▼
assessment_service.save_assessment()
  → Supabase INSERT (is_stub=true)
  → returns assessment_id
        │
        ▼
prediction_service.run_prediction()
  → model_loader.get_pipeline()         (cached)
  → preprocessing.input_to_dataframe()  (snake_case → training names)
  → pipeline.predict_proba()            → risk_score
  → shap_explainer.compute_shap()       → List[ShapEntry]
  → lime_explainer.compute_lime()       → List[LimeEntry]
        │
        ▼
PATCH /rest/v1/assessments  (update stub row with actual score)
        │
        ▼
Return PredictionResponse JSON
        │
        ▼
PredictionResult renders:
  ├── RiskOverview gauge
  ├── ShapExplanation bar chart
  ├── LimeExplanation bar chart
  └── PlainEnglishExplanation (factors ↑↓ + recommendations)
```

---

## 10. Design System

All design tokens are defined as CSS custom properties in `frontend/src/index.css`
and exposed via `tailwind.config.ts`:

| Token | Value | Usage |
|-------|-------|-------|
| `brand-green` | `#3D7A5A` | Primary action colour, active nav, headings |
| `brand-green-dark` | `#2A5940` | Hover state for primary buttons |
| `brand-green-light` | `#EAF2EC` | Card backgrounds, icon backgrounds, badges |
| `brand-bg` | `#F5F7F5` | Page background |
| `brand-surface` | `#FFFFFF` | Card surface |
| `brand-border` | `#DDE8DD` | Card borders, dividers |
| `brand-text` | `#1C2B22` | Primary text |
| `brand-muted` | `#6B7D72` | Secondary / label text |

### Component classes (index.css)

| Class | Description |
|-------|-------------|
| `.card` | White rounded card with border |
| `.btn-primary` | Filled green button |
| `.btn-outline` | Outlined green button |
| `.btn-ghost` | Transparent hover button |
| `.field-input` | Styled text/number input |
| `.field-select` | Styled dropdown |
| `.badge-low` | Green risk badge |
| `.badge-moderate` | Amber risk badge |
| `.badge-high` | Red risk badge |
| `.nav-item` | Sidebar nav link (inactive) |
| `.nav-item-active` | Sidebar nav link (active) |
