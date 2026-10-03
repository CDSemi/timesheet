import { type Context, Hono } from 'hono';
import { assertCivilDate, diffDays } from '../../domain/dates.ts';
import { editReasonRequirement } from '../../domain/editReason.ts';
import { currentPayPeriod, payPeriodContaining, payPeriodsOverlapping } from '../../domain/periods.ts';
import { requireUser } from '../http/auth.ts';
import { ApiError, notFound } from '../http/errors.ts';
import {
  clockInBody,
  clockOutBody,
  dayBatchBody,
  dayEntryBody,
  deleteBody,
  policyBody,
  type PolicyBody,
  sessionBody,
  sessionUpdateBody,
} from '../http/schemas.ts';
import { readJson } from '../http/validation.ts';
import { calendarWarnings } from '../services/calendars.ts';
import { commitDayBatch, previewDayBatch } from '../services/dayEntries.ts';
import { periodJson } from '../services/periods.ts';
import {
  createPolicyVersion,
  listPolicyVersions,
  type PolicyProposal,
  policyJson,
  previewPolicyVersion,
} from '../services/policies.ts';
import {
  clockIn,
  clockOut,
  type CommandContext,
  createSession,
  deleteSession,
  updateSession,
  upsertDayEntry,
} from '../services/timesheetCommands.ts';
import {
  findSession,
  getDayView,
  getTimesheetView,
  loadScope,
  sessionJson,
  todayInReportingZone,
} from '../services/timesheets.ts';
import type { AppDeps, AppEnv } from '../types.ts';

const MAX_PERIOD_RANGE_DAYS = 400;

/**
 * Authenticated personal API. Every handler derives the owner from the session user;
 * no route accepts a user id, and admin role grants no access to other users' data.
 */
export function apiRoutes(deps: AppDeps) {
  const app = new Hono<AppEnv>();
  const auth = requireUser(deps);
  const command = (c: Context<AppEnv>): CommandContext => ({ db: deps.db, clock: deps.clock, user: c.get('user') });

  app.get('/calendar', auth, (c) => {
    const scope = loadScope(deps.db, c.get('user'));
    const s = scope.calendar.schedule;
    return c.json({
      id: scope.calendar.id,
      name: scope.calendar.name,
      reporting_zone: s.reportingZone,
      payroll: {
        anchor_payroll_date: s.anchorPayrollDate,
        cycle_days: s.cycleDays,
        period_start_offset_days: s.periodStartOffsetDays,
        period_end_offset_days: s.periodEndOffsetDays,
        due_offset_days: s.dueOffsetDays,
        due_local_time: s.dueLocalTime,
      },
      versions: scope.calendarVersions.map((version) => ({
        id: version.id,
        seq: version.seq,
        effective_from: version.effectiveFrom,
        weekdays: version.weekdays,
        dates: version.dates,
      })),
      payroll_exceptions: scope.exceptions.map((item) => ({
        nominal_payroll_date: item.nominalPayrollDate,
        payroll_date: item.payrollDate,
        due_local_date: item.dueLocalDate ?? null,
        due_local_time: item.dueLocalTime ?? null,
      })),
      // E-12: from 1 October, a warning while next year's company calendar dates are missing.
      warnings: calendarWarnings(deps.clock, s, scope.calendarVersions),
    });
  });

  app.get('/periods/current', auth, (c) => {
    const scope = loadScope(deps.db, c.get('user'));
    const today = todayInReportingZone(deps.clock, scope);
    return c.json({
      reporting_zone: scope.calendar.schedule.reportingZone,
      today_local: today,
      current: periodJson(currentPayPeriod(scope.calendar.schedule, today, scope.exceptions)),
      in_progress: periodJson(payPeriodContaining(scope.calendar.schedule, today, scope.exceptions)),
    });
  });

  app.get('/periods', auth, (c) => {
    const from = assertCivilDate(c.req.query('from'), 'from');
    const to = assertCivilDate(c.req.query('to'), 'to');
    if (to < from || diffDays(to, from) > MAX_PERIOD_RANGE_DAYS) {
      throw new ApiError(422, 'invalid_range', `Use a range of at most ${MAX_PERIOD_RANGE_DAYS} days`);
    }
    const scope = loadScope(deps.db, c.get('user'));
    const today = todayInReportingZone(deps.clock, scope);
    const periods = payPeriodsOverlapping(scope.calendar.schedule, from, to, scope.exceptions).map((period) => ({
      ...periodJson(period),
      relation: editReasonRequirement({
        schedule: scope.calendar.schedule,
        exceptions: scope.exceptions,
        todayLocal: today,
        targetPeriodIndex: period.index,
        finalized: false,
      }).relation,
    }));
    return c.json({ reporting_zone: scope.calendar.schedule.reportingZone, periods });
  });

  app.get('/timesheets/:payrollDate', auth, (c) =>
    c.json(getTimesheetView(deps.db, deps.clock, c.get('user'), c.req.param('payrollDate'))),
  );

  app.get('/days/:workDate', auth, (c) => c.json(getDayView(deps.db, deps.clock, c.get('user'), c.req.param('workDate'))));

  // Preview first, then commit with a per-date expected_version (all or nothing).
  app.post('/days/batch', auth, async (c) => {
    const body = await readJson(c, dayBatchBody);
    return c.json(body.mode === 'preview' ? previewDayBatch(command(c), body) : commitDayBatch(command(c), body));
  });

  app.put('/days/:workDate', auth, async (c) =>
    c.json(upsertDayEntry(command(c), c.req.param('workDate'), await readJson(c, dayEntryBody))),
  );

  app.post('/days/:workDate/sessions', auth, async (c) =>
    c.json(createSession(command(c), c.req.param('workDate'), await readJson(c, sessionBody)), 201),
  );

  app.get('/sessions/:id', auth, (c) => {
    const session = findSession(deps.db, c.get('user').id, c.req.param('id'));
    if (session === undefined) throw notFound('Work session');
    return c.json({ session: sessionJson(session) });
  });

  app.put('/sessions/:id', auth, async (c) =>
    c.json(updateSession(command(c), c.req.param('id'), await readJson(c, sessionUpdateBody))),
  );

  app.delete('/sessions/:id', auth, async (c) =>
    c.json(deleteSession(command(c), c.req.param('id'), await readJson(c, deleteBody))),
  );

  app.post('/clock/in', auth, async (c) => c.json(clockIn(command(c), await readJson(c, clockInBody)), 201));

  app.post('/clock/out', auth, async (c) => c.json(clockOut(command(c), await readJson(c, clockOutBody))));

  app.get('/policies', auth, (c) => c.json({ policies: listPolicyVersions(deps.db, c.get('user').id).map(policyJson) }));

  const policyProposal = (c: Context<AppEnv>, body: PolicyBody): PolicyProposal => ({
    userId: c.get('user').id,
    calendarId: c.get('user').calendarId,
    effectiveFrom: body.effective_from,
    note: body.note,
    rules: {
      requiredMinutes: body.required_minutes,
      thresholdMinutes: body.threshold_minutes,
      roundingStepMinutes: body.rounding_step_minutes,
      referenceStart: body.reference_start,
      referenceEnd: body.reference_end,
      deficitMode: body.deficit_mode,
      breaks: body.breaks.map((item) => ({
        startOffsetMinutes: item.start_offset_minutes,
        durationMinutes: item.duration_minutes,
        countsAsWork: item.counts_as_work,
      })),
    },
  });

  app.post('/policies', auth, async (c) => {
    const proposal = policyProposal(c, await readJson(c, policyBody));
    return c.json({ policy: policyJson(createPolicyVersion(deps.db, deps.clock, proposal, c.get('user').id)) }, 201);
  });

  // Dry run of POST /policies: same body and checks, writes nothing, lists the changed draft days.
  app.post('/policies/preview', auth, async (c) =>
    c.json(previewPolicyVersion(deps.db, deps.clock, c.get('user'), policyProposal(c, await readJson(c, policyBody)))),
  );

  return app;
}
