import { useEffect, useState } from 'react';
import { appointmentsAPI, servicesAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';

const TABS = ['Appointments', 'Services'];
const STATUSES = ['pending', 'confirmed', 'completed', 'cancelled'];

// ── Service Form Modal ────────────────────────────────────────────────────────
function ServiceModal({ service, onSave, onClose }) {
  const [form, setForm] = useState(
    service || { name: '', description: '', price: '', duration: '', category: 'hair', image: '', isAvailable: true }
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (service?._id) {
        await servicesAPI.update(service._id, form);
      } else {
        await servicesAPI.create(form);
      }
      onSave();
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl animate-slide-up max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-xl font-semibold text-stone-900">
            {service ? 'Edit Service' : 'Add Service'}
          </h3>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 text-xl leading-none">×</button>
        </div>
        {error && <div className="mb-4"><Alert type="error" message={error} /></div>}
        <form onSubmit={handleSave} className="space-y-4">
          {[
            { label: 'Name', name: 'name', type: 'text', required: true },
            { label: 'Price (₹)', name: 'price', type: 'number', required: true },
            { label: 'Duration (min)', name: 'duration', type: 'number', required: true },
            { label: 'Image URL', name: 'image', type: 'url' },
          ].map(({ label, name, type, required }) => (
            <div key={name}>
              <label className="mb-1.5 block text-sm font-medium text-stone-700">{label}</label>
              <input type={type} name={name} value={form[name]} onChange={handleChange}
                className="input" required={required} />
            </div>
          ))}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-stone-700">Category</label>
            <select name="category" value={form.category} onChange={handleChange} className="input">
              {['hair', 'skin', 'nails', 'spa', 'other'].map((c) => (
                <option key={c} value={c} className="capitalize">{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-stone-700">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange}
              className="input resize-none" rows={3} required />
          </div>

          <label className="flex items-center gap-2 text-sm text-stone-700">
            <input type="checkbox" name="isAvailable" checked={form.isAvailable} onChange={handleChange}
              className="rounded border-stone-300" />
            Available for booking
          </label>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? 'Saving…' : 'Save service'}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main Admin Dashboard ──────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [tab, setTab] = useState('Appointments');
  const [appointments, setAppointments] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [alert, setAlert] = useState(null);
  const [editService, setEditService] = useState(null); // null=closed, false=new, obj=edit
  const showAlert = (type, message) => setAlert({ type, message });

  const fetchAppointments = () =>
    appointmentsAPI.adminGetAll(statusFilter ? { status: statusFilter } : {})
      .then((r) => setAppointments(r.data)).catch(console.error);

  const fetchServices = () =>
    servicesAPI.getAllAdmin().then((r) => setServices(r.data)).catch(console.error);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchAppointments(), fetchServices()]).finally(() => setLoading(false));
  }, [statusFilter]);

  const handleStatusChange = async (id, status) => {
    try {
      await appointmentsAPI.adminUpdateStatus(id, status);
      showAlert('success', 'Status updated');
      fetchAppointments();
    } catch {
      showAlert('error', 'Could not update status');
    }
  };

  const handleDeleteService = async (id) => {
    if (!window.confirm('Delete this service?')) return;
    try {
      await servicesAPI.delete(id);
      showAlert('success', 'Service deleted');
      fetchServices();
    } catch {
      showAlert('error', 'Delete failed');
    }
  };

  // Stats
  const stats = {
    total: appointments.length,
    pending: appointments.filter((a) => a.status === 'pending').length,
    confirmed: appointments.filter((a) => a.status === 'confirmed').length,
    revenue: appointments
      .filter((a) => a.status !== 'cancelled')
      .reduce((sum, a) => sum + (a.pricePaid || 0), 0),
  };

  return (
    <div className="min-h-screen animate-fade-in">
      {/* Header */}
      <div className="bg-stone-900 px-4 py-14 text-white sm:px-6">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-medium uppercase tracking-widest text-rose-300">Administration</p>
          <h1 className="mt-1 font-display text-4xl font-semibold">Admin Dashboard</h1>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {alert && (
          <div className="mb-6">
            <Alert type={alert.type} message={alert.message} onDismiss={() => setAlert(null)} />
          </div>
        )}

        {/* Stats cards */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: 'Total bookings', value: stats.total, color: 'text-stone-900' },
            { label: 'Pending', value: stats.pending, color: 'text-amber-600' },
            { label: 'Confirmed', value: stats.confirmed, color: 'text-emerald-600' },
            { label: 'Revenue (excl. cancelled)', value: `₹${stats.revenue}`, color: 'text-rose-600' },
          ].map(({ label, value, color }) => (
            <div key={label} className="card p-5">
              <p className="text-xs text-stone-500">{label}</p>
              <p className={`mt-1 font-display text-2xl font-semibold ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="mt-8 flex gap-1 rounded-xl bg-stone-100 p-1 w-fit">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-lg px-5 py-2 text-sm font-medium transition-all ${
                tab === t ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            {/* ─── Appointments tab ─────────────────────────────────────── */}
            {tab === 'Appointments' && (
              <div className="mt-6">
                {/* Status filter */}
                <div className="flex flex-wrap gap-2 mb-5">
                  <button onClick={() => setStatusFilter('')}
                    className={`rounded-full px-4 py-1.5 text-xs font-medium border transition-all ${!statusFilter ? 'bg-stone-900 text-white border-stone-900' : 'bg-white border-stone-200 text-stone-600'}`}>
                    All
                  </button>
                  {STATUSES.map((s) => (
                    <button key={s} onClick={() => setStatusFilter(s)}
                      className={`rounded-full px-4 py-1.5 text-xs font-medium border capitalize transition-all ${statusFilter === s ? 'bg-stone-900 text-white border-stone-900' : 'bg-white border-stone-200 text-stone-600'}`}>
                      {s}
                    </button>
                  ))}
                </div>

                {appointments.length === 0 ? (
                  <p className="py-10 text-center text-stone-400">No appointments found.</p>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-stone-100 bg-white shadow-sm">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-stone-100 text-left text-xs font-semibold uppercase tracking-wider text-stone-400">
                          {['Client', 'Service', 'Date', 'Time', 'Price', 'Status', 'Actions'].map((h) => (
                            <th key={h} className="px-4 py-3">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-50">
                        {appointments.map((a) => (
                          <tr key={a._id} className="hover:bg-stone-50/50">
                            <td className="px-4 py-3">
                              <p className="font-medium text-stone-900">{a.user?.name}</p>
                              <p className="text-xs text-stone-400">{a.user?.email}</p>
                            </td>
                            <td className="px-4 py-3 text-stone-700">{a.service?.name}</td>
                            <td className="px-4 py-3 text-stone-600">{a.date}</td>
                            <td className="px-4 py-3 text-stone-600">{a.timeSlot}</td>
                            <td className="px-4 py-3 text-stone-700">₹{a.pricePaid}</td>
                            <td className="px-4 py-3">
                              <span className={`badge-${a.status}`}>{a.status}</span>
                            </td>
                            <td className="px-4 py-3">
                              <select
                                value={a.status}
                                onChange={(e) => handleStatusChange(a._id, e.target.value)}
                                className="rounded-lg border border-stone-200 px-2 py-1 text-xs text-stone-700 focus:outline-none focus:border-rose-400"
                              >
                                {STATUSES.map((s) => (
                                  <option key={s} value={s} className="capitalize">{s}</option>
                                ))}
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* ─── Services tab ─────────────────────────────────────────── */}
            {tab === 'Services' && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-5">
                  <p className="text-sm text-stone-500">{services.length} services</p>
                  <button onClick={() => setEditService(false)} className="btn-primary py-2 text-sm">
                    + Add service
                  </button>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-stone-100 bg-white shadow-sm">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-stone-100 text-left text-xs font-semibold uppercase tracking-wider text-stone-400">
                        {['Name', 'Category', 'Price', 'Duration', 'Available', 'Actions'].map((h) => (
                          <th key={h} className="px-4 py-3">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-50">
                      {services.map((s) => (
                        <tr key={s._id} className="hover:bg-stone-50/50">
                          <td className="px-4 py-3 font-medium text-stone-900">{s.name}</td>
                          <td className="px-4 py-3 capitalize text-stone-600">{s.category}</td>
                          <td className="px-4 py-3 text-stone-700">₹{s.price}</td>
                          <td className="px-4 py-3 text-stone-600">{s.duration} min</td>
                          <td className="px-4 py-3">
                            <span className={`badge ${s.isAvailable ? 'badge-confirmed' : 'badge-cancelled'}`}>
                              {s.isAvailable ? 'Yes' : 'No'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button onClick={() => setEditService(s)}
                                className="rounded-lg border border-stone-200 px-3 py-1 text-xs hover:border-rose-300 hover:text-rose-600 transition">
                                Edit
                              </button>
                              <button onClick={() => handleDeleteService(s._id)}
                                className="rounded-lg border border-stone-200 px-3 py-1 text-xs hover:border-rose-400 hover:bg-rose-50 hover:text-rose-700 transition">
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Service model */}
      {editService !== null && (
        <ServiceModal
          service={editService || null}
          onClose={() => setEditService(null)}
          onSave={() => { setEditService(null); fetchServices(); showAlert('success', 'Service saved!'); }}
        />
      )}
    </div>
  );
}
