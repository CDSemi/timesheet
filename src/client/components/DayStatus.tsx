import type { DayDisplay, StatusShape } from './dayModel.ts';

/** A status is always a shape plus words; the shape is decoration for the eye, never the only signal. */
function Shape({ shape }: { shape: StatusShape }) {
  return <span className={`shape shape-${shape}`} aria-hidden="true" />;
}

export function CompletenessBadge({ day }: { day: DayDisplay }) {
  return (
    <span className={`status status-${day.status.completeness}`}>
      <Shape shape={day.status.shape} />
      {day.status.text}
    </span>
  );
}

/** Pending OT is shown only when the server's calculation says evidence is still outstanding. */
export function PendingOtBadge({ day }: { day: DayDisplay }) {
  if (!day.pendingOt) return <span className="muted">none</span>;
  return (
    <span className="status status-pending">
      <Shape shape="diamond" />
      pending OT
    </span>
  );
}
