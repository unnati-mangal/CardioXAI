import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ClipboardList, HeartPulse, TrendingUp, CalendarDays, Plus } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { getAssessments } from '../services/assessmentService';
import { ApiError } from '../services/api';
import type { Assessment } from '../types/assessment';
import { formatDate, formatRiskLabel } from '../utils/formatters';

function RiskBadge({ prob }: { prob: number | null }) {
  if (prob === null) return (
    <span className="text-xs px-3 py-1 rounded-full bg-neutral-100 text-brand-muted font-medium">Pending</span>
  );
  const r = formatRiskLabel(prob);
  const cls =
    r.level === 'high'     ? 'bg-red-50 text-red-600 border border-red-100' :
    r.level === 'moderate' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                             'bg-brand-green-light text-brand-green border border-brand-border';
  return (
    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${cls}`}>
      {r.label}
    </span>
  );
}

function RiskBar({ prob }: { prob: number | null }) {
  if (prob === null) return null;
  const pct = Math.round(prob * 100);
  const color =
    pct > 30  ? 'bg-red-500' :
    pct > 15  ? 'bg-amber-400' :
               'bg-brand-green';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-brand-bg rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
      <span className="text-xs font-semibold text-brand-text w-10 text-right">{pct}%</span>
    </div>
  );
}

export default function PastAssessmentsPage() {
  const navigate  = useNavigate();
  const { key }   = useLocation();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    let cancelled = false;
    async function fetch() {
      try {
        const data = await getAssessments();
        if (!cancelled) setAssessments(data);
      } catch (err) {
        if (cancelled) return;
        if (err instanceof ApiError) {
          setError('Could not connect to the backend. Start the FastAPI server.');
        } else if (err instanceof Error) {
          setError(err.message);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetch();
    return () => { cancelled = true; };
  }, [key]);

  const total    = assessments.length;
  const withProb = assessments.filter((a) => a.prediction_probability !== null);
  const avgRisk  = withProb.length > 0
    ? withProb.reduce((s, a) => s + (a.prediction_probability ?? 0), 0) / withProb.length
    : null;
  const highest  = withProb.length > 0
    ? withProb.reduce((a, b) =>
        (a.prediction_probability ?? 0) > (b.prediction_probability ?? 0) ? a : b)
    : null;

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">

        {/* ── Page header ── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-brand-text">Past Assessments</h1>
            <p className="text-sm text-brand-muted mt-1">
              Your complete cardiovascular risk assessment history.
            </p>
          </div>
          <button
            onClick={() => navigate('/predict')}
            className="btn-primary"
          >
            <Plus className="w-4 h-4" />
            New Assessment
          </button>
        </div>

        {/* ── Summary stat cards ── */}
        {!loading && total > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="card p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-brand-green-light flex items-center justify-center flex-shrink-0">
                <ClipboardList className="w-5 h-5 text-brand-green" />
              </div>
              <div>
                <p className="text-xs text-brand-muted uppercase tracking-wide mb-0.5">Total Records</p>
                <p className="text-2xl font-bold text-brand-text">{total}</p>
              </div>
            </div>

            <div className="card p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-xs text-brand-muted uppercase tracking-wide mb-0.5">Average Risk</p>
                <p className="text-2xl font-bold text-brand-text">
                  {avgRisk !== null ? `${Math.round(avgRisk * 100)}%` : '—'}
                </p>
              </div>
            </div>

            <div className="card p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                <HeartPulse className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-xs text-brand-muted uppercase tracking-wide mb-0.5">Peak Risk</p>
                <p className="text-2xl font-bold text-brand-text">
                  {highest?.prediction_probability != null
                    ? `${Math.round(highest.prediction_probability * 100)}%`
                    : '—'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Loading ── */}
        {loading && (
          <div className="flex justify-center py-16">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {/* ── Error ── */}
        {error && !loading && (
          <div className="card p-5 text-sm text-brand-muted flex items-start gap-3">
            <HeartPulse className="w-4 h-4 text-brand-muted flex-shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {/* ── Empty state ── */}
        {!loading && assessments.length === 0 && !error && (
          <div className="card p-16 flex flex-col items-center text-center">
            {/* Decorative SVG */}
            <div className="w-20 h-20 rounded-3xl bg-brand-green-light flex items-center justify-center mb-6">
              <svg viewBox="0 0 48 48" className="w-10 h-10" fill="none">
                <path d="M24 42 C24 42 8 30 8 18 C8 12 13 7 18 7 C21 7 24 9 24 9 C24 9 27 7 30 7 C35 7 40 12 40 18 C40 30 24 42 24 42Z"
                      fill="#EAF2EC" stroke="#3D7A5A" strokeWidth="1.5"/>
                <polyline points="14,24 18,20 22,28 26,16 30,24 34,24"
                          stroke="#3D7A5A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              </svg>
            </div>
            <p className="font-bold text-brand-text text-lg mb-2">No assessments yet</p>
            <p className="text-sm text-brand-muted mb-8 max-w-xs leading-relaxed">
              Run your first cardiovascular risk prediction to start building your health history.
            </p>
            <button onClick={() => navigate('/predict')} className="btn-primary">
              <HeartPulse className="w-4 h-4" />
              Run First Assessment
            </button>
          </div>
        )}

        {/* ── Full assessment table ── */}
        {!loading && assessments.length > 0 && (
          <div className="card overflow-hidden">
            {/* Table head */}
            <div className="grid grid-cols-[1fr_140px_160px_120px_100px] items-center
                            px-6 py-3 bg-brand-bg border-b border-brand-border
                            text-xs font-semibold text-brand-muted uppercase tracking-wide">
              <span className="flex items-center gap-1.5">
                <CalendarDays className="w-3.5 h-3.5" /> Date
              </span>
              <span>Risk Score</span>
              <span>Status</span>
              <span>Sex / Age</span>
              <span className="text-right">Risk Bar</span>
            </div>

            {/* Rows */}
            <div className="divide-y divide-brand-border">
              {assessments.map((a, i) => (
                <div
                  key={a.id}
                  className="grid grid-cols-[1fr_140px_160px_120px_100px] items-center
                             px-6 py-4 hover:bg-brand-bg/60 transition-colors"
                >
                  {/* Date + index */}
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-brand-green-light text-brand-green
                                     text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {i + 1}
                    </span>
                    <span className="text-sm text-brand-muted">{formatDate(a.created_at)}</span>
                  </div>

                  {/* Risk % */}
                  <span className="text-base font-bold text-brand-text">
                    {a.prediction_probability !== null
                      ? `${(a.prediction_probability * 100).toFixed(1)}%`
                      : '—'}
                  </span>

                  {/* Badge */}
                  <span><RiskBadge prob={a.prediction_probability} /></span>

                  {/* Sex / Age */}
                  <span className="text-sm text-brand-muted">
                    {a.sex === 1 ? 'Male' : 'Female'} / {a.age}y
                  </span>

                  {/* Mini bar */}
                  <div className="w-24 ml-auto">
                    <RiskBar prob={a.prediction_probability} />
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 bg-brand-bg border-t border-brand-border text-xs text-brand-muted">
              {total} record{total !== 1 ? 's' : ''} · sorted newest first
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
