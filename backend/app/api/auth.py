"""
auth.py — Auth-related helpers for the CardioXAI API.

Authentication is handled entirely by Supabase on the client side.
The frontend uses @supabase/supabase-js to manage sign-in, sign-up,
and session refresh. The backend never issues or stores its own tokens.

This module is reserved for any future server-side auth endpoints
(e.g. admin-level user management). For now, all JWT verification
is handled by the reusable dependency in app.core.security:

    from app.core.security import get_user_id
    user_id: str = Depends(get_user_id)

That dependency:
1. Extracts the Bearer token from the Authorization header.
2. Tries local HS256 verification using SUPABASE_JWT_SECRET.
3. Falls back to the Supabase Auth API (/auth/v1/user) if local
   verification fails or the secret is not configured.
"""
