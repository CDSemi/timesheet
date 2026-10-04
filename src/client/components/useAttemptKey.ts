import { useCallback, useRef } from 'react';

/**
 * An idempotency key that stays the same while the same action is retried and changes when
 * the action's values change or the action succeeded. A retry after a lost response therefore
 * cannot spend or reserve twice, and a deliberate second action gets a fresh key.
 */
export function useAttemptKey(): { keyFor: (signature: string) => string; settle: () => void } {
  const current = useRef<{ signature: string; key: string } | null>(null);
  const keyFor = useCallback((signature: string) => {
    if (current.current === null || current.current.signature !== signature) {
      current.current = { signature, key: crypto.randomUUID() };
    }
    return current.current.key;
  }, []);
  const settle = useCallback(() => {
    current.current = null;
  }, []);
  return { keyFor, settle };
}
