import { type SubmitEvent, useEffect, useState } from 'react';
import { api, ApiRequestError, type User } from './api.ts';
import { AdminScreen } from './AdminScreen.tsx';
import { AppShell, useHashRoute } from './components/AppShell.tsx';
import { HistoryScreen } from './HistoryScreen.tsx';
import { OtScreen } from './OtScreen.tsx';
import { ReviewScreen } from './ReviewScreen.tsx';
import { SettingsScreen } from './SettingsScreen.tsx';
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

function SignedIn({ user, onSignedOut }: { user: User; onSignedOut: () => void }) {
  const route = useHashRoute(user.role);
  return (
    // The review of a period belongs under Timesheet in the navigation.
    <AppShell user={user} route={route.id === 'review' ? 'timesheet' : route.id} onSignedOut={onSignedOut}>
      {route.id === 'timesheet' && <TimesheetScreen user={user} />}
      {route.id === 'review' && <ReviewScreen key={route.payrollDate} payrollDate={route.payrollDate} />}
      {route.id === 'ot' && <OtScreen />}
      {route.id === 'history' && <HistoryScreen />}
      {route.id === 'settings' && <SettingsScreen />}
      {route.id === 'admin' && user.role === 'admin' && <AdminScreen user={user} />}
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
