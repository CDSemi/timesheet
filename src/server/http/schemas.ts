import { z } from 'zod';

/*
 * Request contracts. Objects are strict: unknown fields such as user_id or owner are
 * rejected, so ownership always comes from the authenticated session.
 */

const reason = z.string().max(1000).optional();

/** A UTC instant string (`…Z`) or local wall time in an explicit IANA input zone. */
export const instantInput = z.union([
  z.string().max(40),
  z.strictObject({
    local: z.string().max(25),
    zone: z.string().max(64),
    fold: z.union([z.literal(0), z.literal(1)]).nullable().optional(),
    offset: z.string().max(6).nullable().optional(),
  }),
]);
export type InstantInput = z.infer<typeof instantInput>;

export const breakInput = z.strictObject({
  start: instantInput,
  end: instantInput,
  counts_as_work: z.boolean(),
});
export type BreakInput = z.infer<typeof breakInput>;

export const loginBody = z.strictObject({
  email: z.string().max(254),
  password: z.string().max(256),
});

export const sessionBody = z.strictObject({
  start: instantInput,
  end: instantInput.nullable(),
  input_zone: z.string().max(64),
  breaks: z.array(breakInput).max(20),
  breaks_confirmed: z.boolean(),
  reason,
});
export type SessionBody = z.infer<typeof sessionBody>;

export const sessionUpdateBody = z.strictObject({
  start: instantInput,
  end: instantInput.nullable(),
  input_zone: z.string().max(64),
  breaks: z.array(breakInput).max(20),
  breaks_confirmed: z.boolean(),
  expected_version: z.number().int().positive(),
  reason,
});
export type SessionUpdateBody = z.infer<typeof sessionUpdateBody>;

export const deleteBody = z.strictObject({
  expected_version: z.number().int().positive(),
  reason,
});
export type DeleteBody = z.infer<typeof deleteBody>;

export const dayEntryBody = z.strictObject({
  category: z.enum(['Worked', 'Off', 'Vacation', 'Sick', 'Holiday', 'Shutdown']),
  leave_minutes: z.number().int().min(0).max(1440),
  wfh: z.boolean(),
  notes: z.string().max(2000),
  /** Required when the entry exists; omit or null to create it. */
  expected_version: z.number().int().positive().nullable().optional(),
  reason,
});
export type DayEntryBody = z.infer<typeof dayEntryBody>;

export const clockInBody = z.strictObject({
  input_zone: z.string().max(64),
  reason,
});
export type ClockInBody = z.infer<typeof clockInBody>;

export const clockOutBody = z.strictObject({
  /**
   * The session's complete actual break set. When present it replaces the saved rows,
   * confirmed or not (an empty list clears them). Omit it only for an unconfirmed Clock
   * out, which keeps the saved rows and leaves the breaks unknown (R-01, R-02).
   */
  breaks: z.array(breakInput).max(20).optional(),
  breaks_confirmed: z.boolean(),
  /** Version of the running session as last loaded; a mismatch is 409 stale_version. */
  expected_version: z.number().int().positive(),
  reason,
});
export type ClockOutBody = z.infer<typeof clockOutBody>;

export const policyBody = z.strictObject({
  effective_from: z.string().max(10),
  // Numeric semantics (whole minutes, ranges) are checked by the domain for exact error codes.
  required_minutes: z.number(),
  threshold_minutes: z.number(),
  rounding_step_minutes: z.number(),
  reference_start: z.string().max(5),
  reference_end: z.string().max(5),
  breaks: z
    .array(
      z.strictObject({
        start_offset_minutes: z.number(),
        duration_minutes: z.number(),
        counts_as_work: z.boolean(),
      }),
    )
    .max(10),
  deficit_mode: z.enum(['ignore', 'auto_deduct', 'choose_at_signoff']),
  note: z.string().max(500).optional(),
});
export type PolicyBody = z.infer<typeof policyBody>;
