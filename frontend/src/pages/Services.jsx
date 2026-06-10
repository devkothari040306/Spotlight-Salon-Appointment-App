import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { servicesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ServiceCard from '../components/ServiceCard';
import LoadingSpinner from '../components/LoadingSpinner';

const CATEGORIES = ['all', 'hair', 'skin', 'nails', 'spa', 'other'];

export default function Services() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    servicesAPI.getAll()
      .then((res) => setServices(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleBook = (service) => {
    if (!user) {
      navigate('/login', { state: { from: `/book?serviceId=${service._id}` } });
    } else {
      navigate(`/book?serviceId=${service._id}`);
    }
  };

  const filtered = activeCategory === 'all'
    ? services
    : services.filter((s) => s.category === activeCategory);

  return (
    <div className="min-h-screen animate-fade-in">
      {/* Page header */}
      <div className="bg-stone-900 px-4 py-16 text-white sm:px-6">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-medium uppercase tracking-widest text-rose-300">What we offer</p>
          <h1 className="mt-2 font-display text-4xl font-semibold md:text-5xl">Our Services</h1>
          <p className="mt-3 max-w-lg text-stone-400">
            Every treatment is tailored to you. Browse below and book the one that catches your eye.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        {/* Category filter */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full px-4 py-2 text-sm font-medium capitalize transition-all ${
                activeCategory === cat
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-white border border-stone-200 text-stone-600 hover:border-rose-300 hover:text-rose-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="mt-8">
          {loading ? (
            <LoadingSpinner />
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center text-stone-400">No services found in this category.</div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((s) => (
                <ServiceCard key={s._id} service={s} onBook={handleBook} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
