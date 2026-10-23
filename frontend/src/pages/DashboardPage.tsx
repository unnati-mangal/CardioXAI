import { useEffect, useState } from 'react';
import { Info } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import WelcomeSection from '../components/dashboard/WelcomeSection';
import AssessmentSummary from '../components/dashboard/AssessmentSummary';
import RecentAssessments from '../components/dashboard/RecentAssessments';
import Disclaimer from '../components/common/Disclaimer';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { getAssessments } from '../services/assessmentService';
import { ApiError } from '../services/api';
import type { Assessment } from '../types/assessment';

export default function DashboardPage() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchAssessments() {
      try {
        const data = await getAssessments();
        if (!cancelled) setAssessments(data);
      } catch (err) {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 401) {
          // Session expired or backend not yet running — show a soft message
          setError('Could not connect to the backend. Start the FastAPI server to load assessments.');
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unexpected error occurred while loading assessments.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchAssessments();
    return () => { cancelled = true; };
  }, []);

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-5">

        {/* Welcome + CTA */}
        <WelcomeSection />

        {/* Stat cards */}
        <AssessmentSummary assessments={assessments} />

        {/* Backend offline / error notice */}
        {error && !loading && (
          <div className="flex items-start gap-3 bg-white rounded-2xl border border-neutral-100 p-4 text-sm text-neutral-500">
            <Info className="w-4 h-4 text-neutral-400 flex-shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="flex justify-center py-10">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {/* Recent assessments list */}
        {!loading && (
          <RecentAssessments assessments={assessments} />
        )}

        {/* Model info card */}
        <div className="bg-white rounded-2xl border border-neutral-100 p-6">
          <h2 className="font-semibold text-neutral-800 mb-3">About This Model</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-xs text-neutral-400 mb-1">Model Type</p>
              <p className="font-medium text-neutral-700">Logistic Regression</p>
            </div>
            <div>
              <p className="text-xs text-neutral-400 mb-1">Training Data</p>
              <p className="font-medium text-neutral-700">Framingham Heart Study</p>
            </div>
            <div>
              <p className="text-xs text-neutral-400 mb-1">Explainability</p>
              <p className="font-medium text-neutral-700">SHAP + LIME (coming soon)</p>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <Disclaimer />

      </div>
    </DashboardLayout>
  );
}
