import { type SubmitEvent, useCallback, useEffect, useState } from 'react';
import { api, ApiRequestError, type CurrentPeriods, type PolicyPreview as PolicyPreviewData, type PolicyVersion } from './api.ts';
import { describeError } from './components/errors.ts';
import { PolicyFields } from './components/PolicyFields.tsx';
import { PolicyPreview } from './components/PolicyPreview.tsx';
import { SharingSection } from './components/SharingSettings.tsx';
import { SubmissionSettingsSection } from './components/SubmissionSettings.tsx';
import { canCreate, DEFICIT_MODE_LABELS, draftFromPolicy, draftToRequest, type PolicyDraft, requestSignature } from './components/policyModel.ts';

interface SettingsData {
  policies: PolicyVersion[];
  periods: CurrentPeriods;
}

async function loadSettings(): Promise<SettingsData> {
  const [policies, periods] = await Promise.all([
    api<{ policies: PolicyVersion[] }>('GET', '/api/policies'),
    api<CurrentPeriods>('GET', '/api/periods/current'),
  ]);
  return { policies: policies.policies, periods };
}

/** A refusal in words; the earliest allowed date comes from the server, never from this device. */
function policyRefusal(caught: unknown): string {
  if (caught instanceof ApiRequestError && caught.code === 'retroactive_change') {
    const earliest = caught.details?.earliest_effective_from;
    return `A new version cannot take effect before ${typeof earliest === 'string' ? earliest : 'the start of the current pay period'}. Choose that date or a later one. (${caught.code})`;
  }
  return describeError(caught);
}

function PolicyHistory({ policies }: { policies: PolicyVersion[] }) {
  if (policies.length === 0) {
    return <p className="muted">You have no policy version yet. Create the first one below.</p>;
  }
  return (
    <ul className="plain history-list" aria-label="Policy versions">
      {[...policies].reverse().map((policy) => (
        <li key={policy.id} className="history-item" data-policy-seq={policy.seq}>
          <div className="history-head">
            <strong>Version {policy.seq}</strong>
            <span className="mono">from {policy.effective_from}</span>
          </div>
          <dl className="facts">
            <div>
              <dt>Required</dt>
              <dd>{policy.required_minutes} min</dd>
            </div>
            <div>
              <dt>Threshold</dt>
              <dd>{policy.threshold_minutes} min</dd>
            </div>
            <div>
              <dt>Rounding step</dt>
              <dd>{policy.rounding_step_minutes} min</dd>
            </div>
            <div>
              <dt>Reference day</dt>
              <dd>
                {policy.reference_start} to {policy.reference_end}
              </dd>
            </div>
            <div>
              <dt>Short day</dt>
              <dd>{policy.deficit_mode === undefined ? 'none' : DEFICIT_MODE_LABELS[policy.deficit_mode]}</dd>
            </div>
          </dl>
        </li>
      ))}
    </ul>
  );
}

/** Personal submission settings and the signature image, sharing (FR-17), then the policy versions (FR-05): a new version is previewed on the server, then created. */
export function SettingsScreen({ onSharesChanged }: { onSharesChanged: () => void }) {
  const [data, setData] = useState<SettingsData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [draft, setDraft] = useState<PolicyDraft | null>(null);
  const [preview, setPreview] = useState<{ signature: string; result: PolicyPreviewData } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const reload = useCallback(async (resetDraft: boolean) => {
    try {
      const next = await loadSettings();
      setData(next);
      setLoadError(null);
      if (resetDraft) setDraft(draftFromPolicy(next.policies.at(-1), next.periods.current.period_start));
      return next;
    } catch (caught) {
      setLoadError(describeError(caught));
      return null;
    }
  }, []);

  useEffect(() => {
    void reload(true);
  }, [reload]);

  if (data === null || draft === null) {
    return loadError === null ? (
      <p className="muted">Loading…</p>
    ) : (
      <p className="error" role="alert">
        {loadError}
      </p>
    );
  }

  const result = draftToRequest(draft);
  const previewMatches = result.ok && preview !== null && preview.signature === requestSignature(result.request);
  const creatable = canCreate(preview?.signature ?? null, result);

  function edit(next: PolicyDraft) {
    setDraft(next);
    setCreated(null);
    setError(null);
  }

  async function runPreview() {
    if (!result.ok) return;
    setBusy(true);
    setError(null);
    setCreated(null);
    try {
      const answer = await api<PolicyPreviewData>('POST', '/api/policies/preview', result.request);
      setPreview({ signature: requestSignature(result.request), result: answer });
    } catch (caught) {
      setPreview(null);
      setError(policyRefusal(caught));
    } finally {
      setBusy(false);
    }
  }

  async function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!result.ok || !creatable || busy) return;
    setBusy(true);
    setError(null);
    try {
      const answer = await api<{ policy: PolicyVersion }>('POST', '/api/policies', result.request);
      setPreview(null);
      const next = await reload(false);
      setDraft(draftFromPolicy(answer.policy, next?.periods.current.period_start ?? answer.policy.effective_from));
      setCreated(`Version ${answer.policy.seq} created, effective from ${answer.policy.effective_from}.`);
    } catch (caught) {
      setError(policyRefusal(caught));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="stack">
      <h1>Settings</h1>
      <SubmissionSettingsSection />
      <SharingSection onChanged={onSharesChanged} />
      <section className="card stack" aria-label="Import from Excel">
        <h2>Import from Excel</h2>
        <p className="hint muted">Bring in your own workbook and set your opening overtime balance.</p>
        <div className="button-row">
          <a className="button-link" href="#/import">
            Import from Excel
          </a>
        </div>
      </section>
      <section className="card stack" aria-label="Current policy versions">
        <h2>Your work policy</h2>
        <p className="hint muted">
          Versions are never edited. A new version applies from its effective date, and the earliest date is the start of the current pay period ({data.periods.current.period_start}).
        </p>
        <PolicyHistory policies={data.policies} />
      </section>
      <form className="card stack" aria-label="New policy version" onSubmit={submit}>
        <h2>New policy version</h2>
        <PolicyFields draft={draft} onChange={edit} />
        {!result.ok && (
          <p className="notice" role="status">
            {result.message}
          </p>
        )}
        {error !== null && (
          <p className="error" role="alert" data-error="policy">
            {error}
          </p>
        )}
        {created !== null && (
          <p className="notice-ok" role="status" data-status="policy-created">
            {created}
          </p>
        )}
        {previewMatches && preview !== null && <PolicyPreview preview={preview.result} />}
        {result.ok && preview !== null && !previewMatches && (
          <p className="notice" role="status">
            The values changed after the preview. Preview again before creating the version.
          </p>
        )}
        <div className="button-row">
          <button type="button" className="secondary" disabled={!result.ok || busy} onClick={() => void runPreview()}>
            Preview effect
          </button>
          <button type="submit" disabled={!creatable || busy}>
            Create version
          </button>
        </div>
      </form>
    </div>
  );
}
