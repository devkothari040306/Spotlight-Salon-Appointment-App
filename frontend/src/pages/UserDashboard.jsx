import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { appointmentsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import AppointmentCard from '../components/AppointmentCard';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';

const STATUS_FILTERS = ['all', 'pending', 'confirmed', 'completed', 'cancelled'];

export default function UserDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [alert, setAlert] = useState(null);

  const fetchAppointments = () => {
    appointmentsAPI.getMy()
      .then((res) => setAppointments(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAppointments(); }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return;
    try {
      await appointmentsAPI.cancel(id);
      setAlert({ type: 'success', message: 'Appointment cancelled.' });
      fetchAppointments();
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Could not cancel.' });
    }
  };

  const filtered = filter === 'all'
    ? appointments
    : appointments.filter((a) => a.status === filter);

  const upcoming = appointments.filter((a) => ['pending', 'confirmed'].includes(a.status)).length;

  return (
    <div className="min-h-screen animate-fade-in">
      {/* Header */}
      <div className="bg-stone-900 px-4 py-14 text-white sm:px-6">
        <div className="mx-auto max-w-4xl">
          <p className="text-xs font-medium uppercase tracking-widest text-rose-300">Your account</p>
          <h1 className="mt-1 font-display text-4xl font-semibold">
            Hello, {user.name.split(' ')[0]} ✦
          </h1>
          <p className="mt-2 text-stone-400">
            You have <strong className="text-white">{upcoming}</strong> upcoming appointment{upcoming !== 1 ? 's' : ''}.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        {alert && (
          <div className="mb-6">
            <Alert type={alert.type} message={alert.message} onDismiss={() => setAlert(null)} />
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-display text-2xl font-semibold text-stone-900">My Appointments</h2>
          <Link to="/book" className="btn-primary shrink-0">
            + Book new appointment
          </Link>
        </div>

        {/* Status filter */}
        <div className="mt-5 flex flex-wrap gap-2">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`rounded-full px-4 py-1.5 text-xs font-medium capitalize transition-all ${
                filter === s
                  ? 'bg-stone-900 text-white'
                  : 'bg-white border border-stone-200 text-stone-600 hover:border-stone-400'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="mt-6 space-y-4">
          {loading ? (
            <LoadingSpinner />
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-stone-400">
                {filter === 'all' ? "You haven't booked anything yet." : `No ${filter} appointments.`}
              </p>
              {filter === 'all' && (
                <Link to="/book" className="btn-primary mt-4 inline-flex">Book your first appointment</Link>
              )}
            </div>
          ) : (
            filtered.map((a) => (
              <AppointmentCard key={a._id} appointment={a} onCancel={handleCancel} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
