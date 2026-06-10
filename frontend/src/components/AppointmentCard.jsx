export default function AppointmentCard({ appointment, onCancel }) {
  const { service, date, timeSlot, status, pricePaid, notes, _id } = appointment;

  const canCancel = status === 'pending' || status === 'confirmed';

  const formattedDate = new Date(date + 'T00:00:00').toLocaleDateString(
    'en-GB',
    {
      weekday: 'short',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }
  );

  const statusStyles = {
    pending:
      'bg-amber-100 text-amber-700 border border-amber-200',
    confirmed:
      'bg-emerald-100 text-emerald-700 border border-emerald-200',
    completed:
      'bg-blue-100 text-blue-700 border border-blue-200',
    cancelled:
      'bg-red-100 text-red-700 border border-red-200',
  };

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="font-display text-lg font-semibold text-stone-900">
              {service?.name || 'Salon Service'}
            </h3>

            <span
              className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${
                statusStyles[status] ||
                'bg-stone-100 text-stone-700 border border-stone-200'
              }`}
            >
              {status}
            </span>
          </div>

          <div className="mt-4 grid gap-2 text-sm text-stone-600 sm:grid-cols-2">
            <div>📅 {formattedDate}</div>
            <div>🕐 {timeSlot}</div>
            <div>⏱ {service?.duration || 0} mins</div>
            <div>₹ {pricePaid}</div>
          </div>

          {notes && (
            <div className="mt-4 rounded-lg bg-stone-50 p-3">
              <p className="text-sm italic text-stone-500">
                "{notes}"
              </p>
            </div>
          )}
        </div>

        {canCancel && onCancel && (
          <button
            onClick={() => onCancel(_id)}
            className="shrink-0 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}