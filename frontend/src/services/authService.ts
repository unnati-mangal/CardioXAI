import { supabase } from '../lib/supabase';

/**
 * Wraps Supabase Auth SDK calls with consistent typed return values.
 * Components should prefer useAuth() for reactive state.
 * Use authService directly where the hook context is unavailable.
 *
 * All functions guard against supabase being null (unconfigured environment)
 * and return a descriptive error string instead of throwing.
 */

const NOT_CONFIGURED = 'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to frontend/.env.';

export async function signInWithEmail(
  email: string,
  password: string,
): Promise<{ error: string | null }> {
  if (!supabase) return { error: NOT_CONFIGURED };
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return { error: error?.message ?? null };
}

export async function signUpWithEmail(
  email: string,
  password: string,
): Promise<{ error: string | null }> {
  if (!supabase) return { error: NOT_CONFIGURED };
  const { error } = await supabase.auth.signUp({ email, password });
  return { error: error?.message ?? null };
}

export async function signOut(): Promise<void> {
  if (!supabase) return;
  await supabase.auth.signOut();
}

export async function getSession() {
  if (!supabase) return { session: null, error: NOT_CONFIGURED };
  const { data, error } = await supabase.auth.getSession();
  return { session: data.session, error: error?.message ?? null };
}
