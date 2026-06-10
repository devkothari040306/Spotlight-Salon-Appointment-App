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
    `text-sm font-medium transition-colors ${
      isActive
        ? 'text-amber-400'
        : 'text-stone-300 hover:text-amber-400'
    }`;

  return (
    <nav className="sticky top-0 z-50 border-b border-stone-800 bg-stone-950/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl text-amber-400">✂</span>

          <span className="font-display text-xl font-semibold tracking-tight text-white">
            Spotlight Salon
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-8 md:flex">
          <NavLink to="/" className={navLinkClass} end>
            Home
          </NavLink>

          <NavLink to="/services" className={navLinkClass}>
            Services
          </NavLink>

          {user && (
            <NavLink to="/book" className={navLinkClass}>
              Book Appointment
            </NavLink>
          )}

          {user && !isAdmin && (
            <NavLink to="/dashboard" className={navLinkClass}>
              My Bookings
            </NavLink>
          )}

          {isAdmin && (
            <NavLink to="/admin" className={navLinkClass}>
              Admin
            </NavLink>
          )}
        </div>

        {/* Desktop Auth */}
        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-stone-400">
                Welcome,{' '}
                <span className="font-medium text-white">
                  {user.name.split(' ')[0]}
                </span>
              </span>

              <button
                onClick={handleLogout}
                className="rounded-lg border border-stone-700 px-4 py-2 text-sm text-stone-300 transition hover:border-amber-400 hover:text-amber-400"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-lg border border-stone-700 px-4 py-2 text-sm text-stone-300 transition hover:border-amber-400 hover:text-amber-400"
              >
                Sign In
              </Link>

              <Link
                to="/register"
                className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-stone-950 transition hover:bg-amber-400"
              >
                Book Appointment
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="flex flex-col gap-1.5 p-1 md:hidden"
          onClick={() => setOpen((p) => !p)}
          aria-label="Toggle menu"
        >
          <span
            className={`block h-0.5 w-5 bg-white transition-all ${
              open ? 'translate-y-2 rotate-45' : ''
            }`}
          />
          <span
            className={`block h-0.5 w-5 bg-white transition-all ${
              open ? 'opacity-0' : ''
            }`}
          />
          <span
            className={`block h-0.5 w-5 bg-white transition-all ${
              open ? '-translate-y-2 -rotate-45' : ''
            }`}
          />
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="border-t border-stone-800 bg-stone-950 px-4 py-4 md:hidden animate-fade-in">
          <div className="flex flex-col gap-4">
            <NavLink
              to="/"
              className={navLinkClass}
              end
              onClick={() => setOpen(false)}
            >
              Home
            </NavLink>

            <NavLink
              to="/services"
              className={navLinkClass}
              onClick={() => setOpen(false)}
            >
              Services
            </NavLink>

            {user && (
              <NavLink
                to="/book"
                className={navLinkClass}
                onClick={() => setOpen(false)}
              >
                Book Appointment
              </NavLink>
            )}

            {user && !isAdmin && (
              <NavLink
                to="/dashboard"
                className={navLinkClass}
                onClick={() => setOpen(false)}
              >
                My Bookings
              </NavLink>
            )}

            {isAdmin && (
              <NavLink
                to="/admin"
                className={navLinkClass}
                onClick={() => setOpen(false)}
              >
                Admin
              </NavLink>
            )}

            <div className="mt-2 flex flex-col gap-2 border-t border-stone-800 pt-4">
              {user ? (
                <button
                  onClick={handleLogout}
                  className="rounded-lg border border-stone-700 py-2 text-stone-300"
                >
                  Sign Out
                </button>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="rounded-lg border border-stone-700 py-2 text-center text-stone-300"
                    onClick={() => setOpen(false)}
                  >
                    Sign In
                  </Link>

                  <Link
                    to="/register"
                    className="rounded-lg bg-amber-500 py-2 text-center font-medium text-stone-950"
                    onClick={() => setOpen(false)}
                  >
                    Book Appointment
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}