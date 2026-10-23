"""
Application configuration — reads from environment variables.
Copy backend/.env.example to backend/.env and fill in your values.
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env from the backend directory (one level above app/)
_env_path = Path(__file__).parent.parent.parent / ".env"
load_dotenv(_env_path)


def _require(key: str) -> str:
    """Read an env var; return empty string (not an exception) so startup works
    even without credentials — endpoints will return 503 instead of crashing."""
    return os.getenv(key, "")


# ── Model ─────────────────────────────────────────────────────────────────────
MODEL_DIR = Path(os.getenv("MODEL_DIR", str(Path(__file__).parent.parent.parent.parent / "model" / "artifacts")))
PIPELINE_PATH      = MODEL_DIR / "pipeline.joblib"
FEATURE_NAMES_PATH = MODEL_DIR / "feature_names.json"
METADATA_PATH      = MODEL_DIR / "metadata.json"

# ── Supabase ──────────────────────────────────────────────────────────────────
SUPABASE_URL              = _require("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = _require("SUPABASE_SERVICE_ROLE_KEY")
SUPABASE_ANON_KEY         = _require("SUPABASE_ANON_KEY")     # used as apikey for auth/v1 calls
SUPABASE_JWT_SECRET       = _require("SUPABASE_JWT_SECRET")   # used to verify JWTs locally

# ── CORS ──────────────────────────────────────────────────────────────────────
# Comma-separated list of allowed origins, e.g.:
#   CORS_ORIGINS=http://localhost:5173,https://your-app.vercel.app
_raw_cors = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:4173")
CORS_ORIGINS: list[str] = [o.strip() for o in _raw_cors.split(",") if o.strip()]

# ── Research threshold ────────────────────────────────────────────────────────
# Read from metadata.json if available; fall back to the research-reported value.
# This is NOT a clinically validated cutoff.
DEFAULT_THRESHOLD: float = float(os.getenv("PREDICTION_THRESHOLD", "0.1684"))
