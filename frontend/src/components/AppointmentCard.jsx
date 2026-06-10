export default function AppointmentCard({ appointment, onCancel }) {
  const { service, date, timeSlot, status, pricePaid, notes, _id } = appointment;

  const canCancel = status === 'pending' || status === 'confirmed';

  // Format date nicely
  const formattedDate = new Date(date + 'T00:00:00').toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <div className="card p-5 transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-display text-base font-semibold text-stone-900 truncate">
              {service?.name || 'Service'}
            </h3>
            <span className={`badge-${status}`}>{status}</span>
          </div>

          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-stone-500">
            <span>📅 {formattedDate}</span>
            <span>🕐 {timeSlot}</span>
            <span>⏱ {service?.duration} min</span>
            <span>💷 £{pricePaid}</span>
          </div>

          {notes && (
            <p className="mt-2 text-xs italic text-stone-400">Note: {notes}</p>
          )}
        </div>

        {canCancel && onCancel && (
          <button
            onClick={() => onCancel(_id)}
            className="shrink-0 rounded-full border border-stone-200 px-3 py-1.5 text-xs text-stone-500 transition hover:border-rose-300 hover:text-rose-600"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
