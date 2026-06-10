import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { servicesAPI } from '../services/api';
import ServiceCard from '../components/ServiceCard';
import LoadingSpinner from '../components/LoadingSpinner';

const FEATURES = [
  { icon: '✦', title: 'Expert Stylists', desc: 'Our team brings years of international training and a passion for precision.' },
  { icon: '◈', title: 'Premium Products', desc: 'We use only clean, cruelty-free products that care for your skin and hair.' },
  { icon: '◉', title: 'Easy Booking', desc: 'Reserve your slot online in under two minutes. No phone calls needed.' },
];

const TESTIMONIALS = [
  { name: 'Priya S.', text: 'The best salon experience I have had in London. Absolutely transformed my hair.', stars: 5 },
  { name: 'Marcus T.', text: 'Booked online in minutes and the cut was exactly what I asked for. Will be back.', stars: 5 },
  { name: 'Aisha R.', text: 'The facial left my skin glowing for days. Incredibly relaxing atmosphere too.', stars: 5 },
];

export default function Home() {
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);

  useEffect(() => {
    servicesAPI.getAll()
      .then((res) => setServices(res.data.slice(0, 3))) // show 3 featured
      .catch(console.error)
      .finally(() => setLoadingServices(false));
  }, []);

  return (
    <div className="animate-fade-in">
      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-stone-900 text-white">
        {/* Background image overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1600')" }}
        />
        {/* Gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-stone-900/90 via-stone-900/60 to-transparent" />

        <div className="relative mx-auto max-w-6xl px-4 py-28 sm:px-6 sm:py-36 lg:py-44">
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-rose-300">
            Premium Beauty Studio — London
          </p>
          <h1 className="mt-4 max-w-2xl font-display text-5xl font-semibold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
            Beauty crafted<br />
            <span className="italic text-rose-300">for you.</span>
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-stone-300">
            Haircuts, facials, nail art, and spa treatments — all bookable online in moments. Walk in, feel transformed.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link to="/register" className="btn-primary px-8 py-3.5 text-base">
              Book an Appointment
            </Link>
            <Link to="/services" className="btn-secondary bg-transparent text-white border-white/40 hover:bg-white/10 hover:border-white px-8 py-3.5 text-base">
              Explore Services
            </Link>
          </div>

          {/* Social proof bar */}
          <div className="mt-14 flex flex-wrap gap-8">
            {[['500+', 'Happy clients'], ['11', 'Treatments'], ['4.9★', 'Average rating']].map(([val, label]) => (
              <div key={label}>
                <p className="font-display text-2xl font-semibold text-white">{val}</p>
                <p className="text-xs text-stone-400">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-500 text-lg">
                  {f.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-stone-900">{f.title}</h3>
                  <p className="mt-1 text-sm text-stone-500 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Services ─────────────────────────────────────────────────── */}
      <section className="bg-stone-50 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-rose-500">Our Treatments</p>
              <h2 className="section-heading mt-2">Popular services</h2>
            </div>
            <Link to="/services" className="btn-outline-rose shrink-0">
              View all services →
            </Link>
          </div>

          <div className="mt-10">
            {loadingServices ? (
              <LoadingSpinner />
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {services.map((s) => (
                  <ServiceCard key={s._id} service={s} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center">
            <p className="text-xs font-medium uppercase tracking-widest text-rose-500">Simple as that</p>
            <h2 className="section-heading mt-2">How booking works</h2>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3">
            {[
              { step: '1', title: 'Choose a service', desc: 'Browse our full menu and pick the treatment that suits you.' },
              { step: '2', title: 'Pick a date & time', desc: 'See real-time availability and claim your ideal slot instantly.' },
              { step: '3', title: 'Show up & relax', desc: 'We confirm your appointment. All you need to do is arrive.' },
            ].map((item) => (
              <div key={item.step} className="relative flex flex-col items-center text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-rose-200 bg-white font-display text-2xl font-semibold text-rose-500">
                  {item.step}
                </div>
                <h3 className="mt-4 font-semibold text-stone-900">{item.title}</h3>
                <p className="mt-2 text-sm text-stone-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link to="/register" className="btn-primary px-10 py-3.5 text-base">
              Get started — it's free
            </Link>
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────────────────── */}
      <section className="bg-stone-900 py-20 text-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center">
            <p className="text-xs font-medium uppercase tracking-widest text-rose-300">What clients say</p>
            <h2 className="mt-2 font-display text-3xl font-semibold md:text-4xl">Loved by Londoners</h2>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="rounded-2xl border border-stone-700 bg-stone-800/50 p-6">
                <p className="text-sm text-stone-300 leading-relaxed">"{t.text}"</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm font-medium text-white">{t.name}</span>
                  <span className="text-xs text-amber-400">{'★'.repeat(t.stars)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="section-heading">Ready to look your best?</h2>
          <p className="section-sub">Create a free account and book your first appointment in under a minute.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link to="/register" className="btn-primary px-10 py-3.5 text-base">Create account</Link>
            <Link to="/services" className="btn-secondary px-10 py-3.5 text-base">Browse services</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
