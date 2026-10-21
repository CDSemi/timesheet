import { type SubmitEvent, useEffect, useId, useRef, useState } from 'react';
import { api, ApiRequestError, type CurrentPeriods, type PasswordChangeRequest, type PasswordChangeResult, type User } from './api.ts';
import { Avatar } from './components/AccountMenu.tsx';
import { describeError } from './components/errors.ts';
import { roleLabel } from './components/accountModel.ts';

/** The server's password length rule (12 to 256 characters); the server decides, this only words it early. */
const MIN_PASSWORD_LENGTH = 12;
const MAX_PASSWORD_LENGTH = 256;

/** A password-change refusal in words; nothing was changed in any of these cases. */
function passwordErrorMessage(caught: unknown): string {
  if (!(caught instanceof ApiRequestError)) return 'The password could not be changed. Check the connection and try again.';
  switch (caught.code) {
    case 'current_password_incorrect':
      return 'The current password is not correct. Nothing was changed.';
    case 'rate_limited':
      return 'Too many wrong current passwords. Wait a few minutes, then try again. Nothing was changed.';
    case 'weak_password':
      return `The new password must have ${MIN_PASSWORD_LENGTH} to ${MAX_PASSWORD_LENGTH} characters. Nothing was changed.`;
    case 'password_unchanged':
      return 'The new password must differ from the current one. Nothing was changed.';
    default:
      return describeError(caught);
  }
}

/**
 * Change password (owner decision D-9 b): the current password, a new one of 12 to 256 characters and its confirmation,
 * checked in the browser before sending. On success this session stays signed in and the server signs out every other
 * session of the account. The administrator's temporary password for a new account (E-11) is a separate path.
 */
function ChangePasswordCard({ email }: { email: string }) {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const noticeRef = useRef<HTMLParagraphElement>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);
  const hintId = useId();

  useEffect(() => {
    if (done) noticeRef.current?.focus();
  }, [done]);

  useEffect(() => {
    if (error !== null) errorRef.current?.focus();
  }, [error]);

  async function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setDone(false);
    const problem =
      current === ''
        ? 'Enter your current password.'
        : next.length < MIN_PASSWORD_LENGTH || next.length > MAX_PASSWORD_LENGTH
          ? `The new password must have ${MIN_PASSWORD_LENGTH} to ${MAX_PASSWORD_LENGTH} characters.`
          : next !== confirm
            ? 'The new password and its confirmation differ. Type them again.'
            : null;
    if (problem !== null) {
      setError(problem);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await api<PasswordChangeResult>('POST', '/api/auth/password', { current_password: current, new_password: next } satisfies PasswordChangeRequest);
      setCurrent('');
      setNext('');
      setConfirm('');
      setDone(true);
    } catch (caught) {
      setError(passwordErrorMessage(caught));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="card stack password-card" aria-labelledby="password-title" data-password-card>
      <h2 id="password-title">Change password</h2>
      {done && (
        <p className="notice-ok" role="status" tabIndex={-1} ref={noticeRef} data-password-notice>
          Password changed. You stay signed in here; your other sign-ins were signed out.
        </p>
      )}
      {error !== null && (
        <p className="error" role="alert" tabIndex={-1} ref={errorRef} data-error="password">
          {error}
        </p>
      )}
      <form className="stack" noValidate onSubmit={(event) => void submit(event)} aria-label="Change password">
        {/* The account name for password managers; not a field the person edits. */}
        <input type="email" name="username" autoComplete="username" value={email} readOnly hidden />
        <label>
          Current password
          <input
            type="password"
            name="current-password"
            autoComplete="current-password"
            value={current}
            maxLength={MAX_PASSWORD_LENGTH}
            onChange={(event) => setCurrent(event.target.value)}
            data-field="current-password"
          />
        </label>
        <label>
          New password
          <input
            type="password"
            name="new-password"
            autoComplete="new-password"
            value={next}
            maxLength={MAX_PASSWORD_LENGTH}
            aria-describedby={hintId}
            onChange={(event) => setNext(event.target.value)}
            data-field="new-password"
          />
        </label>
        <p className="hint muted" id={hintId}>
          {MIN_PASSWORD_LENGTH} to {MAX_PASSWORD_LENGTH} characters. Use a passphrase you do not use anywhere else.
        </p>
        <label>
          Confirm new password
          <input
            type="password"
            name="confirm-password"
            autoComplete="new-password"
            value={confirm}
            maxLength={MAX_PASSWORD_LENGTH}
            onChange={(event) => setConfirm(event.target.value)}
            data-field="confirm-password"
          />
        </label>
        <div className="button-row">
          <button type="submit" disabled={busy}>
            Change password
          </button>
        </div>
      </form>
    </section>
  );
}

/**
 * Profile (WP5-UX3-T03, owner decision U-04): the signed-in person's display name, email, role and reporting zone, and
 * since D-9 b their own password change. The reporting zone is the saved IANA zone the server groups timesheets by
 * (never this device's zone). Changing a display name is an administrator's action (Administration).
 */
export function ProfileScreen({ user }: { user: User }) {
  const [zone, setZone] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let current = true;
    api<CurrentPeriods>('GET', '/api/periods/current')
      .then((periods) => {
        if (current) setZone(periods.reporting_zone);
      })
      .catch((caught: unknown) => {
        if (current) setLoadError(describeError(caught));
      });
    return () => {
      current = false;
    };
  }, []);

  return (
    <div className="stack profile-screen">
      <h1 tabIndex={-1}>Profile</h1>
      <section className="card profile-card" aria-label="Your profile">
        <Avatar user={user} />
        <dl className="profile-facts">
          <div>
            <dt>Display name</dt>
            <dd data-profile="display-name">{user.display_name}</dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd data-profile="email">{user.email}</dd>
          </div>
          <div>
            <dt>Role</dt>
            <dd data-profile="role">{roleLabel(user.role) ?? 'Employee'}</dd>
          </div>
          <div>
            <dt>Reporting zone</dt>
            <dd data-profile="zone">{zone ?? (loadError === null ? 'Loading…' : 'Unavailable')}</dd>
          </div>
        </dl>
      </section>
      {loadError !== null && (
        <p className="error" role="alert">
          {loadError}
        </p>
      )}
      <p className="hint muted">An administrator changes display names.</p>
      <ChangePasswordCard email={user.email} />
    </div>
  );
}
