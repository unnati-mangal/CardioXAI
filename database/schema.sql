-- CardioXAI — Supabase / PostgreSQL schema
-- Run this in your Supabase SQL editor (Dashboard → SQL Editor → New query)
-- after enabling the uuid-ossp extension (already enabled on Supabase by default).

-- ── Extension ────────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Assessments table ────────────────────────────────────────────────────────
-- Stores one row per prediction submission.
-- user_id is a UUID string that matches auth.users.id (Supabase Auth).
-- We use TEXT not UUID so the RLS policy reference works without a cast.

CREATE TABLE IF NOT EXISTS public.assessments (
    id                      BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id                 UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- ── 13 Framingham input fields ────────────────────────────────────────
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

    -- ── Prediction result ─────────────────────────────────────────────────
    prediction_probability  DOUBLE PRECISION,          -- 0–1 risk score
    prediction_label        TEXT,                       -- "Low Risk" | "Elevated Risk"
    model_version           TEXT,
    threshold_used          DOUBLE PRECISION,
    is_stub                 BOOLEAN NOT NULL DEFAULT TRUE  -- TRUE until ML phase returns a score
);

-- Index for fast per-user queries (dashboard history)
CREATE INDEX IF NOT EXISTS assessments_user_id_idx
    ON public.assessments (user_id, created_at DESC);
