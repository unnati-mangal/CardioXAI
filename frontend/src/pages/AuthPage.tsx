import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.tsx';
import { validateEmail, validatePassword, validateConfirmPassword } from '../utils/validation';

type Tab = 'login' | 'signup';

interface FormErrors {
  email?:           string | null;
  password?:        string | null;
  confirmPassword?: string | null;
}

/* ── Heart + leaves illustration (same style as landing) ─────────── */
function AuthIllustration() {
  return (
    <svg
      viewBox="0 0 280 280"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full max-w-[220px]"
      aria-hidden="true"
    >
      {/* Soft circle bg */}
      <circle cx="140" cy="140" r="128" fill="#B8D9C0" opacity="0.45" />

      {/* Leaf branches */}
      <g opacity="0.82">
        {/* bottom-left */}
        <ellipse cx="72"  cy="210" rx="20" ry="9"  fill="#5A9B68" transform="rotate(-40 72 210)" />
        <ellipse cx="55"  cy="226" rx="18" ry="8"  fill="#6BAF7A" transform="rotate(-55 55 226)" />
        <ellipse cx="43"  cy="244" rx="16" ry="7"  fill="#5A9B68" transform="rotate(-65 43 244)" />
        <line x1="72" y1="210" x2="44" y2="248" stroke="#4A8A58" strokeWidth="1.5" />
        {/* top-right */}
        <ellipse cx="215" cy="88"  rx="20" ry="9"  fill="#5A9B68" transform="rotate(35 215 88)" />
        <ellipse cx="232" cy="72"  rx="18" ry="8"  fill="#6BAF7A" transform="rotate(50 232 72)" />
        <ellipse cx="244" cy="56"  rx="16" ry="7"  fill="#5A9B68" transform="rotate(65 244 56)" />
        <line x1="215" y1="88" x2="243" y2="52" stroke="#4A8A58" strokeWidth="1.5" />
        {/* sides */}
        <ellipse cx="240" cy="145" rx="18" ry="8"  fill="#7ABF88" transform="rotate(15 240 145)" />
        <ellipse cx="252" cy="128" rx="16" ry="7"  fill="#5A9B68" transform="rotate(28 252 128)" />
        <ellipse cx="42"  cy="138" rx="18" ry="8"  fill="#7ABF88" transform="rotate(-15 42 138)" />
        <ellipse cx="30"  cy="122" rx="16" ry="7"  fill="#5A9B68" transform="rotate(-28 30 122)" />
        {/* top-left small */}
        <ellipse cx="96"  cy="62"  rx="14" ry="6"  fill="#6BAF7A" transform="rotate(-45 96 62)" />
        <ellipse cx="83"  cy="51"  rx="12" ry="5"  fill="#5A9B68" transform="rotate(-55 83 51)" />
        {/* bottom-right small */}
        <ellipse cx="192" cy="240" rx="14" ry="6"  fill="#6BAF7A" transform="rotate(45 192 240)" />
        <ellipse cx="206" cy="252" rx="12" ry="5"  fill="#5A9B68" transform="rotate(55 206 252)" />
      </g>

      {/* Salmon heart */}
      <path
        d="M140 212 C105 185 62 162 62 124 C62 100 80 84 102 84 C118 84 133 94 140 107 C147 94 162 84 178 84 C200 84 218 100 218 124 C218 162 175 185 140 212Z"
        fill="#F0907A"
        opacity="0.90"
      />
      {/* Heart highlight */}
      <path d="M100 102 C95 113 93 126 97 138" stroke="white" strokeWidth="3.5" strokeLinecap="round" opacity="0.4" />

      {/* White ECG line */}
      <polyline
        points="84,136 100,136 109,116 120,156 130,136 150,136 159,122 170,150 179,136 198,136"
        stroke="white"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity="0.88"
      />
    </svg>
  );
}

/* ── Page ─────────────────────────────────────────────────────────── */

export default function AuthPage() {
  const { user, signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const [tab,             setTab]             = useState<Tab>('login');
  const [email,           setEmail]           = useState('');
  const [password,        setPassword]        = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass,        setShowPass]        = useState(false);
  const [errors,          setErrors]          = useState<FormErrors>({});
  const [submitError,     setSubmitError]     = useState<string | null>(null);
  const [submitSuccess,   setSubmitSuccess]   = useState<string | null>(null);
  const [loading,         setLoading]         = useState(false);

  useEffect(() => {
    if (user) navigate('/dashboard', { replace: true });
  }, [user, navigate]);

  const switchTab = (next: Tab) => {
    setTab(next);
    setEmail(''); setPassword(''); setConfirmPassword('');
    setErrors({}); setSubmitError(null); setSubmitSuccess(null);
  };

  const validateForm = (): boolean => {
    const next: FormErrors = {
      email:    validateEmail(email),
      password: tab === 'login'
        ? (password ? null : 'Password is required.')
        : validatePassword(password),
      confirmPassword: tab === 'signup'
        ? validateConfirmPassword(password, confirmPassword)
        : null,
    };
    setErrors(next);
    return !next.email && !next.password && !next.confirmPassword;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null); setSubmitSuccess(null);
    if (!validateForm()) return;
    setLoading(true);
    try {
      if (tab === 'login') {
        const { error } = await signIn(email, password);
        if (error) { setSubmitError(error); return; }
        navigate('/dashboard', { replace: true });
      } else {
        const { error } = await signUp(email, password);
        if (error) { setSubmitError(error); return; }
        setSubmitSuccess('Account created! Check your email to confirm, then sign in.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7F4] flex items-center justify-center px-4 py-10">

      {/*
        ── Two-panel card ────────────────────────────────────────────
        Left:  green illustration panel
        Right: form panel
        On mobile they stack vertically (left on top).
      */}
      <div className="w-full max-w-[820px] bg-white rounded-2xl border border-[#DDE8DD] shadow-sm overflow-hidden flex flex-col md:flex-row">

        {/* ── LEFT PANEL — illustration ─────────────────────── */}
        <div className="md:w-[340px] flex-shrink-0 bg-[#EDF5EE] flex flex-col items-center justify-center px-8 py-10 gap-5">

          {/* Heading */}
          <div className="text-center">
            <h2 className="text-2xl font-extrabold text-[#1C2B22] mb-2">
              {tab === 'login' ? 'Welcome Back!' : 'Join CardioXAI'}
            </h2>
            <p className="text-sm text-[#4A6655] leading-relaxed">
              {tab === 'login'
                ? 'Log in to continue your journey towards better heart health.'
                : 'Sign up to start your heart health journey today.'
              }
            </p>
          </div>

          {/* Illustration */}
          <div className="flex items-center justify-center w-full">
            <AuthIllustration />
          </div>

          {/* Quote */}
          <p className="text-sm text-[#3D7A5A] italic font-medium text-center">
            "Small steps today,<br />healthier tomorrow."
          </p>
        </div>

        {/* ── RIGHT PANEL — form ────────────────────────────── */}
        <div className="flex-1 flex flex-col">

          {/* Tab bar at the very top */}
          <div className="flex border-b border-[#DDE8DD]">
            {(['login', 'signup'] as Tab[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => switchTab(t)}
                className={[
                  'flex-1 py-4 text-sm font-semibold transition-colors relative',
                  tab === t
                    ? 'text-[#2A5940]'
                    : 'text-[#8A9E92] hover:text-[#1C2B22]',
                ].join(' ')}
              >
                {t === 'login' ? 'Log In' : 'Sign Up'}
                {/* Active underline */}
                {tab === t && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#2A5940] rounded-t" />
                )}
              </button>
            ))}
          </div>

          {/* Form body */}
          <div className="flex-1 px-8 py-8">

            <h3 className="text-lg font-bold text-[#1C2B22] mb-0.5">
              {tab === 'login' ? 'Log In' : 'Sign Up'}
            </h3>
            <p className="text-xs text-[#7A9585] mb-6">Enter your details to continue</p>

            {/* Alerts */}
            {submitSuccess && (
              <div className="mb-4 rounded-lg bg-[#EDF5EE] border border-[#B8D9C0] px-4 py-3 text-sm text-[#2A5940]">
                {submitSuccess}
              </div>
            )}
            {submitError && (
              <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                {submitError}
              </div>
            )}

            {!submitSuccess && (
              <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">

                {/* Email */}
                <div className="flex flex-col gap-1">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A9E92] pointer-events-none" />
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onBlur={() => setErrors((p) => ({ ...p, email: validateEmail(email) }))}
                      className={`w-full rounded-lg border pl-9 pr-3 py-2.5 text-sm bg-white text-[#1C2B22]
                        placeholder:text-[#A8B8AD] focus:outline-none focus:ring-2
                        ${errors.email
                          ? 'border-red-300 focus:ring-red-200'
                          : 'border-[#DDE8DD] focus:ring-[#B8D9C0] focus:border-[#3D7A5A]'
                        } transition-colors`}
                    />
                  </div>
                  {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                </div>

                {/* Password */}
                <div className="flex flex-col gap-1">
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A9E92] pointer-events-none" />
                    <input
                      id="password"
                      type={showPass ? 'text' : 'password'}
                      autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onBlur={() => setErrors((p) => ({
                        ...p,
                        password: tab === 'login'
                          ? (password ? null : 'Password is required.')
                          : validatePassword(password),
                      }))}
                      className={`w-full rounded-lg border pl-9 pr-10 py-2.5 text-sm bg-white text-[#1C2B22]
                        placeholder:text-[#A8B8AD] focus:outline-none focus:ring-2
                        ${errors.password
                          ? 'border-red-300 focus:ring-red-200'
                          : 'border-[#DDE8DD] focus:ring-[#B8D9C0] focus:border-[#3D7A5A]'
                        } transition-colors`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass((v) => !v)}
                      tabIndex={-1}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A9E92] hover:text-[#1C2B22]"
                    >
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
                  {tab === 'login' && !errors.password && (
                    <button
                      type="button"
                      className="text-xs text-[#3D7A5A] self-end hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>

                {/* Confirm Password — signup only */}
                {tab === 'signup' && (
                  <div className="flex flex-col gap-1">
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A9E92] pointer-events-none" />
                      <input
                        id="confirmPassword"
                        type="password"
                        autoComplete="new-password"
                        placeholder="Confirm password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        onBlur={() => setErrors((p) => ({
                          ...p,
                          confirmPassword: validateConfirmPassword(password, confirmPassword),
                        }))}
                        className={`w-full rounded-lg border pl-9 pr-3 py-2.5 text-sm bg-white text-[#1C2B22]
                          placeholder:text-[#A8B8AD] focus:outline-none focus:ring-2
                          ${errors.confirmPassword
                            ? 'border-red-300 focus:ring-red-200'
                            : 'border-[#DDE8DD] focus:ring-[#B8D9C0] focus:border-[#3D7A5A]'
                          } transition-colors`}
                      />
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-xs text-red-500">{errors.confirmPassword}</p>
                    )}
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#2A5940] hover:bg-[#1e4530] text-white text-sm font-semibold
                             rounded-lg py-3 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading
                    ? (tab === 'login' ? 'Signing in…' : 'Creating account…')
                    : (tab === 'login' ? 'Log In' : 'Create Account')
                  }
                </button>

                {/* Divider */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-[#DDE8DD]" />
                  <span className="text-xs text-[#8A9E92]">OR</span>
                  <div className="flex-1 h-px bg-[#DDE8DD]" />
                </div>

                {/* Google button */}
                <button
                  type="button"
                  className="w-full flex items-center justify-center gap-2 rounded-lg border border-[#DDE8DD]
                             bg-white px-4 py-2.5 text-sm text-[#1C2B22] hover:bg-[#F4F7F4] transition-colors"
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
                    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
                    <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
                    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
                  </svg>
                  Continue with Google
                </button>

              </form>
            )}

            {submitSuccess && (
              <button
                className="w-full bg-[#2A5940] text-white text-sm font-semibold rounded-lg py-3 hover:bg-[#1e4530] transition-colors"
                onClick={() => switchTab('login')}
              >
                Go to Sign In
              </button>
            )}

            {/* Footer switch */}
            <p className="text-xs text-[#7A9585] text-center mt-6">
              {tab === 'login' ? (
                <>Don't have an account?{' '}
                  <button onClick={() => switchTab('signup')} className="text-[#2A5940] font-semibold hover:underline">
                    Sign Up
                  </button>
                </>
              ) : (
                <>Already have an account?{' '}
                  <button onClick={() => switchTab('login')} className="text-[#2A5940] font-semibold hover:underline">
                    Log In
                  </button>
                </>
              )}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
