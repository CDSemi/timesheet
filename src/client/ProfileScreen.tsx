import { useEffect, useState } from 'react';
import { api, type CurrentPeriods, type User } from './api.ts';
import { Avatar } from './components/AccountMenu.tsx';
import { describeError } from './components/errors.ts';
import { roleLabel } from './components/accountModel.ts';

/**
 * Profile (WP5-UX3-T03, owner decision U-04): the signed-in person's display name, email, role and reporting zone, read
 * only. The reporting zone is the saved IANA zone the server groups timesheets by (never this device's zone). Changing a
 * display name is an administrator's action (Administration); the password is a separate decision (D-9).
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
      <h1>Profile</h1>
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
    </div>
  );
}
