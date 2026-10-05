import { useCallback, useEffect, useState } from 'react';
import { api, type AdminUser, type AdminUserCreateRequest, type CalendarInfo, type CurrentPeriods, type User } from './api.ts';
import { calendarOptions, defaultImportYear } from './components/adminModel.ts';
import { type UserActions, UserCreateForm, UserRow } from './components/AdminUsers.tsx';
import { describeError } from './components/errors.ts';
import { HolidayImport } from './components/HolidayImport.tsx';
import { OperationsStatus } from './components/OperationsStatus.tsx';
import { PayrollExceptions } from './components/PayrollExceptions.tsx';

interface AdminData {
  users: AdminUser[];
  calendar: CalendarInfo;
  periods: CurrentPeriods;
}

async function loadAdmin(): Promise<AdminData> {
  const [users, calendar, periods] = await Promise.all([
    api<{ users: AdminUser[] }>('GET', '/api/admin/users'),
    api<CalendarInfo>('GET', '/api/calendar'),
    api<CurrentPeriods>('GET', '/api/periods/current'),
  ]);
  return { users: users.users, calendar, periods };
}

/**
 * Administration (FR-01, FR-13, F-3): accounts, company configuration and the operations status
 * (pipeline health, per-person submission and delivery states with recipient addresses). Nothing
 * here reads or shows another person's timesheet details (entries, sessions, OT ledger, leave,
 * notes, history, exports, templates or message content); the admin routes do not return them.
 * Hiding this screen from employees is a convenience: the server answers 403.
 */
export function AdminScreen({ user }: { user: User }) {
  const [data, setData] = useState<AdminData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const reload = useCallback(async () => {
    try {
      setData(await loadAdmin());
      setLoadError(null);
    } catch (caught) {
      setLoadError(describeError(caught));
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  /** Runs one account action and reloads the list afterwards, also after a refusal (which is rethrown for the row). */
  const perform = useCallback(
    async (work: () => Promise<unknown>) => {
      setBusy(true);
      try {
        await work();
      } finally {
        await reload();
        setBusy(false);
      }
    },
    [reload],
  );

  if (data === null) {
    return loadError === null ? (
      <p className="muted">Loading…</p>
    ) : (
      <p className="error" role="alert">
        {loadError}
      </p>
    );
  }

  const calendars = calendarOptions(data.users, data.calendar);
  const warnings = data.calendar.warnings;
  const actions: UserActions = {
    update: (target, changes) => perform(() => api('PATCH', `/api/admin/users/${target.id}`, changes)),
    setActive: (target, active, reason) =>
      perform(() =>
        api('POST', `/api/admin/users/${target.id}/${active ? 'reactivate' : 'deactivate'}`, reason.trim() === '' ? {} : { reason: reason.trim() }),
      ),
  };
  const create = (request: AdminUserCreateRequest) => perform(() => api('POST', '/api/admin/users', request));

  return (
    <div className="stack admin-screen">
      <h1>Administration</h1>
      <p className="hint muted">
        Accounts, company calendar and operations status. This screen never shows anyone's timesheet details: entries, sessions, OT, leave, notes,
        history, exports, templates or message content.
      </p>
      {warnings.map((warning) => (
        <section key={warning.code} className="warn-box stack" role="status" aria-label="Calendar warning" data-warning={warning.code}>
          <h2>Calendar for {warning.year} is missing</h2>
          <p>{warning.message}</p>
        </section>
      ))}
      <section className="stack" aria-label="Accounts">
        <h2>Accounts</h2>
        <ul className="plain user-list">
          {data.users.map((account) => (
            <UserRow key={account.id} user={account} isSelf={account.id === user.id} calendars={calendars} busy={busy} actions={actions} />
          ))}
        </ul>
      </section>
      <OperationsStatus />
      <UserCreateForm calendars={calendars} onCreate={create} />
      <HolidayImport
        calendars={calendars}
        initialYear={defaultImportYear(data.periods.today_local, warnings)}
        initialEffectiveFrom={data.periods.current.period_start}
        onCommitted={reload}
      />
      <PayrollExceptions calendars={calendars} exceptions={data.calendar.payroll_exceptions} onCreated={reload} />
    </div>
  );
}
