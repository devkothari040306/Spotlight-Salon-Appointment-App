import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { servicesAPI, appointmentsAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';

// Min date: tomorrow
const getMinDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
};

// Max date: 60 days ahead
const getMaxDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 60);
  return d.toISOString().split('T')[0];
};

const STEPS = ['Choose Service', 'Pick Date & Time', 'Confirm'];

export default function BookAppointment() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Load services
  useEffect(() => {
    servicesAPI.getAll()
      .then((res) => {
        setServices(res.data);
        // Pre-select from URL param
        const preId = searchParams.get('serviceId');
        if (preId) {
          const found = res.data.find((s) => s._id === preId);
          if (found) { setSelectedService(found); setStep(2); }
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Fetch slots when service + date change
  useEffect(() => {
    if (!selectedService || !selectedDate) return;
    setSlotsLoading(true);
    setSelectedSlot('');
    appointmentsAPI.getSlots(selectedService._id, selectedDate)
      .then((res) => setSlots(res.data.slots))
      .catch(console.error)
      .finally(() => setSlotsLoading(false));
  }, [selectedService, selectedDate]);

  const handleServiceSelect = (svc) => {
    setSelectedService(svc);
    setStep(2);
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
    setStep(3);
  };

  const handleSubmit = async () => {
    if (!selectedService || !selectedDate || !selectedSlot) return;
    setSubmitting(true);
    setError('');
    try {
      await appointmentsAPI.create({
        serviceId: selectedService._id,
        date: selectedDate,
        timeSlot: selectedSlot,
        notes,
      });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading services…" />;

  if (success) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="max-w-md w-full text-center animate-slide-up">
          <div className="text-6xl">✦</div>
          <h2 className="mt-4 font-display text-3xl font-semibold text-stone-900">Appointment booked!</h2>
          <p className="mt-3 text-stone-500">
            Your <strong>{selectedService.name}</strong> on {selectedDate} at {selectedSlot} is confirmed.
            We look forward to seeing you.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button onClick={() => navigate('/dashboard')} className="btn-primary">
              View my appointments
            </button>
            <button onClick={() => { setSuccess(false); setStep(1); setSelectedService(null); setSelectedDate(''); setSelectedSlot(''); }}
              className="btn-secondary">
              Book another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen animate-fade-in">
      {/* Page header */}
      <div className="bg-stone-900 px-4 py-14 text-white sm:px-6">
        <div className="mx-auto max-w-3xl">
          <h1 className="font-display text-4xl font-semibold">Book an Appointment</h1>
          <p className="mt-2 text-stone-400">Pick your service, choose a time, and you're all set.</p>

          {/* Stepper */}
          <div className="mt-6 flex items-center gap-0">
            {STEPS.map((label, i) => {
              const num = i + 1;
              const done = step > num;
              const active = step === num;
              return (
                <div key={label} className="flex items-center">
                  <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-all
                    ${done ? 'bg-rose-500 text-white' : active ? 'border-2 border-rose-400 text-rose-300' : 'border-2 border-stone-600 text-stone-500'}`}>
                    {done ? '✓' : num}
                  </div>
                  <span className={`ml-2 text-xs font-medium hidden sm:inline ${active ? 'text-white' : 'text-stone-500'}`}>{label}</span>
                  {i < STEPS.length - 1 && <div className="mx-3 h-px w-8 bg-stone-700" />}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        {error && <div className="mb-6"><Alert type="error" message={error} onDismiss={() => setError('')} /></div>}

        {/* ─ Step 1: Choose service ─ */}
        {step >= 1 && (
          <section className="mb-10">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold text-stone-900">
                1. Choose a service
              </h2>
              {selectedService && step > 1 && (
                <button onClick={() => { setStep(1); setSelectedDate(''); setSelectedSlot(''); }}
                  className="text-xs text-rose-600 hover:underline">Change</button>
              )}
            </div>

            {selectedService && step > 1 ? (
              <div className="mt-3 flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                <span className="text-rose-500">✓</span>
                <span className="font-medium">{selectedService.name}</span>
                <span className="text-rose-400">·</span>
                <span>{selectedService.duration} min</span>
                <span className="text-rose-400">·</span>
                <span>£{selectedService.price}</span>
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {services.map((svc) => (
                  <button
                    key={svc._id}
                    onClick={() => handleServiceSelect(svc)}
                    className={`group flex items-start gap-4 rounded-xl border p-4 text-left transition-all hover:border-rose-300 hover:shadow-sm
                      ${selectedService?._id === svc._id ? 'border-rose-400 bg-rose-50' : 'border-stone-200 bg-white'}`}
                  >
                    <div className="flex-1">
                      <p className="font-medium text-stone-900 group-hover:text-rose-700">{svc.name}</p>
                      <p className="mt-0.5 text-xs text-stone-500 line-clamp-2">{svc.description}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="font-semibold text-stone-900">£{svc.price}</p>
                      <p className="text-xs text-stone-400">{svc.duration} min</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ─ Step 2: Date & time slot ─ */}
        {step >= 2 && selectedService && (
          <section className="mb-10">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold text-stone-900">2. Pick a date & time</h2>
              {selectedSlot && step > 2 && (
                <button onClick={() => setStep(2)} className="text-xs text-rose-600 hover:underline">Change</button>
              )}
            </div>

            {selectedSlot && step > 2 ? (
              <div className="mt-3 flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                <span className="text-rose-500">✓</span>
                <span className="font-medium">{selectedDate}</span>
                <span className="text-rose-400">·</span>
                <span>{selectedSlot}</span>
              </div>
            ) : (
              <div className="mt-4 space-y-6">
                {/* Date picker */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-stone-700">Select date</label>
                  <input
                    type="date"
                    value={selectedDate}
                    min={getMinDate()}
                    max={getMaxDate()}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="input max-w-xs"
                  />
                </div>

                {/* Time slots */}
                {selectedDate && (
                  <div>
                    <label className="mb-2 block text-sm font-medium text-stone-700">Available time slots</label>
                    {slotsLoading ? (
                      <LoadingSpinner text="Checking availability…" />
                    ) : slots.length === 0 ? (
                      <p className="text-sm text-stone-400">No slots available on this date. Try another day.</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {slots.map((slot) => (
                          <button
                            key={slot}
                            onClick={() => handleSlotSelect(slot)}
                            className={`rounded-xl border px-4 py-2 text-sm font-medium transition-all hover:border-rose-400 hover:text-rose-600
                              ${selectedSlot === slot ? 'border-rose-500 bg-rose-600 text-white' : 'border-stone-200 bg-white text-stone-700'}`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {/* ─ Step 3: Confirm ─ */}
        {step >= 3 && selectedDate && selectedSlot && (
          <section>
            <h2 className="font-display text-xl font-semibold text-stone-900">3. Confirm booking</h2>

            <div className="card mt-4 divide-y divide-stone-100">
              {[
                ['Service', selectedService.name],
                ['Date', new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })],
                ['Time', selectedSlot],
                ['Duration', `${selectedService.duration} minutes`],
                ['Price', `£${selectedService.price}`],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between px-5 py-3 text-sm">
                  <span className="text-stone-500">{label}</span>
                  <span className="font-medium text-stone-900">{value}</span>
                </div>
              ))}
            </div>

            <div className="mt-5">
              <label className="mb-1.5 block text-sm font-medium text-stone-700">
                Notes <span className="text-stone-400">(optional)</span>
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="input resize-none"
                rows={3}
                placeholder="Any special requests or information for your stylist…"
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="btn-primary mt-6 w-full py-4 text-base"
            >
              {submitting ? 'Confirming booking…' : 'Confirm appointment'}
            </button>
          </section>
        )}
      </div>
    </div>
  );
}
