import { useNavigate } from 'react-router-dom';
import { HeartPulse } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.tsx';

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function WelcomeSection() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const raw         = user?.email ? user.email.split('@')[0] : 'there';
  const displayName = raw.charAt(0).toUpperCase() + raw.slice(1);

  return (
    <div className="card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4
                    bg-gradient-to-br from-white to-brand-green-light border-brand-border">
      <div className="flex items-center gap-4">
        {/* Small heart avatar */}
        <div className="w-12 h-12 rounded-2xl bg-brand-green flex items-center justify-center flex-shrink-0">
          <HeartPulse className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-brand-text">
            {getGreeting()}, {displayName}! 👋
          </h1>
          <p className="text-sm text-brand-muted mt-0.5">
            Take a step towards a healthier heart — get your AI-powered risk prediction today.
          </p>
        </div>
      </div>
      <button
        onClick={() => navigate('/predict')}
        className="btn-primary flex-shrink-0 shadow-sm"
      >
        <HeartPulse className="w-4 h-4" />
        + New Prediction
      </button>
    </div>
  );
}
