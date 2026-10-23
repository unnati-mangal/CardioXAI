import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth.tsx';

// Existing page stubs — files are not modified, only imported
import LandingPage    from './pages/LandingPage';
import AuthPage       from './pages/AuthPage';
import DashboardPage  from './pages/DashboardPage';
import PredictionPage from './pages/PredictionPage';

// Full-screen loading spinner — shown while Supabase restores the session (Option A)
function FullScreenSpinner() {
  return (
    <div className="min-h-screen bg-off-white flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div
          className="w-10 h-10 rounded-full border-4 border-sage-green border-t-forest-green animate-spin"
          role="status"
          aria-label="Loading"
        />
        <p className="text-sm text-neutral-500 font-sans">Loading…</p>
      </div>
    </div>
  );
}

// Redirects unauthenticated users to /auth; shows spinner while session is loading
function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return <FullScreenSpinner />;
  if (!user)   return <Navigate to="/auth" replace />;

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/"     element={<LandingPage />} />
      <Route path="/auth" element={<AuthPage />} />

      {/* Protected routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/predict"
        element={
          <ProtectedRoute>
            <PredictionPage />
          </ProtectedRoute>
        }
      />

      {/* Fallback — redirect unknown paths to landing */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
