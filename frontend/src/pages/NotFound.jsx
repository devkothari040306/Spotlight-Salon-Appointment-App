import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center animate-fade-in">
      <p className="font-display text-8xl font-semibold text-stone-200">404</p>
      <h1 className="mt-4 font-display text-2xl font-semibold text-stone-900">Page not found</h1>
      <p className="mt-2 text-stone-500">The page you're looking for doesn't exist or has been moved.</p>
      <Link to="/" className="btn-primary mt-8">Back to home</Link>
    </div>
  );
}
