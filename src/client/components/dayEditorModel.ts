import { suggestBreaks } from '../../domain/breaks.ts';
import { parseUtcInstant } from '../../domain/instants.ts';
import { formatInZone } from '../../domain/zones.ts';
import type { DayView, PolicyVersion, Session, SessionRequest } from '../api.ts';
import { type BreakRow, buildSessionRequest, draftFromSession, suggestedRows, toBreakRules } from './sessionModel.ts';

/*
 * Pure logic of the day editor panel (WP5-UX-T04): the banner at its top and the one-tap break
 * confirmation of a saved session. Nothing here computes business minutes. The one-tap action
 * builds exactly the body the session form sends after "Suggest breaks" and "Confirm suggested
 * breaks" (PUT /api/sessions/:id with the loaded version); the suggestions come from the shared
 * `suggestBreaks`, and the server still checks every rule.
 */

export interface DayBanner {
  tone: 'attention' | 'error';
  text: string;
}

/** What the day still needs, from the server's calculation status; null when nothing is pending. */
export function dayBanner(day: DayView): DayBanner | null {
  if (day.calculation_error !== null) return { tone: 'error', text: `Calculation: ${day.calculation_error.replace(/_/g, ' ')}.` };
  const pending = 'OT for this day stays pending until breaks are confirmed and every session has ended.';
  switch (day.calculation?.status) {
    case 'incomplete_breaks':
      return { tone: 'attention', text: `Breaks are not confirmed yet. ${pending}` };
    case 'incomplete':
      return { tone: 'attention', text: `A session has no end yet. ${pending}` };
    default:
      return null;
  }
}

/**
 * The breaks a one-tap confirmation would save for a session whose breaks are not confirmed:
 * `listed` = the rows already saved with it, `suggested` = the policy breaks shifted by its start,
 * `none` = nothing to confirm except "no breaks taken" (no policy, no policy breaks, or a suggested
 * break that does not lie inside the session, which the server would refuse).
 */
export interface QuickBreaks {
  kind: 'listed' | 'suggested' | 'none';
  /** The rows sent with a confirmation, pinned by offset in the session's input zone. */
  rows: BreakRow[];
  /** Each break as `HH:MM-HH:MM` in the display zone (R-07). */
  chips: string[];
}

function clock(zone: string, instant: number): string {
  return formatInZone(zone, instant).slice(11, 16);
}

/** Null for a running session or one whose breaks are already confirmed: nothing to offer. */
export function quickBreaksOf(session: Session, policy: PolicyVersion | undefined, displayZone: string): QuickBreaks | null {
  if (session.end_utc === null || session.breaks_confirmed) return null;
  if (session.breaks.length > 0) {
    return {
      kind: 'listed',
      rows: draftFromSession(session).breaks,
      chips: session.breaks.map((item) => `${clock(displayZone, parseUtcInstant(item.start_utc))}-${clock(displayZone, parseUtcInstant(item.end_utc))}`),
    };
  }
  if (policy === undefined || policy.breaks.length === 0) return { kind: 'none', rows: [], chips: [] };
  const start = parseUtcInstant(session.start_utc);
  const end = parseUtcInstant(session.end_utc);
  const suggestions = suggestBreaks(start, toBreakRules(policy.breaks));
  // An instant comparison only: a suggestion outside the session would be refused by the server.
  if (suggestions.some((item) => item.startUtc < start || item.endUtc > end)) return { kind: 'none', rows: [], chips: [] };
  return {
    kind: 'suggested',
    rows: suggestedRows(start, session.input_zone, policy.breaks, (index) => `quick-${session.id}-${index}`),
    chips: suggestions.map((item) => `${clock(displayZone, item.startUtc)}-${clock(displayZone, item.endUtc)}`),
  };
}

/**
 * The session update of a one-tap choice: `confirm` sends the quick rows with breaks confirmed,
 * `none` confirms that no break was taken. Start, end and zone stay as saved (pinned by offset),
 * and the version the editor loaded goes with it.
 */
export function quickBreaksRequest(session: Session, quick: QuickBreaks, choice: 'confirm' | 'none', reason: string): SessionRequest {
  const draft = draftFromSession(session);
  const confirmed = choice === 'confirm' ? { breaks: quick.rows, mode: 'confirmed' as const } : { breaks: [], mode: 'none' as const };
  return buildSessionRequest({ ...draft, ...confirmed }, { expectedVersion: session.version, reason });
}
