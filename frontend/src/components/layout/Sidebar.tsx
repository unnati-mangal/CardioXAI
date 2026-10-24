import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, HeartPulse, ClipboardList, LogOut, Heart } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.tsx';

const navItems = [
  { to: '/dashboard',    label: 'Dashboard',        icon: LayoutDashboard },
  { to: '/predict',      label: 'New Prediction',   icon: HeartPulse      },
  { to: '/assessments',  label: 'Past Assessments', icon: ClipboardList   },
];

export default function Sidebar() {
  const { signOut } = useAuth();
  const navigate    = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Logo area */}
      <div className="flex items-center gap-2 px-3 py-4 mb-2">
        <div className="w-7 h-7 rounded-lg bg-brand-green-light flex items-center justify-center">
          <Heart className="w-4 h-4 text-brand-green" />
        </div>
        <span className="text-sm font-semibold text-brand-green">CardioXAI</span>
      </div>

      {/* Nav links */}
      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              isActive ? 'nav-item-active' : 'nav-item'
            }
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Sign out */}
      <button
        onClick={handleSignOut}
        className="nav-item mt-4 text-left w-full"
      >
        <LogOut className="w-4 h-4 flex-shrink-0" />
        Log Out
      </button>
    </div>
  );
}
