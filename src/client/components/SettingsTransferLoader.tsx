import { Component, lazy, type ReactNode, Suspense } from 'react';

/*
 * The export and import card of Settings loads on demand (WP5-UX4-T05): a person who never opens it does not download its code,
 * and the main bundle stays under the build's chunk-size advisory. The chunk is a same-origin file (the content security policy
 * is unchanged). This small file is all the main bundle holds of the feature.
 */
const SettingsTransfer = lazy(() => import('./SettingsTransfer.tsx').then((module) => ({ default: module.SettingsTransfer })));

/** A readable message and a retry when the chunk cannot be loaded (offline, a stale deployment), never a blank card. */
class TransferBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  override state = { failed: false };

  static getDerivedStateFromError(): { failed: boolean } {
    return { failed: true };
  }

  override render() {
    if (!this.state.failed) return this.props.children;
    return (
      <section className="card stack chunk-error" role="alert" aria-label="Export and import settings could not be loaded">
        <p className="error">Export and import could not be loaded. Check the connection and try again.</p>
        <div className="button-row">
          <button type="button" onClick={() => window.location.reload()}>
            Try again
          </button>
        </div>
      </section>
    );
  }
}

export function SettingsTransferLoader({ onImported }: { onImported: () => void }) {
  return (
    <TransferBoundary>
      <Suspense
        fallback={
          <p className="muted screen-loading" role="status">
            Loading export and import…
          </p>
        }
      >
        <SettingsTransfer onImported={onImported} />
      </Suspense>
    </TransferBoundary>
  );
}
