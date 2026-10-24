import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.tsx';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import {
  validateEmail,
  validatePassword,
  validateConfirmPassword,
} from '../utils/validation';

type Tab = 'login' | 'signup';

interface FormErrors {
  email?:           string | null;
  password?:        string | null;
  confirmPassword?: string | null;
}

export default function AuthPage() {
  const { user, signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const [tab,             setTab]             = useState<Tab>('login');
  const [email,           setEmail]           = useState('');
  const [password,        setPassword]        = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors,          setErrors]          = useState<FormErrors>({});
  const [submitError,     setSubmitError]     = useState<string | null>(null);
  const [submitSuccess,   setSubmitSuccess]   = useState<string | null>(null);
  const [loading,         setLoading]         = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (user) navigate('/dashboard', { replace: true });
  }, [user, navigate]);

  const switchTab = (next: Tab) => {
    setTab(next);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setErrors({});
    setSubmitError(null);
    setSubmitSuccess(null);
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
    setSubmitError(null);
    setSubmitSuccess(null);
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
        setSubmitSuccess(
          'Account created! Check your email to confirm your address, then sign in.',
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-off-white flex flex-col items-center justify-center px-4 py-12">

      {/* Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-neutral-100 p-8">

        {/* Logo + heading */}
        <div className="flex flex-col items-center mb-8">
          <img
            src="/images/logo.svg"
            alt="CardioXAI"
            className="h-10 w-10 mb-3"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
          />
          <h1 className="text-xl font-bold text-forest-green">CardioXAI</h1>
          <p className="text-sm text-neutral-500 mt-1">
            {tab === 'login' ? 'Sign in to your account' : 'Create a new account'}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex rounded-lg bg-neutral-100 p-1 mb-6">
          {(['login', 'signup'] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => switchTab(t)}
              className={[
                'flex-1 py-2 text-sm font-medium rounded-md transition-colors',
                tab === t
                  ? 'bg-white text-forest-green shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-700',
              ].join(' ')}
            >
              {t === 'login' ? 'Sign In' : 'Sign Up'}
            </button>
          ))}
        </div>

        {/* Success message (signup confirmation) */}
        {submitSuccess && (
          <div className="mb-5 rounded-lg bg-sage-green/10 border border-sage-green/30 px-4 py-3 text-sm text-forest-green">
            {submitSuccess}
          </div>
        )}

        {/* Error message */}
        {submitError && (
          <div className="mb-5 rounded-lg bg-muted-coral/10 border border-muted-coral/30 px-4 py-3 text-sm text-muted-coral">
            {submitError}
          </div>
        )}

        {/* Form */}
        {!submitSuccess && (
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            <Input
              id="email"
              label="Email address"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setErrors((prev) => ({ ...prev, email: validateEmail(email) }))}
              error={errors.email}
            />

            <Input
              id="password"
              label="Password"
              type="password"
              autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
              placeholder={tab === 'login' ? '••••••••' : 'Minimum 8 characters'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => setErrors((prev) => ({
                ...prev,
                password: tab === 'login'
                  ? (password ? null : 'Password is required.')
                  : validatePassword(password),
              }))}
              error={errors.password}
              helperText={tab === 'signup' ? 'Must be at least 8 characters.' : undefined}
            />

            {tab === 'signup' && (
              <Input
                id="confirmPassword"
                label="Confirm password"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onBlur={() => setErrors((prev) => ({
                  ...prev,
                  confirmPassword: validateConfirmPassword(password, confirmPassword),
                }))}
                error={errors.confirmPassword}
              />
            )}

            <Button
              type="submit"
              variant="primary"
              loading={loading}
              fullWidth
              className="mt-2"
            >
              {tab === 'login' ? 'Sign In' : 'Create Account'}
            </Button>
          </form>
        )}

        {/* Show sign-in link after successful signup */}
        {submitSuccess && (
          <Button variant="secondary" fullWidth onClick={() => switchTab('login')}>
            Go to Sign In
          </Button>
        )}
      </div>

      {/* Back to home */}
      <Link
        to="/"
        className="mt-6 text-sm text-neutral-400 hover:text-neutral-600 transition-colors"
      >
        ← Back to Home
      </Link>

    </div>
  );
}
