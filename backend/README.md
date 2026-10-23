# CardioXAI Backend

Starter API built with FastAPI.

## Run locally
From the `backend` directory:
```bash
python -m venv .venv
# Windows: .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

The prediction, authentication, persistence, and explanation services are placeholders and must be implemented before use.
