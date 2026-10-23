# CardioXAI

**Hybrid Explainable AI for Heart Disease Prediction**

> ⚠️ Research prototype. Not a medical device. Not validated for clinical use. Always consult a qualified healthcare professional.

---

## Overview

CardioXAI is a research-oriented web application that estimates an individual's 10-year coronary heart disease (CHD) risk using the Framingham Heart Study dataset and a Logistic Regression model. It uses SHAP and LIME to explain individual predictions.

| Layer | Technology |
|---|---|
| Frontend | React + Vite + TypeScript + Tailwind CSS + Recharts |
| Backend | Python + FastAPI + Pydantic |
| Database / Auth | Supabase (PostgreSQL + Auth) |
| ML | Scikit-learn Logistic Regression + SHAP + LIME |

---

## Project Structure

```
CardioXAI/
├── frontend/          React + Vite + TypeScript app
├── backend/           FastAPI Python API
├── model/
│   ├── artifacts/     Place pipeline.joblib, feature_names.json, metadata.json here
│   └── train_and_export.py  (ML training script — run once to generate artifacts)
├── database/
│   ├── schema.sql     Run in Supabase SQL Editor
│   └── rls_policies.sql
└── research/          Notebooks and documentation
```

---

## Quick Start

### Prerequisites

- Node.js ≥ 18
- Python ≥ 3.11
- A Supabase project (free tier works)

---

### 1. Supabase Setup

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. In the SQL Editor, run **`database/schema.sql`** then **`database/rls_policies.sql`**.
3. Go to **Authentication → Providers** and ensure Email is enabled.
4. Collect these values from **Settings → API**:
   - Project URL (`SUPABASE_URL`)
   - `anon` public key (`SUPABASE_ANON_KEY`)
   - `service_role` secret key (`SUPABASE_SERVICE_ROLE_KEY`)
   - JWT Secret (`SUPABASE_JWT_SECRET`) — under Settings → API → JWT Settings

---

### 2. Frontend Setup

```powershell
cd frontend
Copy-Item .env.example .env
# Edit frontend\.env and fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
npm install
npm run dev
```

Frontend runs at **http://localhost:5173**

---

### 3. Backend Setup

```powershell
cd backend
Copy-Item .env.example .env
# Edit backend\.env and fill in SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_JWT_SECRET
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Backend runs at **http://localhost:8000**
API docs at **http://localhost:8000/api/docs**

---

### 4. ML Model Setup

The backend will start without the model and return `status: "ml_not_ready"` for predictions. To connect the real model:

1. Obtain the trained pipeline artifacts from your research:
   - `pipeline.joblib` — the fitted sklearn Pipeline (imputer + scaler + LR)
   - `feature_names.json` — `["age","male","cigsPerDay","BPMeds","prevalentStroke","prevalentHyp","diabetes","totChol","sysBP","diaBP","BMI","heartRate","glucose"]`
   - `metadata.json` — threshold, model version, positive class index

2. Place them in `model/artifacts/`.

3. Restart the backend: `uvicorn app.main:app --reload`

4. Visit `http://localhost:8000/api/health` — `model_ready` should be `true`.

---

## Environment Variables

### `frontend/.env`

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `VITE_API_BASE_URL` | Backend URL (default: `http://localhost:8000`) |

### `backend/.env`

| Variable | Description |
|---|---|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Service-role key (server-side only, never expose to frontend) |
| `SUPABASE_JWT_SECRET` | JWT secret for token verification (Settings → API → JWT Settings) |
| `CORS_ORIGINS` | Comma-separated allowed frontend origins |
| `MODEL_DIR` | Path to `model/artifacts/` directory (optional, has a default) |
| `PREDICTION_THRESHOLD` | Classification threshold (default: `0.1684`) |

---

## Pages

| Page | Route | Auth Required |
|---|---|---|
| Landing | `/` | No |
| Sign In / Sign Up | `/auth` | No |
| Dashboard | `/dashboard` | Yes |
| Prediction + Results | `/predict` | Yes |

---

## API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/health` | No | Backend + model health check |
| `POST` | `/api/predict` | JWT | Run prediction + get SHAP/LIME |
| `GET` | `/api/assessments` | JWT | List user's assessment history |
| `GET` | `/api/assessments/{id}` | JWT | Get single assessment |

---

## Research Metrics (Reported — Do Not Display as Personal Results)

| Metric | Value |
|---|---|
| OOF ROC-AUC | 0.7300 |
| OOF PR-AUC | 0.3503 |
| OOF Brier Score | 0.1159 |
| Held-out ROC-AUC | 0.6993 |
| Held-out Sensitivity | 56.6% |
| Held-out Specificity | 73.3% |
| Classification Threshold | 0.1684 (OOF F1-optimal, not clinical) |

---

## Security Notes

- The `SUPABASE_SERVICE_ROLE_KEY` and `SUPABASE_JWT_SECRET` are **never** sent to or stored in the frontend.
- The backend verifies every JWT from the `Authorization: Bearer` header before accessing any protected data.
- Supabase RLS ensures each user can only read their own assessment rows.
- Never commit `.env` files.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `model_ready: false` on `/api/health` | Place `pipeline.joblib` in `model/artifacts/` and restart backend |
| CORS error from frontend | Add your frontend origin to `CORS_ORIGINS` in `backend/.env` |
| `Authentication is not configured` | Set `SUPABASE_JWT_SECRET` in `backend/.env` |
| `Supabase is not configured` on frontend | Fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `frontend/.env` |
| 401 on assessment fetch | Session expired — sign out and sign back in |
| Assessment not saving | Check `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `backend/.env` |
