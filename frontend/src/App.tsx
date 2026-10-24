import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth.tsx';

import LandingPage         from './pages/LandingPage';
import AuthPage            from './pages/AuthPage';
import DashboardPage       from './pages/DashboardPage';
import PredictionPage      from './pages/PredictionPage';
import PastAssessmentsPage from './pages/PastAssessmentsPage';

function FullScreenSpinner() {
  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div
          className="w-10 h-10 rounded-full border-4 border-brand-green-light border-t-brand-green animate-spin"
          role="status"
          aria-label="Loading"
        />
        <p className="text-sm text-brand-muted">Loading…</p>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <FullScreenSpinner />;
  if (!user)   return <Navigate to="/auth" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/"    element={<LandingPage />} />
      <Route path="/auth" element={<AuthPage />} />

      <Route path="/dashboard" element={
        <ProtectedRoute><DashboardPage /></ProtectedRoute>
      } />
      <Route path="/predict" element={
        <ProtectedRoute><PredictionPage /></ProtectedRoute>
      } />
      <Route path="/assessments" element={
        <ProtectedRoute><PastAssessmentsPage /></ProtectedRoute>
      } />

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
