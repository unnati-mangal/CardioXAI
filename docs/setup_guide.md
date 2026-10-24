# CardioXAI — Setup Guide

> **Research prototype only.** Not a clinical diagnostic tool. Built on the
> Framingham Heart Study dataset for academic purposes.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Project Structure](#2-project-structure)
3. [Supabase Setup](#3-supabase-setup)
4. [Backend Setup](#4-backend-setup)
5. [ML Model Artifacts](#5-ml-model-artifacts)
6. [Frontend Setup](#6-frontend-setup)
7. [Running the App](#7-running-the-app)
8. [Environment Variables Reference](#8-environment-variables-reference)
9. [Common Errors & Fixes](#9-common-errors--fixes)

---

## 1. Prerequisites

| Tool | Minimum Version | Purpose |
|------|----------------|---------|
| Python | 3.11+ | Backend / ML |
| Node.js | 18+ | Frontend (React + Vite) |
| Git | any | Version control |
| Supabase account | — | Auth + database |

---

## 2. Project Structure

```
CardioXAI/
├── backend/                  # FastAPI app + ML pipeline
│   ├── .env                  # ← you create this (see §8)
│   ├── requirements.txt
│   └── app/
│       ├── main.py           # FastAPI entry point
│       ├── api/              # Route handlers
│       ├── core/             # Config + security (JWT)
│       ├── ml/               # Model loading, SHAP, LIME
│       ├── schemas/          # Pydantic request/response models
│       └── services/         # Business logic
├── frontend/                 # React + Vite + Tailwind
│   ├── .env                  # ← you create this (see §8)
│   └── src/
├── model/
│   └── artifacts/            # ← place pipeline.joblib here (see §5)
│       ├── pipeline.joblib
│       ├── feature_names.json
│       └── metadata.json
└── database/
    ├── schema.sql            # Run in Supabase SQL editor
    └── rls_policies.sql      # Run in Supabase SQL editor
```

---

## 3. Supabase Setup

### 3a. Create a project

1. Go to [supabase.com](https://supabase.com) → **New Project**
2. Choose a region close to you and set a strong database password

### 3b. Run the database schema

In your Supabase project → **SQL Editor** → **New query**, paste and run:

```sql
-- 1. Schema (creates the assessments table)
-- Copy contents of database/schema.sql
```

Then in a second query:

```sql
-- 2. Row-Level Security policies
-- Copy contents of database/rls_policies.sql
```

> ⚠️ The app **will not save assessments** until this step is completed. The
> dashboard will show a spinner forever if the table doesn't exist.

### 3c. Collect your credentials

Go to **Project Settings → API** and note down:

| Key | Where to find it |
|-----|-----------------|
| `SUPABASE_URL` | Project URL (e.g. `https://xxxx.supabase.co`) |
| `SUPABASE_ANON_KEY` | `anon` / `public` key |
| `SUPABASE_SERVICE_ROLE_KEY` | `service_role` key (keep secret!) |
| `SUPABASE_JWT_SECRET` | Project Settings → API → JWT Settings → JWT Secret |

---

## 4. Backend Setup

```bash
# 1. Navigate to the backend folder
cd backend

# 2. Create a virtual environment
python -m venv venv

# 3. Activate it
# Windows:
venv\Scripts\activate
# macOS / Linux:
source venv/bin/activate

# 4. Install dependencies
pip install -r requirements.txt
```

> **Important:** `scikit-learn` is pinned to `==1.6.1`. The saved pipeline was
> trained with that version. Installing a different version will cause an
> `AttributeError: 'SimpleImputer' object has no attribute '_fill_dtype'` on
> load.

### 4a. Create backend/.env

Create a file at `backend/.env` (never commit this):

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret

# Optional — override default prediction threshold (default: 0.1684)
# PREDICTION_THRESHOLD=0.1684

# Optional — override model artifacts directory
# MODEL_DIR=../model/artifacts
```

---

## 5. ML Model Artifacts

Place three files in `model/artifacts/`:

| File | Description |
|------|-------------|
| `pipeline.joblib` | Trained sklearn Pipeline (imputer → scaler → LogisticRegression) |
| `feature_names.json` | Ordered list of the 13 feature names the model expects |
| `metadata.json` | Model metadata: version string, threshold, training date |

**Example `feature_names.json`:**
```json
["age","male","cigsPerDay","BPMeds","prevalentStroke","prevalentHyp","diabetes","totChol","sysBP","diaBP","BMI","heartRate","glucose"]
```

**Example `metadata.json`:**
```json
{
  "model_version": "1.0.0",
  "threshold": 0.1684,
  "trained_on": "Framingham Heart Study",
  "sklearn_version": "1.6.1"
}
```

> If `pipeline.joblib` is missing, the backend still starts and the frontend
> will display an "inputs received — model not connected" message instead of
> crashing.

---

## 6. Frontend Setup

```bash
# 1. Navigate to the frontend folder
cd frontend

# 2. Install Node dependencies
npm install
```

### 6a. Create frontend/.env

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=http://localhost:8000
```

---

## 7. Running the App

Open **two terminals**:

**Terminal 1 — Backend:**
```bash
cd backend
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux
uvicorn app.main:app --reload --port 8000
```

Expected output:
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Application startup complete.
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

Expected output:
```
  VITE v5.x.x  ready in xxx ms
  ➜  Local:   http://localhost:5173/
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 7a. Verify the backend

Visit [http://localhost:8000/api/health](http://localhost:8000/api/health). You should see:

```json
{
  "status": "ok",
  "model_ready": true,
  "model_version": "1.0.0"
}
```

If `model_ready` is `false`, the pipeline artifacts are missing or in the wrong folder.

---

## 8. Environment Variables Reference

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `SUPABASE_URL` | ✅ | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | ✅ | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Service role key (server-side only) |
| `SUPABASE_JWT_SECRET` | ✅ | JWT secret for local token verification |
| `MODEL_DIR` | Optional | Path to model artifacts (default: `../model/artifacts`) |
| `PREDICTION_THRESHOLD` | Optional | Classification threshold (default: `0.1684`) |
| `CORS_ORIGINS` | Optional | Comma-separated allowed origins (default: `http://localhost:5173`) |

### Frontend (`frontend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SUPABASE_URL` | ✅ | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | ✅ | Supabase anon/public key |
| `VITE_API_URL` | ✅ | Backend base URL (default: `http://localhost:8000`) |

---

## 9. Common Errors & Fixes

### `AttributeError: 'SimpleImputer' object has no attribute '_fill_dtype'`
**Cause:** Wrong scikit-learn version.  
**Fix:** `pip install scikit-learn==1.6.1` (must match the version the pipeline was trained on).

---

### Dashboard shows a loading spinner that never stops
**Cause:** The `public.assessments` table does not exist in Supabase.  
**Fix:** Run `database/schema.sql` and `database/rls_policies.sql` in the Supabase SQL Editor.

---

### `401 Unauthorized` from the backend
**Cause:** Missing or expired Supabase session JWT, or `SUPABASE_JWT_SECRET` is wrong.  
**Fix:** Check that `SUPABASE_JWT_SECRET` in `backend/.env` matches the JWT Secret in Supabase → Project Settings → API → JWT Settings. If using new `sb_` key format, the backend will fall back to API verification automatically.

---

### `Could not reach the backend` on the prediction page
**Cause:** The FastAPI server is not running, or CORS is blocking the request.  
**Fix:** Start the server with `uvicorn app.main:app --reload`. Make sure `CORS_ORIGINS` includes `http://localhost:5173`.

---

### Google Sign-In button does nothing
**Cause:** Google OAuth provider is not enabled in Supabase.  
**Fix:** Supabase Dashboard → Authentication → Providers → Google → enable and add your Google OAuth credentials.
