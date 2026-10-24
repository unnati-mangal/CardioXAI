import { NavLink } from 'react-router-dom';
import { LayoutDashboard, HeartPulse } from 'lucide-react';

const navItems = [
  { to: '/dashboard', label: 'Dashboard',      icon: LayoutDashboard },
  { to: '/predict',   label: 'New Assessment', icon: HeartPulse       },
];

export default function Sidebar() {
  return (
    <nav className="flex flex-col gap-1">
      {navItems.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) => [
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
            isActive
              ? 'bg-forest-green/10 text-forest-green'
              : 'text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100',
          ].join(' ')}
        >
          <Icon className="w-4 h-4 flex-shrink-0" />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
