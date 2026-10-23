"""
JWT verification for Supabase-issued tokens.

Supports both legacy HS256 JWT secret and new Supabase key formats.
If SUPABASE_JWT_SECRET is set, verifies locally with PyJWT.
Falls back to verifying against the Supabase Auth API (getUser) which
works with all key formats including the new sb_publishable_ / sb_secret_ scheme.
"""

import logging
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.config import SUPABASE_JWT_SECRET, SUPABASE_URL, SUPABASE_ANON_KEY

logger = logging.getLogger(__name__)

_bearer = HTTPBearer(auto_error=True)


def _verify_via_supabase_api(token: str) -> dict:
    """
    Verify a JWT by calling Supabase Auth /auth/v1/user with the token.
    This works with ALL Supabase key formats (legacy and new sb_ format).
    Returns the user payload dict, or raises HTTPException on failure.
    """
    import httpx

    if not SUPABASE_URL:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Supabase is not configured on this server. Set SUPABASE_URL in backend/.env.",
        )

    try:
        with httpx.Client(timeout=8) as client:
            resp = client.get(
                f"{SUPABASE_URL}/auth/v1/user",
                headers={
                    "Authorization": f"Bearer {token}",
                    "apikey": SUPABASE_ANON_KEY or token,
                },
            )

        if resp.status_code == 200:
            user = resp.json()
            # Return a payload-like dict with sub = user id
            return {"sub": user.get("id"), "email": user.get("email")}

        if resp.status_code in (401, 403):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Session expired or invalid. Please sign in again.",
            )

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not verify authentication token.",
        )

    except HTTPException:
        raise
    except Exception as exc:
        logger.warning("Supabase token verification failed: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not verify authentication token.",
        )


def _verify_via_jwt(token: str) -> Optional[dict]:
    """
    Try local HS256 verification with SUPABASE_JWT_SECRET.
    Returns payload on success, None if verification fails so caller
    can fall back to the Supabase API method.
    """
    if not SUPABASE_JWT_SECRET:
        return None

    try:
        import jwt
        payload = jwt.decode(
            token,
            SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            options={"verify_aud": False},
        )
        return payload
    except Exception:
        return None


def verify_token(
    credentials: HTTPAuthorizationCredentials = Depends(_bearer),
) -> dict:
    """
    FastAPI dependency — verifies the Supabase JWT.

    Strategy:
    1. Try local HS256 verification with SUPABASE_JWT_SECRET (fast, no network).
    2. If that fails or secret not set, verify via Supabase Auth API (always works).
    """
    token = credentials.credentials

    # Try local verification first
    payload = _verify_via_jwt(token)
    if payload:
        return payload

    # Fall back to Supabase API verification
    return _verify_via_supabase_api(token)


def get_user_id(payload: dict = Depends(verify_token)) -> str:
    """
    FastAPI dependency — returns the authenticated user's UUID.
    """
    user_id: Optional[str] = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token does not contain a user identity.",
        )
    return user_id
