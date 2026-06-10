import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import Alert from '../components/Alert';

export default function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from || '/dashboard';

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Already logged in
  if (user) { navigate(from, { replace: true }); return null; }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await authAPI.login(form);
      login(data);
      navigate(data.role === 'admin' ? '/admin' : from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-16">
      <div className="w-full max-w-md animate-slide-up">
        {/* Header */}
        <div className="text-center">
          <span className="text-3xl">✦</span>
          <h1 className="mt-3 font-display text-3xl font-semibold text-stone-900">Welcome back</h1>
          <p className="mt-2 text-sm text-stone-500">Sign in to manage your appointments</p>
        </div>

        <div className="card mt-8 p-8">
          {error && (
            <div className="mb-5">
              <Alert type="error" message={error} onDismiss={() => setError('')} />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-stone-700">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="input"
                placeholder="you@example.com"
                required
                autoFocus
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-stone-700">Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className="input"
                placeholder="••••••••"
                required
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          {/* Demo credentials hint */}
          <div className="mt-5 rounded-xl bg-stone-50 p-4 text-xs text-stone-500">
            <p className="font-medium text-stone-600">Demo credentials</p>
            <p className="mt-1">Admin: <span className="font-mono">admin@salon.com</span> / <span className="font-mono">admin123456</span></p>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-stone-500">
          New here?{' '}
          <Link to="/register" className="font-medium text-rose-600 hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
