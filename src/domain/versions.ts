import type { CivilDate } from './dates.ts';

/** An effective-dated, append-only record: a later `seq` supersedes the same effective date. */
export interface EffectiveDated {
  effectiveFrom: CivilDate;
  seq: number;
}

/** The version in effect on `date`, or undefined when none has started yet (R-07). */
export function effectiveVersionOn<T extends EffectiveDated>(versions: readonly T[], date: CivilDate): T | undefined {
  let best: T | undefined;
  for (const version of versions) {
    if (version.effectiveFrom > date) continue;
    if (
      best === undefined ||
      version.effectiveFrom > best.effectiveFrom ||
      (version.effectiveFrom === best.effectiveFrom && version.seq > best.seq)
    ) {
      best = version;
    }
  }
  return best;
}
