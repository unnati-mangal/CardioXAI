import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Info, HeartPulse, TrendingUp, Calendar, Activity } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import WelcomeSection from '../components/dashboard/WelcomeSection';
import RecentAssessments from '../components/dashboard/RecentAssessments';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { getAssessments } from '../services/assessmentService';
import { ApiError } from '../services/api';
import type { Assessment } from '../types/assessment';
import { formatDate, formatRiskLabel } from '../utils/formatters';

function StatCard({
  icon: Icon,
  iconBg,
  iconColor,
  label,
  value,
  sub,
  valueColor,
}: {
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  label: string;
  value: string | number;
  sub?: string;
  valueColor?: string;
}) {
  return (
    <div className="card p-5 flex items-center gap-4 hover:shadow-sm transition-shadow">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-brand-muted mb-0.5 uppercase tracking-wide">{label}</p>
        <p className={`text-2xl font-bold leading-none ${valueColor ?? 'text-brand-text'}`}>{value}</p>
        {sub && <p className="text-xs text-brand-muted mt-1">{sub}</p>}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const navigate  = useNavigate();
  const { key }   = useLocation();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    let cancelled = false;
    async function fetchAssessments() {
      try {
        const data = await getAssessments();
        if (!cancelled) setAssessments(data);
      } catch (err) {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 401) {
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
  }, [key]);

  // Derived stats
  const total = assessments.length;
  const withProb = assessments.filter((a) => a.prediction_probability !== null);
  const highest = withProb.length > 0
    ? withProb.reduce((a, b) =>
        (a.prediction_probability ?? 0) > (b.prediction_probability ?? 0) ? a : b)
    : null;
  const highestRisk  = highest?.prediction_probability != null
    ? formatRiskLabel(highest.prediction_probability)
    : null;
  const latestDate = assessments[0] ? formatDate(assessments[0].created_at) : '—';

  const highColor =
    highestRisk?.level === 'high'     ? 'text-red-600' :
    highestRisk?.level === 'moderate' ? 'text-amber-600' :
    highestRisk                       ? 'text-brand-green' : undefined;

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">

        {/* ── Welcome banner ── */}
        <WelcomeSection />

        {/* ── Stats row ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            icon={HeartPulse}
            iconBg="bg-brand-green-light"
            iconColor="text-brand-green"
            label="Total Assessments"
            value={total}
            sub={total === 0 ? 'Run your first prediction' : 'View full history →'}
          />
          <StatCard
            icon={TrendingUp}
            iconBg="bg-amber-50"
            iconColor="text-amber-500"
            label="Highest Risk Level"
            value={highestRisk ? highestRisk.label.replace(' Risk', '') : '—'}
            valueColor={highColor}
            sub={highest?.prediction_probability != null
              ? `${(highest.prediction_probability * 100).toFixed(1)}% probability`
              : 'No data yet'}
          />
          <StatCard
            icon={Calendar}
            iconBg="bg-blue-50"
            iconColor="text-blue-500"
            label="Latest Assessment"
            value={latestDate}
            sub={total > 0 ? `${total} total on record` : 'No assessments yet'}
          />
        </div>

        {/* ── Error ── */}
        {error && !loading && (
          <div className="card flex items-start gap-3 p-4 text-sm text-brand-muted">
            <Info className="w-4 h-4 text-brand-muted flex-shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {/* ── Loading ── */}
        {loading && (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {/* ── Two-column: How It Works + Recent Assessments ── */}
        {!loading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

            {/* How CardioXAI Works */}
            <div className="card p-6 flex flex-col">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-xl bg-brand-green-light flex items-center justify-center">
                  <Activity className="w-4 h-4 text-brand-green" />
                </div>
                <h2 className="font-bold text-brand-text">How CardioXAI Works</h2>
              </div>

              <div className="flex flex-col gap-5 flex-1">
                {[
                  {
                    n: '1',
                    title: 'Enter your details',
                    text: 'Fill in your clinical and lifestyle information — age, BP, cholesterol, and more.',
                  },
                  {
                    n: '2',
                    title: 'AI analyses your data',
                    text: 'Our hybrid model uses SHAP & LIME to analyse which factors matter most for you.',
                  },
                  {
                    n: '3',
                    title: 'Understand your risk',
                    text: 'Get a 10-year CHD risk estimate with plain-English explanations and personalised recommendations.',
                  },
                ].map(({ n, title, text }) => (
                  <div key={n} className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-brand-green flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-bold">{n}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-brand-text">{title}</p>
                      <p className="text-xs text-brand-muted mt-0.5 leading-relaxed">{text}</p>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => navigate('/predict')}
                className="btn-primary mt-6 self-start"
              >
                <HeartPulse className="w-4 h-4" />
                Start an Assessment
              </button>
            </div>

            {/* Recent assessments */}
            <RecentAssessments assessments={assessments} />

          </div>
        )}

        {/* ── Quick-tip banner ── */}
        {!loading && total === 0 && (
          <div className="card p-5 flex items-start gap-4 bg-brand-green border-brand-green">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <HeartPulse className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-white mb-0.5">Your heart health journey starts here</p>
              <p className="text-xs text-white/80 leading-relaxed">
                Run your first cardiovascular risk assessment to get AI-powered insights about your heart health —
                explained in plain English, backed by the Framingham Heart Study.
              </p>
            </div>
          </div>
        )}

        {/* ── Disclaimer ── */}
        <p className="text-xs text-brand-muted text-center pb-4">
          ⚠️ This tool is for research purposes only and not a medical diagnosis.
        </p>

      </div>
    </DashboardLayout>
  );
}
