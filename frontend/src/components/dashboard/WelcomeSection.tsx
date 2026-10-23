import { useNavigate } from 'react-router-dom';
import { HeartPulse } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.tsx';
import Button from '../common/Button';

export default function WelcomeSection() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const displayName = user?.email ?? 'there';
  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day:     'numeric',
    month:   'long',
    year:    'numeric',
  });

  return (
    <div className="bg-white rounded-2xl border border-neutral-100 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <p className="text-xs text-neutral-400 mb-1">{today}</p>
        <h1 className="text-xl font-bold text-forest-green">
          Welcome back{user ? `, ${displayName.split('@')[0]}` : ''}
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Track your cardiovascular risk assessments and review your history.
        </p>
      </div>

      <Button
        variant="primary"
        onClick={() => navigate('/predict')}
        className="sm:flex-shrink-0"
      >
        <HeartPulse className="w-4 h-4" />
        New Assessment
      </Button>
    </div>
  );
}
