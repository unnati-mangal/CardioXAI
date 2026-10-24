# Backend — CardioXAI API

FastAPI backend for the CardioXAI heart disease risk prediction platform.

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | FastAPI + Uvicorn |
| Validation | Pydantic v2 |
| ML | scikit-learn 1.6.1 |
| Explainability | SHAP (analytical) + LIME |
| Auth | PyJWT + Supabase Auth API fallback |
| Database | Supabase (PostgreSQL via REST) |

## Running locally

```bash
# From the backend/ directory
python -m venv .venv

# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload
```

API runs at: **http://localhost:8000**  
Swagger UI: **http://localhost:8000/docs**  
Health check: **http://localhost:8000/api/health**

## Environment variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Required variables:

| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (never expose to frontend) |
| `SUPABASE_JWT_SECRET` | JWT secret — Supabase → Settings → API → JWT Settings |

## Project structure

```
backend/
├── .env.example
├── requirements.txt
└── app/
    ├── main.py              # FastAPI entry point, CORS, router registration
    ├── api/
    │   ├── prediction.py    # POST /api/predict
    │   └── assessments.py   # GET /api/assessments[/{id}]
    ├── core/
    │   ├── config.py        # env var loading
    │   ├── security.py      # JWT verification (HS256 + Supabase API fallback)
    │   └── logging_config.py
    ├── ml/
    │   ├── feature_config.py  # 13 Framingham feature names + display labels
    │   ├── model_loader.py    # loads pipeline.joblib at startup (cached)
    │   ├── preprocessing.py   # PredictionInput → pandas DataFrame
    │   ├── shap_explainer.py  # analytical SHAP for LogisticRegression
    │   └── lime_explainer.py  # LIME local explanations
    ├── schemas/
    │   ├── prediction_schema.py   # PredictionInput / PredictionResponse
    │   └── assessment_schema.py   # AssessmentOut
    └── services/
        ├── prediction_service.py  # orchestrates inference + explanations
        └── assessment_service.py  # Supabase read/write
```

## Running tests

```bash
cd backend
pytest tests/ -v
```

Tests use `unittest.mock` — no live Supabase or ML model required for most tests.
LIME/SHAP smoke tests auto-skip if `pipeline.joblib` is missing.

## API endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/health` | No | Backend + model health check |
| `POST` | `/api/predict` | JWT | Run prediction + SHAP/LIME explanations |
| `GET` | `/api/assessments` | JWT | List authenticated user's assessments |
| `GET` | `/api/assessments/{id}` | JWT | Get single assessment by ID |

See `docs/api_documentation.md` for full request/response schemas.
