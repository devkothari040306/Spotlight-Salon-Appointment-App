import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-stone-800 bg-stone-900 text-white">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl text-rose-400">✦</span>
              <span className="font-display text-xl font-semibold text-rose-400">
                Spotlight
              </span>
            </div>

            <p className="mt-3 text-sm leading-relaxed text-stone-300">
              Experience premium hair, beauty, and wellness services. Book your
              appointment online and let our experts help you look your best.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-rose-400">
              Navigation
            </h3>

            <ul className="mt-4 space-y-2">
              {[
                ['Home', '/'],
                ['Services', '/services'],
                ['Book Appointment', '/book'],
                ['My Account', '/dashboard'],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link
                    to={href}
                    className="text-sm text-stone-300 transition hover:text-rose-400"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-rose-400">
              Visit Us
            </h3>

            <address className="mt-4 space-y-2 not-italic text-sm text-stone-300">
              <p>Vaishali Nagar</p>
              <p>Jaipur, Rajasthan 302021</p>

              <p className="mt-3">
                <a
                  href="tel:+919876543210"
                  className="transition hover:text-rose-400"
                >
                  +91 98765 43210
                </a>
              </p>

              <p>
                <a
                  href="mailto:contact@spotlightsalon.in"
                  className="transition hover:text-rose-400"
                >
                  contact@spotlightsalon.in
                </a>
              </p>

              <p className="mt-3 text-xs text-stone-400">
                Mon – Sun: 10:00 AM – 8:00 PM
              </p>
            </address>
          </div>
        </div>

        <div className="mt-10 border-t border-stone-800 pt-6 text-center text-xs text-stone-500">
          © {new Date().getFullYear()} Spotlight Salon. All rights reserved.
        </div>
      </div>
    </footer>
  );
}