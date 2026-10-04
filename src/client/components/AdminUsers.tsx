import { type SubmitEvent, useState } from 'react';
import { type AdminUser, type AdminUserCreateRequest, type AdminUserUpdateRequest } from '../api.ts';
import { type CalendarOption, passwordProblem, refusalMessage } from './adminModel.ts';

type Role = AdminUser['role'];

function CalendarSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: CalendarOption[];
  onChange: (id: string) => void;
}) {
  return (
    <label>
      {label}
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

/**
 * Creates an account. The temporary password is typed here (E-11), sent once and cleared at
 * once; nothing on the screen can show it again, and there is no reset route.
 */
export function UserCreateForm({
  calendars,
  onCreate,
}: {
  calendars: CalendarOption[];
  onCreate: (request: AdminUserCreateRequest) => Promise<void>;
}) {
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<Role>('employee');
  const [calendarId, setCalendarId] = useState(calendars[0]?.id ?? '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const problem = password === '' ? null : passwordProblem(password);
  const valid = email.trim() !== '' && displayName.trim() !== '' && calendarId !== '' && password !== '' && problem === null;

  async function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!valid || busy) return;
    setBusy(true);
    setError(null);
    setDone(null);
    try {
      await onCreate({ email: email.trim(), display_name: displayName.trim(), role, password, calendar_id: calendarId });
      setDone(`Account ${email.trim()} created. The temporary password is not shown again; give it to the person out of band.`);
      setEmail('');
      setDisplayName('');
      setRole('employee');
    } catch (caught) {
      setError(refusalMessage(caught));
    } finally {
      // The password never stays in the form, whether or not the request worked.
      setPassword('');
      setBusy(false);
    }
  }

  return (
    <form className="card stack" aria-label="Create account" onSubmit={submit}>
      <h2>Create account</h2>
      <div className="field-grid">
        <label>
          Email
          <input type="email" autoComplete="off" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </label>
        <label>
          Display name
          <input value={displayName} maxLength={120} onChange={(event) => setDisplayName(event.target.value)} required />
        </label>
        <label>
          Role
          <select value={role} onChange={(event) => setRole(event.target.value as Role)}>
            <option value="employee">Employee</option>
            <option value="admin">Administrator</option>
          </select>
        </label>
        <CalendarSelect label="Calendar" value={calendarId} options={calendars} onChange={setCalendarId} />
        <label>
          Temporary password
          <input type="password" autoComplete="new-password" value={password} maxLength={256} onChange={(event) => setPassword(event.target.value)} required />
        </label>
      </div>
      <p className="hint muted">You type the temporary password and give it to the person yourself. It is stored only as a hash and is never shown again.</p>
      {problem !== null && <p className="notice">{problem}</p>}
      {error !== null && (
        <p className="error" role="alert" data-error="user-create">
          {error}
        </p>
      )}
      {done !== null && (
        <p className="notice-ok" role="status" data-status="user-created">
          {done}
        </p>
      )}
      <div className="button-row">
        <button type="submit" disabled={!valid || busy}>
          Create account
        </button>
      </div>
    </form>
  );
}

export interface UserActions {
  update: (user: AdminUser, changes: AdminUserUpdateRequest) => Promise<void>;
  setActive: (user: AdminUser, active: boolean, reason: string) => Promise<void>;
}

/** One account: its facts, an inline edit form and the deactivate or reactivate action. */
export function UserRow({
  user,
  isSelf,
  calendars,
  busy,
  actions,
}: {
  user: AdminUser;
  isSelf: boolean;
  calendars: CalendarOption[];
  busy: boolean;
  actions: UserActions;
}) {
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user.display_name);
  const [role, setRole] = useState<Role>(user.role);
  const [calendarId, setCalendarId] = useState(user.calendar_id);
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const active = user.status === 'active';

  async function run(work: () => Promise<void>, message: string) {
    setError(null);
    setSaved(null);
    try {
      await work();
      setSaved(message);
      return true;
    } catch (caught) {
      setError(refusalMessage(caught));
      return false;
    }
  }

  async function save(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const changes: AdminUserUpdateRequest = {
      ...(displayName.trim() !== user.display_name ? { display_name: displayName.trim() } : {}),
      ...(role !== user.role ? { role } : {}),
      ...(calendarId !== user.calendar_id ? { calendar_id: calendarId } : {}),
    };
    if (Object.keys(changes).length === 0) {
      setEditing(false);
      return;
    }
    if (await run(() => actions.update(user, changes), 'Saved.')) setEditing(false);
  }

  function startEdit() {
    setDisplayName(user.display_name);
    setRole(user.role);
    setCalendarId(user.calendar_id);
    setError(null);
    setSaved(null);
    setEditing(true);
  }

  return (
    <li className="user-row card stack" data-user-email={user.email} data-user-status={user.status}>
      <div className="user-head">
        <h3>{user.display_name}</h3>
        <span className={`badge ${active ? 'current' : 'old'}`}>{active ? 'Active' : 'Deactivated'}</span>
        {isSelf && <span className="badge">You</span>}
      </div>
      <dl className="facts">
        <div>
          <dt>Email</dt>
          <dd>{user.email}</dd>
        </div>
        <div>
          <dt>Role</dt>
          <dd>{user.role === 'admin' ? 'Administrator' : 'Employee'}</dd>
        </div>
        <div>
          <dt>Calendar</dt>
          <dd>{calendars.find((option) => option.id === user.calendar_id)?.label ?? user.calendar_id}</dd>
        </div>
      </dl>
      {editing && (
        <form className="stack editor-form" aria-label={`Edit ${user.email}`} onSubmit={save}>
          <div className="field-grid">
            <label>
              Display name
              <input value={displayName} maxLength={120} onChange={(event) => setDisplayName(event.target.value)} required />
            </label>
            <label>
              Role
              <select value={role} onChange={(event) => setRole(event.target.value as Role)}>
                <option value="employee">Employee</option>
                <option value="admin">Administrator</option>
              </select>
            </label>
            <CalendarSelect label="Calendar" value={calendarId} options={calendars} onChange={setCalendarId} />
          </div>
          <div className="button-row">
            <button type="submit" disabled={busy || displayName.trim() === ''}>
              Save changes
            </button>
            <button type="button" className="secondary" onClick={() => setEditing(false)}>
              Cancel
            </button>
          </div>
        </form>
      )}
      <label>
        Reason (optional)
        <input value={reason} maxLength={1000} onChange={(event) => setReason(event.target.value)} />
      </label>
      {error !== null && (
        <p className="error" role="alert" data-error="user-row">
          {error}
        </p>
      )}
      {saved !== null && (
        <p className="notice-ok" role="status">
          {saved}
        </p>
      )}
      <div className="button-row">
        {!editing && (
          <button type="button" className="secondary" disabled={busy} onClick={startEdit}>
            Edit
          </button>
        )}
        {active ? (
          <button type="button" className="secondary" disabled={busy} onClick={() => void run(() => actions.setActive(user, false, reason), 'Deactivated. Its sessions were signed out.')}>
            Deactivate
          </button>
        ) : (
          <button type="button" className="secondary" disabled={busy} onClick={() => void run(() => actions.setActive(user, true, reason), 'Reactivated.')}>
            Reactivate
          </button>
        )}
      </div>
    </li>
  );
}
