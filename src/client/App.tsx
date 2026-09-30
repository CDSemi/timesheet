import { type SubmitEvent, useEffect, useState } from 'react';
import { api, ApiRequestError, type User } from './api.ts';
import { TimesheetScreen } from './TimesheetScreen.tsx';

/** WP1 skeleton: sign-in and a read-only two-week view; the full editor arrives in WP2. */
export function App() {
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => {
    api<{ user: User }>('GET', '/api/auth/me')
      .then((response) => setUser(response.user))
      .catch(() => setUser(null));
  }, []);

  if (user === undefined) return <p className="muted page">Loading…</p>;
  if (user === null) return <LoginForm onSignedIn={setUser} />;
  return <TimesheetScreen user={user} onSignedOut={() => setUser(null)} />;
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
