import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setOpen(false);
  };

  const navLinkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors ${isActive ? 'text-rose-600' : 'text-stone-600 hover:text-rose-600'}`;

  return (
    <nav className="sticky top-0 z-50 border-b border-stone-100 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl">✦</span>
          <span className="font-display text-xl font-semibold tracking-tight text-stone-900">
            Lumière
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-8 md:flex">
          <NavLink to="/" className={navLinkClass} end>Home</NavLink>
          <NavLink to="/services" className={navLinkClass}>Services</NavLink>
          {user && <NavLink to="/book" className={navLinkClass}>Book</NavLink>}
          {user && !isAdmin && <NavLink to="/dashboard" className={navLinkClass}>My Appointments</NavLink>}
          {isAdmin && <NavLink to="/admin" className={navLinkClass}>Admin</NavLink>}
        </div>

        {/* Desktop auth */}
        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-stone-500">
                Hi, <span className="font-medium text-stone-800">{user.name.split(' ')[0]}</span>
              </span>
              <button onClick={handleLogout} className="btn-secondary py-2 text-xs">
                Sign out
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="btn-secondary py-2 text-sm">Sign in</Link>
              <Link to="/register" className="btn-primary py-2 text-sm">Book now</Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="flex flex-col gap-1.5 p-1 md:hidden"
          onClick={() => setOpen((p) => !p)}
          aria-label="Toggle menu"
        >
          <span className={`block h-0.5 w-5 bg-stone-700 transition-all ${open ? 'translate-y-2 rotate-45' : ''}`} />
          <span className={`block h-0.5 w-5 bg-stone-700 transition-all ${open ? 'opacity-0' : ''}`} />
          <span className={`block h-0.5 w-5 bg-stone-700 transition-all ${open ? '-translate-y-2 -rotate-45' : ''}`} />
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-stone-100 bg-white px-4 py-4 md:hidden animate-fade-in">
          <div className="flex flex-col gap-4">
            <NavLink to="/" className={navLinkClass} end onClick={() => setOpen(false)}>Home</NavLink>
            <NavLink to="/services" className={navLinkClass} onClick={() => setOpen(false)}>Services</NavLink>
            {user && <NavLink to="/book" className={navLinkClass} onClick={() => setOpen(false)}>Book Appointment</NavLink>}
            {user && !isAdmin && <NavLink to="/dashboard" className={navLinkClass} onClick={() => setOpen(false)}>My Appointments</NavLink>}
            {isAdmin && <NavLink to="/admin" className={navLinkClass} onClick={() => setOpen(false)}>Admin Dashboard</NavLink>}
            <div className="mt-2 flex flex-col gap-2 border-t border-stone-100 pt-4">
              {user ? (
                <button onClick={handleLogout} className="btn-secondary w-full">Sign out</button>
              ) : (
                <>
                  <Link to="/login" className="btn-secondary w-full" onClick={() => setOpen(false)}>Sign in</Link>
                  <Link to="/register" className="btn-primary w-full" onClick={() => setOpen(false)}>Book now</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
