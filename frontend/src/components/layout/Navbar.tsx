import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Heart, Menu, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.tsx';
import Button from '../common/Button';

const landingLinks = [
  { label: 'Home',         href: '/' },
  { label: 'About',        href: '/#features' },
  { label: 'How It Works', href: '/#how-it-works' },
  { label: 'Features',     href: '/#features' },
];

export default function Navbar() {
  const { user, signOut } = useAuth();
  const navigate   = useNavigate();
  const location   = useLocation();
  const isLanding  = location.pathname === '/';
  const [open, setOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const scrollTo = (href: string) => {
    setOpen(false);
    if (href.startsWith('/#')) {
      const id = href.slice(2);
      if (location.pathname !== '/') {
        navigate('/', { state: { scrollTo: id } });
      } else {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate(href);
    }
  };

  return (
    <header className="bg-white border-b border-[#E4E8E0] sticky top-0 z-20">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-[#DDE9DD] flex items-center justify-center">
            <Heart className="w-4 h-4 text-[#397653]" />
          </div>
          <span className="text-lg font-semibold text-[#24573D] tracking-tight group-hover:opacity-80 transition-opacity">
            CardioXAI
          </span>
        </Link>

        {/* Desktop nav — only show landing links on the landing page */}
        <nav className="hidden md:flex items-center gap-5">
          {isLanding && !user && landingLinks.map(({ label, href }) => (
            <button
              key={label}
              onClick={() => scrollTo(href)}
              className="text-sm font-medium text-[#687876] hover:text-[#24573D] transition-colors"
            >
              {label}
            </button>
          ))}
        </nav>

        {/* Right side actions */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <Link
                to="/dashboard"
                className="text-sm font-medium text-[#687876] hover:text-[#24573D] transition-colors"
              >
                Dashboard
              </Link>
              <Button variant="secondary" onClick={handleSignOut}>
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={() => navigate('/auth')}>
                Log In
              </Button>
              <Button variant="primary" onClick={() => navigate('/auth')}>
                Get Started
              </Button>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-lg text-[#687876] hover:bg-[#DDE9DD] transition-colors"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-[#E4E8E0] px-6 py-4 flex flex-col gap-3">
          {isLanding && !user && landingLinks.map(({ label, href }) => (
            <button
              key={label}
              onClick={() => scrollTo(href)}
              className="text-left text-sm font-medium text-[#687876] hover:text-[#24573D]"
            >
              {label}
            </button>
          ))}
          {user ? (
            <>
              <Link to="/dashboard" className="text-sm font-medium text-[#687876]" onClick={() => setOpen(false)}>Dashboard</Link>
              <button onClick={() => { setOpen(false); handleSignOut(); }} className="text-left text-sm font-medium text-[#687876]">Sign Out</button>
            </>
          ) : (
            <>
              <button onClick={() => { setOpen(false); navigate('/auth'); }} className="text-left text-sm font-medium text-[#687876]">Log In</button>
              <button onClick={() => { setOpen(false); navigate('/auth'); }} className="text-left text-sm font-medium text-[#397653] font-semibold">Get Started</button>
            </>
          )}
        </div>
      )}
    </header>
  );
}
