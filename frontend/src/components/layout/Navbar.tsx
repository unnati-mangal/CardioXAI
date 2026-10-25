import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Heart, Menu, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.tsx';

const landingLinks = [
  { label: 'Home',  href: '/' },
  { label: 'About', href: '/#about' },
];

export default function Navbar() {
  const { user, signOut } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const isLanding = location.pathname === '/';
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
    <header className="bg-white border-b border-brand-border sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-7 h-7 rounded-lg bg-brand-green-light flex items-center justify-center">
            <Heart className="w-4 h-4 text-brand-green" />
          </div>
          <span className="text-base font-semibold text-brand-green tracking-tight">
            CardioXAI
          </span>
        </Link>

        {/* Desktop nav – landing links only on landing page */}
        {isLanding && !user && (
          <nav className="hidden md:flex items-center gap-6">
            {landingLinks.map(({ label, href }) => (
              <button
                key={label}
                onClick={() => scrollTo(href)}
                className="text-sm text-brand-muted hover:text-brand-text transition-colors"
              >
                {label}
              </button>
            ))}
          </nav>
        )}

        {/* Right actions */}
        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <>
              <Link to="/dashboard" className="btn-ghost text-sm py-2">
                Dashboard
              </Link>
              <button onClick={handleSignOut} className="btn-outline text-sm py-2">
                Sign Out
              </button>
            </>
          ) : (
            <>
              <button onClick={() => navigate('/auth')} className="btn-ghost text-sm py-2">
                Log In
              </button>
              <button onClick={() => navigate('/auth')} className="btn-primary text-sm py-2">
                Get Started
              </button>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-lg text-brand-muted hover:bg-brand-green-light"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-brand-border px-6 py-4 flex flex-col gap-3">
          {isLanding && !user && landingLinks.map(({ label, href }) => (
            <button
              key={label}
              onClick={() => scrollTo(href)}
              className="text-left text-sm text-brand-muted hover:text-brand-text"
            >
              {label}
            </button>
          ))}
          {user ? (
            <>
              <Link to="/dashboard" className="text-sm text-brand-muted" onClick={() => setOpen(false)}>Dashboard</Link>
              <button onClick={() => { setOpen(false); handleSignOut(); }} className="text-left text-sm text-brand-muted">Sign Out</button>
            </>
          ) : (
            <>
              <button onClick={() => { setOpen(false); navigate('/auth'); }} className="text-left text-sm text-brand-muted">Log In</button>
              <button onClick={() => { setOpen(false); navigate('/auth'); }} className="text-left text-sm font-semibold text-brand-green">Get Started</button>
            </>
          )}
        </div>
      )}
    </header>
  );
}
