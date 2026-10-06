import { type SubmitEvent, useCallback, useEffect, useState } from 'react';
import { api, ApiRequestError, type ReceivedShare, type SetupStatus, type SharesResponse, type User } from './api.ts';
import { AdminScreen } from './AdminScreen.tsx';
import { AppShell, useHashRoute } from './components/AppShell.tsx';
import { shareEndedMessage } from './components/sharingModel.ts';
import { HistoryScreen } from './HistoryScreen.tsx';
import { ImportScreen } from './ImportScreen.tsx';
import { OtScreen } from './OtScreen.tsx';
import { ReviewScreen } from './ReviewScreen.tsx';
import { SettingsScreen } from './SettingsScreen.tsx';
import { SetupScreen } from './SetupScreen.tsx';
import { SharedTimesheetScreen } from './SharedTimesheetScreen.tsx';
import { TimesheetScreen } from './TimesheetScreen.tsx';

/**
 * Auth gate: the first-time Setup screen (only while the server says the instance is configured and has no
 * administrator), the sign-in form, or the shell with its hash-routed screens.
 */
export function App() {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  // 'unknown' until the server has answered; an unreadable answer reads as closed, so the sign-in form shows.
  const [setup, setSetup] = useState<'unknown' | 'open' | 'closed'>('unknown');
  const [justCreated, setJustCreated] = useState(false);

  useEffect(() => {
    api<{ user: User }>('GET', '/api/auth/me')
      .then((response) => setUser(response.user))
      .catch(() => setUser(null));
  }, []);

  // Asked only while signed out, and again after a sign-out. A read: it never uses or shows the setup token.
  useEffect(() => {
    if (user !== null) return;
    api<SetupStatus>('GET', '/api/auth/setup')
      .then((status) => setSetup(status.available ? 'open' : 'closed'))
      .catch(() => setSetup('closed'));
  }, [user]);

  if (user === undefined) return <p className="muted page">Loading…</p>;
  if (user === null) {
    if (setup === 'unknown') return <p className="muted page">Loading…</p>;
    if (setup === 'open') {
      return (
        <SetupScreen
          onCreated={() => {
            setJustCreated(true);
            setSetup('closed');
          }}
        />
      );
    }
    return (
      <LoginForm
        created={justCreated}
        onSignedIn={(signedIn) => {
          setJustCreated(false);
          setUser(signedIn);
        }}
      />
    );
  }
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
      {route.id === 'import' && <ImportScreen />}
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

function LoginForm({ onSignedIn, created }: { onSignedIn: (user: User) => void; created: boolean }) {
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
      {created && (
        <p className="notice-ok" role="status">
          Administrator created. Sign in with the new account.
        </p>
      )}
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
