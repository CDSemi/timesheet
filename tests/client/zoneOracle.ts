/*
 * Zone oracle for tests (WP2-B2-01). It converts wall times between IANA zones with Intl only, an
 * oracle independent of the app's resolver, so an expectation follows the real date: a time
 * typed at +07:00 is 08:00 in Los Angeles in summer but 07:00 in winter. Production code has no
 * part in this file and no clock override.
 */

/** A deliberately wrong, fixed-offset expectation: the defect this oracle replaces. */
export function legacyPdtWallTime(date: string, time: string): string {
  void time;
  return `${date} 08:00`;
}

/** The wall clock of an instant in a zone as "YYYY-MM-DD HH:mm". */
export function dateTimeIn(instant: string, zone: string): string {
  return wallParts(new Date(instant).getTime(), zone).text;
}

/**
 * The instant (ISO, UTC) at which a zone shows the wall time date + time. Only for unambiguous
 * wall times: a DST gap (the time never occurs) and a DST fold (the time occurs twice) both
 * throw, because the tests that use this never type one and a silent choice would depend on the
 * zone. Candidates come from the zone offsets one day either side, each checked by reading the
 * wall clock back; this uses Intl only and no product code.
 */
export function instantOfWallTime(date: string, time: string, zone: string): string {
  const wallAsUtc = Date.parse(`${date}T${time}:00Z`);
  const dayMs = 86_400_000;
  const offsets = new Set<number>();
  for (const probe of [wallAsUtc - dayMs, wallAsUtc, wallAsUtc + dayMs]) offsets.add(wallParts(probe, zone).asUtc - probe);
  const matches = new Set<number>();
  for (const offset of offsets) {
    const candidate = wallAsUtc - offset;
    if (wallParts(candidate, zone).text === `${date} ${time}`) matches.add(candidate);
  }
  const label = `${date} ${time} is not an unambiguous wall time in ${zone}`;
  if (matches.size === 0) throw new Error(`${label} (DST gap)`);
  if (matches.size > 1) throw new Error(`${label} (DST fold)`);
  return new Date([...matches][0] ?? Number.NaN).toISOString();
}

/** What a zone shows ("YYYY-MM-DD HH:mm") at the instant another zone shows the wall time date + time. */
export function wallTimeIn(date: string, time: string, fromZone: string, toZone: string): string {
  return dateTimeIn(instantOfWallTime(date, time, fromZone), toZone);
}

function wallParts(instantMs: number, zone: string): { text: string; asUtc: number } {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: zone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(new Date(instantMs));
  const part = (type: string) => parts.find((item) => item.type === type)?.value ?? '';
  const day = `${part('year')}-${part('month')}-${part('day')}`;
  return {
    text: `${day} ${part('hour')}:${part('minute')}`,
    asUtc: Date.parse(`${day}T${part('hour')}:${part('minute')}:${part('second')}Z`),
  };
}
