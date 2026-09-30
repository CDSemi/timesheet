import { type EpochSeconds, epochSecondsOf, formatUtcInstant } from '../domain/instants.ts';

/** Injectable time source so tests can use deterministic clocks and zones. */
export interface Clock {
  now(): Date;
}

export const systemClock: Clock = { now: () => new Date() };

export function nowEpoch(clock: Clock): EpochSeconds {
  return epochSecondsOf(clock.now());
}

export function nowUtc(clock: Clock): string {
  return formatUtcInstant(nowEpoch(clock));
}
