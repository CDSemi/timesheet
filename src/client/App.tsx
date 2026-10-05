import { type SubmitEvent, useCallback, useEffect, useState } from 'react';
import { api, ApiRequestError, type ReceivedShare, type SharesResponse, type User } from './api.ts';
import { AdminScreen } from './AdminScreen.tsx';
import { AppShell, useHashRoute } from './components/AppShell.tsx';
import { shareEndedMessage } from './components/sharingModel.ts';
import { HistoryScreen } from './HistoryScreen.tsx';
import { OtScreen } from './OtScreen.tsx';
import { ReviewScreen } from './ReviewScreen.tsx';
import { SettingsScreen } from './SettingsScreen.tsx';
import { SharedTimesheetScreen } from './SharedTimesheetScreen.tsx';
import { TimesheetScreen } from './TimesheetScreen.tsx';

/** Auth gate: the sign-in form, or the shell with its hash-routed screens. */
export function App() {
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => {
    api<{ user: User }>('GET', '/api/auth/me')
      .then((response) => setUser(response.user))
      .catch(() => setUser(null));
  }, []);

  if (user === undefined) return <p className="muted page">Loading…</p>;
  if (user === null) return <LoginForm onSignedIn={setUser} />;
  return <SignedIn user={user} onSignedOut={() => setUser(null)} />;
}

/**
 * The shares other people gave this user (the "Shared with me" list), read from the server. `null`
 * while the first answer is outstanding; an unreadable answer reads as no shares. `refresh` reads
 * them again and returns them (null when the server could not be asked).
 */
function useReceivedShares() {
  const [received, setReceived] = useState<readonly ReceivedShare[] | null>(null);
  const refresh = useCallback(async (): Promise<readonly ReceivedShare[] | null> => {
    try {
      const answer = await api<SharesResponse>('GET', '/api/shares');
      setReceived(answer.received);
      return answer.received;
    } catch {
      setReceived((current) => current ?? []);
      return null;
    }
  }, []);
  return { received, refresh };
}

function SignedIn({ user, onSignedOut }: { user: User; onSignedOut: () => void }) {
  const route = useHashRoute(user.role);
  const { received, refresh } = useReceivedShares();
  const [flash, setFlash] = useState<string | null>(null);
  const routeKey = route.id === 'shared' ? `shared/${route.ownerId}/${route.view ?? ''}` : route.id;

  // The list is read again on every screen change, so a share that ended is noticed at the next navigation.
  useEffect(() => {
    void refresh();
  }, [refresh, routeKey]);

  // A share that ended (or never existed): say so, and leave for the user's own timesheets.
  const onEnded = useCallback(
    (ownerName: string | null) => {
      setFlash(shareEndedMessage(ownerName));
      window.location.hash = '#/timesheet';
      void refresh();
    },
    [refresh],
  );

  return (
    // The review of a period belongs under Timesheet in the navigation.
    <AppShell
      user={user}
      route={route.id === 'review' ? 'timesheet' : route.id}
      sharedOwnerId={route.id === 'shared' ? route.ownerId : null}
      received={received ?? []}
      flash={flash}
      onDismissFlash={() => setFlash(null)}
      onSignedOut={onSignedOut}
    >
      {route.id === 'timesheet' && <TimesheetScreen user={user} />}
      {route.id === 'review' && <ReviewScreen key={route.payrollDate} payrollDate={route.payrollDate} />}
      {route.id === 'ot' && <OtScreen />}
      {route.id === 'history' && <HistoryScreen />}
      {route.id === 'settings' && <SettingsScreen onSharesChanged={() => void refresh()} />}
      {route.id === 'admin' && user.role === 'admin' && <AdminScreen user={user} />}
      {route.id === 'shared' && (
        <SharedTimesheetScreen
          key={route.ownerId}
          user={user}
          ownerId={route.ownerId}
          view={route.view}
          received={received}
          refreshShares={refresh}
          onEnded={onEnded}
        />
      )}
    </AppShell>
  );
}

function LoginForm({ onSignedIn }: { onSignedIn: (user: User) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const response = await api<{ user: User }>('POST', '/api/auth/login', { email, password });
      onSignedIn(response.user);
    } catch (caught) {
      setError(caught instanceof ApiRequestError ? caught.message : 'Sign-in failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="page narrow">
      <h1>Timesheet</h1>
      <form className="card stack" onSubmit={submit}>
        <label>
          Email
          <input type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          Password
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        {error !== null && <p className="error">{error}</p>}
        <button type="submit" disabled={busy}>
          Sign in
        </button>
      </form>
    </main>
  );
}
