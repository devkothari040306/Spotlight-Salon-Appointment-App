import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-stone-100 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">✦</span>
              <span className="font-display text-xl font-semibold text-stone-900">Lumière</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-stone-500">
              Premium beauty services crafted for your unique self. Book your appointment and step into radiance.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-stone-400">Navigation</h3>
            <ul className="mt-4 space-y-2">
              {[['Home', '/'], ['Services', '/services'], ['Book Appointment', '/book'], ['My Account', '/dashboard']].map(
                ([label, href]) => (
                  <li key={href}>
                    <Link to={href} className="text-sm text-stone-600 transition hover:text-rose-600">
                      {label}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-stone-400">Visit Us</h3>
            <address className="mt-4 space-y-2 not-italic text-sm text-stone-600">
              <p>12 Rose Lane, Mayfair</p>
              <p>London, W1K 4AB</p>
              <p className="mt-3">
                <a href="tel:+442071234567" className="hover:text-rose-600">+44 207 123 4567</a>
              </p>
              <p>
                <a href="mailto:hello@lumieresalon.com" className="hover:text-rose-600">hello@lumieresalon.com</a>
              </p>
              <p className="mt-3 text-xs text-stone-400">Mon – Sat: 9:00 AM – 7:00 PM</p>
            </address>
          </div>
        </div>

        <div className="mt-10 border-t border-stone-100 pt-6 text-center text-xs text-stone-400">
          © {new Date().getFullYear()} Lumière Salon. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
