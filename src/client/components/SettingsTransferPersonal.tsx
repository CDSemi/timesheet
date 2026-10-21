import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { api, ApiRequestError, type CurrentPeriods, type PolicyPreview as PolicyPreviewData, type PolicyVersion, type SubmissionSettings } from '../api.ts';
import { refusalMessage } from './adminModel.ts';
import { describeError } from './errors.ts';
import { PolicyPreview } from './PolicyPreview.tsx';
import { requestSignature } from './policyModel.ts';
import { nextPeriodStart, offersAutoSubmitTick, type PersonalCurrent, type PersonalFile, planPersonalImport } from './settingsFileModel.ts';
import { settingsRefusal } from './settingsModel.ts';
import { ComparisonTable, SettingsTransferDialog } from './SettingsTransferDialog.tsx';
import { applyDeviceTheme, deviceTheme, utcText } from './SettingsTransferFile.ts';

interface Loaded {
  current: PersonalCurrent;
  periods: CurrentPeriods;
}

async function loadCurrent(): Promise<Loaded> {
  const [policies, submission, periods] = await Promise.all([
    api<{ policies: PolicyVersion[] }>('GET', '/api/policies'),
    api<{ settings: SubmissionSettings }>('GET', '/api/settings/submission'),
    api<CurrentPeriods>('GET', '/api/periods/current'),
  ]);
  return { current: { policy: policies.policies.at(-1), submission: submission.settings, theme: deviceTheme() }, periods };
}

/**
 * The import of a personal settings file (WP5-UX4-T05, owner answer F-4 (a)). The file was read and validated in the browser
 * already; this dialog shows "Now / In the file" for each group it holds, then one confirmation writes each group that differs
 * as a new version through the existing routes, for the signed-in person only (the routes take the owner from the session).
 * The work policy applies from the chosen date; automatic submission is switched on only by its own tick. Nothing is written
 * before the confirmation: the only requests before it are reads and the policy preview, which writes nothing.
 */
export function SettingsTransferPersonal({
  file,
  fileName,
  opener,
  onClose,
  onImported,
}: {
  file: PersonalFile;
  fileName: string;
  opener: HTMLElement | null;
  onClose: () => void;
  onImported: (message: string) => void;
}) {
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [tick, setTick] = useState(false);
  const [effectiveFrom, setEffectiveFrom] = useState('');
  const [preview, setPreview] = useState<{ signature: string; result: PolicyPreviewData } | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const inFlight = useRef(false);
  const dateId = useId();
  const tickId = useId();

  const load = useCallback(async (initial: boolean) => {
    try {
      const next = await loadCurrent();
      setLoaded(next);
      setLoadError(null);
      if (initial) setEffectiveFrom(nextPeriodStart(next.periods.in_progress.period_end));
    } catch (caught) {
      setLoadError(describeError(caught));
    }
  }, []);

  useEffect(() => {
    void load(true);
  }, [load]);

  const plan = loaded === null || effectiveFrom === '' ? null : planPersonalImport(file.data, loaded.current, { tick, effectiveFrom, fileName });
  const policyRequest = plan?.policy ?? null;
  const policySignature = policyRequest === null ? null : requestSignature(policyRequest);

  // The server's preview of the draft days the new policy version changes (it writes nothing).
  useEffect(() => {
    setPreview(null);
    setPreviewError(null);
    if (policyRequest === null || policySignature === null) return;
    let current = true;
    api<PolicyPreviewData>('POST', '/api/policies/preview', policyRequest)
      .then((result) => {
        if (current) setPreview({ signature: policySignature, result });
      })
      .catch((caught: unknown) => {
        if (current) setPreviewError(refusalMessage(caught));
      });
    return () => {
      current = false;
    };
    // The signature stands for the request; it is rebuilt from the same inputs on every render.
  }, [policySignature]);

  async function confirm() {
    if (plan === null || loaded === null || inFlight.current || plan.changeCount === 0) return;
    inFlight.current = true;
    setBusy(true);
    setError(null);
    const done: string[] = [];
    let step: 'policy' | 'submission' = 'policy';
    try {
      if (plan.policy !== null) {
        const answer = await api<{ policy: PolicyVersion }>('POST', '/api/policies', plan.policy);
        done.push(`work policy version ${answer.policy.seq} (from ${answer.policy.effective_from})`);
      }
      if (plan.submission !== null) {
        step = 'submission';
        const answer = await api<{ settings: SubmissionSettings }>('POST', '/api/settings/submission', plan.submission);
        done.push(`submission settings version ${answer.settings.seq}`);
      }
      if (plan.theme !== null) {
        done.push(applyDeviceTheme(plan.theme) ? `${plan.theme} theme on this device` : 'theme (this browser would not store it)');
      }
      onImported(`Imported from ${fileName}: ${done.join(', ')}.`);
    } catch (caught) {
      const written = done.length === 0 ? 'Nothing was written.' : `Already written: ${done.join(', ')}.`;
      const reason = step === 'submission' ? settingsRefusal(caught) : refusalMessage(caught);
      const reloaded = caught instanceof ApiRequestError && caught.status === 409 ? ' The settings were reloaded; check the comparison and confirm again.' : '';
      setError(`${reason} ${written}${reloaded}`);
      await load(false);
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }

  const description = `${fileName} · format ${file.schema_version} · exported ${utcText(file.exported_at)} from ${file.app_version}`;
  const hasPolicy = file.data.work_policy !== undefined;
  const policyChanges = plan !== null && plan.policy !== null;
  const previewMatches = preview !== null && policySignature !== null && preview.signature === policySignature;
  const confirmDisabled = plan === null || plan.changeCount === 0 || (policyChanges && !previewMatches);

  return (
    <SettingsTransferDialog
      title="Import settings"
      description={description}
      confirmLabel={plan === null ? 'Import' : `Import ${plan.changeCount} ${plan.changeCount === 1 ? 'change' : 'changes'}`}
      confirmDisabled={confirmDisabled}
      busy={busy}
      opener={opener}
      onConfirm={() => void confirm()}
      onCancel={onClose}
    >
      {loadError !== null && (
        <p className="error" role="alert">
          {loadError}
        </p>
      )}
      {loaded === null && loadError === null && <p className="muted">Loading your current settings…</p>}
      {plan !== null && loaded !== null && (
        <>
          <ComparisonTable groups={plan.groups} caption="Your current settings and the settings in the file" />
          {plan.changeCount === 0 && (
            <p className="notice" role="status" data-transfer="no-change">
              Nothing in the file differs from your current settings, so nothing will be written.
            </p>
          )}
          {offersAutoSubmitTick(file.data, loaded.current) && (
            <label className="inline" htmlFor={tickId}>
              <input id={tickId} type="checkbox" checked={tick} onChange={(event) => setTick(event.target.checked)} />
              Also turn automatic submission on
            </label>
          )}
          {offersAutoSubmitTick(file.data, loaded.current) && !tick && (
            <p className="hint muted" data-transfer="auto-submit-note">
              The file asks for automatic submission, but a file never switches it on by itself: it stays off unless you tick the box.
            </p>
          )}
          {hasPolicy && (
            <div className="stack">
              <label htmlFor={dateId}>
                The work policy applies from
                <input id={dateId} type="date" value={effectiveFrom} min={loaded.periods.current.period_start} onChange={(event) => setEffectiveFrom(event.target.value)} />
              </label>
              <span className="hint muted">
                Earlier days keep the policy they had. Draft days from this date are recalculated. The earliest date is {loaded.periods.current.period_start}.
              </span>
            </div>
          )}
          {previewError !== null && (
            <p className="error" role="alert" data-transfer="policy-refusal">
              {previewError}
            </p>
          )}
          {previewMatches && preview !== null && <PolicyPreview preview={preview.result} />}
        </>
      )}
      {error !== null && (
        <p className="error" role="alert" data-transfer="error">
          {error}
        </p>
      )}
      <p className="hint muted">
        Not imported, ever: the signature image and the automatic image authorization (authorize again in Settings). Each change is recorded in your history.
      </p>
    </SettingsTransferDialog>
  );
}
