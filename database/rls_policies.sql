-- CardioXAI — Row Level Security (RLS) policies
-- Run this after schema.sql in your Supabase SQL editor.

-- ── Enable RLS on assessments ────────────────────────────────────────────────
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;

-- ── Policies ─────────────────────────────────────────────────────────────────

-- Users may only SELECT rows that belong to them
CREATE POLICY "Users can read own assessments"
    ON public.assessments
    FOR SELECT
    USING (auth.uid() = user_id);

-- The backend uses the service-role key to INSERT on behalf of the user,
-- so we allow insert when the row's user_id matches the authenticated user.
-- (Service-role key bypasses RLS, but this policy protects direct client access.)
CREATE POLICY "Users can insert own assessments"
    ON public.assessments
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users may not UPDATE or DELETE — all mutations go through the backend
-- which uses the service-role key and validates ownership in application code.

-- ── Grant access to authenticated role ───────────────────────────────────────
GRANT SELECT, INSERT ON public.assessments TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE assessments_id_seq TO authenticated;
