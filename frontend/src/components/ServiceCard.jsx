import { Link } from 'react-router-dom';

const categoryColors = {
  hair: 'bg-amber-100 text-amber-700',
  skin: 'bg-rose-100 text-rose-700',
  nails: 'bg-pink-100 text-pink-700',
  spa: 'bg-emerald-100 text-emerald-700',
  other: 'bg-stone-100 text-stone-700',
};

export default function ServiceCard({ service, onBook }) {
  const colorClass =
    categoryColors[service.category] || categoryColors.other;

  return (
    <div className="group overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      {/* Image */}
      <div className="relative h-56 overflow-hidden bg-stone-100">
        {service.image ? (
          <img
            src={service.image}
            alt={service.name}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-5xl text-amber-400">
            ✂
          </div>
        )}

        <span
          className={`absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-medium capitalize ${colorClass}`}
        >
          {service.category}
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-display text-xl font-semibold text-stone-900">
          {service.name}
        </h3>

        <p className="mt-3 flex-1 text-sm leading-relaxed text-stone-600 line-clamp-3">
          {service.description}
        </p>

        <div className="mt-6 flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-stone-900">
              ₹{service.price}
            </p>

            <p className="text-sm text-stone-500">
              {service.duration} mins
            </p>
          </div>

          {onBook ? (
            <button
              onClick={() => onBook(service)}
              className="rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-medium text-stone-950 transition hover:bg-amber-400"
            >
              Book Now
            </button>
          ) : (
            <Link
              to={`/book?serviceId=${service._id}`}
              className="rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-medium text-stone-950 transition hover:bg-amber-400"
            >
              Book Now
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}