import { type SubmitEvent, useState } from 'react';
import { api, ApiRequestError } from './api.ts';

/** The password policy of every account (12-256 characters), checked here for a quick answer; the server decides. */
const MIN_PASSWORD_LENGTH = 12;

/**
 * First-time setup (WP4-T03): the first administrator of a freshly bootstrapped instance. It is offered only while
 * the server reports that the instance is configured for setup and has no administrator, and it is the only way
 * the one-time setup token is used. The token is typed by hand from the operator's terminal and goes to the server
 * in one POST body: it is never put in a URL, local or session storage or a cookie, and it is not kept after
 * success. Every refusal reads the same ("Setup is not available"), so the screen cannot tell a visitor why.
 */
export function SetupScreen({ onCreated }: { onCreated: () => void }) {
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError('The two passwords do not match');
      return;
    }
    setBusy(true);
    try {
      await api('POST', '/api/auth/bootstrap', { token, email, display_name: displayName, password });
      setToken('');
      setPassword('');
      setConfirm('');
      onCreated();
    } catch (caught) {
      setError(caught instanceof ApiRequestError ? caught.message : 'Setup failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="page narrow">
      <h1>First-time setup</h1>
      <p className="muted">Create the first administrator. This works once; afterwards this screen is gone.</p>
      <form className="card stack" onSubmit={submit}>
        <label>
          Setup token
          <input
            className="mono"
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            autoComplete="off"
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck={false}
            aria-describedby="setup-token-hint"
            required
          />
        </label>
        <p id="setup-token-hint" className="hint muted">
          Type the token the operator's terminal printed. It is valid for 60 minutes after it was issued.
        </p>
        <label>
          Email
          <input type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          Display name
          <input type="text" autoComplete="name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
        </label>
        <label>
          Password
          <input
            type="password"
            autoComplete="new-password"
            minLength={MIN_PASSWORD_LENGTH}
            aria-describedby="setup-password-hint"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <p id="setup-password-hint" className="hint muted">
          At least {MIN_PASSWORD_LENGTH} characters.
        </p>
        <label>
          Confirm password
          <input
            type="password"
            autoComplete="new-password"
            minLength={MIN_PASSWORD_LENGTH}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
        </label>
        {error !== null && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <button type="submit" disabled={busy}>
          Create administrator
        </button>
      </form>
    </main>
  );
}
