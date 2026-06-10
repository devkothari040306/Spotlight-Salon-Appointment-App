import { Link } from 'react-router-dom';

const categoryColors = {
  hair:  'bg-violet-50 text-violet-700',
  skin:  'bg-rose-50 text-rose-600',
  nails: 'bg-pink-50 text-pink-600',
  spa:   'bg-emerald-50 text-emerald-700',
  other: 'bg-amber-50 text-amber-700',
};

export default function ServiceCard({ service, onBook }) {
  const colorClass = categoryColors[service.category] || categoryColors.other;

  return (
    <div className="card group flex flex-col overflow-hidden transition-shadow hover:shadow-md">
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-stone-100">
        {service.image ? (
          <img
            src={service.image}
            alt={service.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl text-stone-300">✦</div>
        )}
        <span className={`absolute left-3 top-3 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${colorClass}`}>
          {service.category}
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-lg font-semibold text-stone-900">{service.name}</h3>
        <p className="mt-1.5 flex-1 text-sm leading-relaxed text-stone-500 line-clamp-3">
          {service.description}
        </p>

        <div className="mt-4 flex items-center justify-between">
          <div>
            <p className="text-lg font-semibold text-stone-900">£{service.price}</p>
            <p className="text-xs text-stone-400">{service.duration} min</p>
          </div>
          {onBook ? (
            <button onClick={() => onBook(service)} className="btn-primary py-2 text-xs">
              Book
            </button>
          ) : (
            <Link to={`/book?serviceId=${service._id}`} className="btn-primary py-2 text-xs">
              Book
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
