import { addDays, type CivilDate, isCivilDate, pad2, pad4, toDayNumber } from './dates.ts';
import { DomainError } from './errors.ts';
import type { EpochSeconds } from './instants.ts';

/*
 * IANA zone arithmetic built on Intl (ICU tz data bundled with the runtime), so the
 * same code runs on the server and in the browser. Instants are epoch seconds;
 * durations are always elapsed UTC seconds (R-07).
 */

const SECONDS_PER_DAY = 86_400;
const ZONE_NAME_PATTERN = /^(?:UTC|[A-Za-z][A-Za-z0-9_+-]*(?:\/[A-Za-z0-9_+-]+)+)$/;
const LOCAL_PATTERN = /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/;
const OFFSET_PATTERN = /^([+-])(\d{2}):(\d{2})$/;

const formatters = new Map<string, Intl.DateTimeFormat>();

function formatterFor(zone: string): Intl.DateTimeFormat {
  let formatter = formatters.get(zone);
  if (formatter === undefined) {
    formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: zone,
      hourCycle: 'h23',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    formatters.set(zone, formatter);
  }
  return formatter;
}

export function isValidTimeZone(zone: unknown): zone is string {
  if (typeof zone !== 'string' || !ZONE_NAME_PATTERN.test(zone)) return false;
  try {
    formatterFor(zone);
    return true;
  } catch {
    return false;
  }
}

export function assertTimeZone(zone: unknown, field = 'zone'): string {
  if (!isValidTimeZone(zone)) {
    throw new DomainError('invalid_time_zone', `${field} must be an IANA time zone name`, { field });
  }
  return zone;
}

interface WallClock {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

function wallClockAt(zone: string, instant: EpochSeconds): WallClock {
  const wall: WallClock = { year: 0, month: 0, day: 0, hour: 0, minute: 0, second: 0 };
  for (const part of formatterFor(zone).formatToParts(new Date(instant * 1000))) {
    switch (part.type) {
      case 'year':
      case 'month':
      case 'day':
      case 'hour':
      case 'minute':
      case 'second':
        wall[part.type] = Number(part.value);
        break;
      default:
        break;
    }
  }
  return wall;
}

function wallAsUtcSeconds(wall: WallClock): number {
  return Date.UTC(wall.year, wall.month - 1, wall.day, wall.hour, wall.minute, wall.second) / 1000;
}

/** Offset of `zone` at `instant` in seconds (local wall clock = UTC + offset). */
export function zoneOffsetSeconds(zone: string, instant: EpochSeconds): number {
  return wallAsUtcSeconds(wallClockAt(zone, instant)) - instant;
}

/** The local calendar date of an instant in `zone`. */
export function localDateOf(zone: string, instant: EpochSeconds): CivilDate {
  const wall = wallClockAt(zone, instant);
  return `${pad4(wall.year)}-${pad2(wall.month)}-${pad2(wall.day)}`;
}

export function formatOffset(offsetSeconds: number): string {
  const sign = offsetSeconds < 0 ? '-' : '+';
  const absolute = Math.abs(offsetSeconds);
  return `${sign}${pad2(Math.floor(absolute / 3600))}:${pad2(Math.floor((absolute % 3600) / 60))}`;
}

/** ISO local date-time with offset, e.g. `2026-09-21T18:00:00-07:00`. */
export function formatInZone(zone: string, instant: EpochSeconds): string {
  const wall = wallClockAt(zone, instant);
  const offset = wallAsUtcSeconds(wall) - instant;
  return (
    `${pad4(wall.year)}-${pad2(wall.month)}-${pad2(wall.day)}` +
    `T${pad2(wall.hour)}:${pad2(wall.minute)}:${pad2(wall.second)}${formatOffset(offset)}`
  );
}

/**
 * All instants whose wall clock in `zone` equals `wallSeconds` (a local date-time
 * encoded as if it were UTC), ascending. Empty in a DST gap; two in an overlap.
 */
function instantsForWallClock(zone: string, wallSeconds: number): EpochSeconds[] {
  const offsets = new Set([
    zoneOffsetSeconds(zone, wallSeconds - SECONDS_PER_DAY),
    zoneOffsetSeconds(zone, wallSeconds),
    zoneOffsetSeconds(zone, wallSeconds + SECONDS_PER_DAY),
  ]);
  const result: EpochSeconds[] = [];
  for (const offset of offsets) {
    const candidate = wallSeconds - offset;
    if (zoneOffsetSeconds(zone, candidate) === offset && !result.includes(candidate)) result.push(candidate);
  }
  return result.sort((a, b) => a - b);
}

export interface LocalDateTime {
  date: CivilDate;
  hour: number;
  minute: number;
  second: number;
}

/** Parses `YYYY-MM-DDTHH:MM[:SS]`; minute entry writes :00 seconds (R-01). */
export function parseLocalDateTime(value: unknown, field = 'local'): LocalDateTime {
  const match = typeof value === 'string' ? LOCAL_PATTERN.exec(value) : null;
  const date = match?.[1];
  const hour = Number(match?.[2]);
  const minute = Number(match?.[3]);
  const second = match?.[4] === undefined ? 0 : Number(match[4]);
  if (!match || !isCivilDate(date) || hour > 23 || minute > 59 || second > 59) {
    throw new DomainError('invalid_local_time', `${field} must be a local date-time such as 2026-09-21T09:00`, {
      field,
    });
  }
  return { date, hour, minute, second };
}

function localToWallSeconds(local: LocalDateTime): number {
  return toDayNumber(local.date) * SECONDS_PER_DAY + local.hour * 3600 + local.minute * 60 + local.second;
}

export function parseOffset(value: string): number {
  const match = OFFSET_PATTERN.exec(value);
  const hours = Number(match?.[2]);
  const minutes = Number(match?.[3]);
  if (!match || hours > 18 || minutes > 59) {
    throw new DomainError('invalid_local_time', 'offset must look like -07:00 or +07:00', { offset: value });
  }
  return (match[1] === '-' ? -1 : 1) * (hours * 3600 + minutes * 60);
}

export interface LocalResolutionOptions {
  /** 0 = earlier instant, 1 = later instant of an ambiguous (repeated) local time. */
  fold?: 0 | 1 | null;
  /** Explicit UTC offset such as `-08:00`; must be valid for that local time in the zone. */
  offset?: string | null;
}

export interface ResolvedLocalTime {
  utc: EpochSeconds;
  offsetSeconds: number;
}

/**
 * Converts manual local input to a UTC instant (R-07). Nonexistent DST-gap times are
 * rejected; ambiguous repeated times require `fold` or an explicit `offset`.
 */
export function resolveLocalDateTime(
  local: string,
  zone: string,
  options: LocalResolutionOptions = {},
): ResolvedLocalTime {
  assertTimeZone(zone);
  const wallSeconds = localToWallSeconds(parseLocalDateTime(local));
  const candidates = instantsForWallClock(zone, wallSeconds);
  if (candidates.length === 0) {
    throw new DomainError('nonexistent_local_time', `${local} does not exist in ${zone} (DST gap)`, { local, zone });
  }
  let chosen: EpochSeconds | undefined;
  if (options.offset !== undefined && options.offset !== null) {
    const offset = parseOffset(options.offset);
    chosen = candidates.find((candidate) => wallSeconds - candidate === offset);
    if (chosen === undefined) {
      throw new DomainError('offset_mismatch', `${options.offset} is not a valid offset for ${local} in ${zone}`, {
        local,
        zone,
      });
    }
  } else if (candidates.length === 1) {
    chosen = candidates[0];
  } else if (options.fold === 0 || options.fold === 1) {
    chosen = options.fold === 0 ? candidates[0] : candidates[candidates.length - 1];
  } else {
    throw new DomainError('ambiguous_local_time', `${local} occurs twice in ${zone}; choose fold 0 or 1`, {
      local,
      zone,
      offsets: candidates.map((candidate) => formatOffset(wallSeconds - candidate)),
    });
  }
  if (chosen === undefined) throw new DomainError('invalid_local_time', `Cannot resolve ${local}`);
  return { utc: chosen, offsetSeconds: wallSeconds - chosen };
}

/**
 * Resolution for configured schedule times (e.g. a deadline): an ambiguous time uses
 * the earlier instant and a DST-gap time moves forward by the gap length.
 */
export function resolveLocalDateTimeCompatible(local: string, zone: string): EpochSeconds {
  assertTimeZone(zone);
  const wallSeconds = localToWallSeconds(parseLocalDateTime(local));
  const candidates = instantsForWallClock(zone, wallSeconds);
  const earliest = candidates[0];
  if (earliest !== undefined) return earliest;
  return wallSeconds - zoneOffsetSeconds(zone, wallSeconds - SECONDS_PER_DAY);
}

/** First instant whose local date in `zone` is `date` (handles midnight DST gaps). */
export function startOfLocalDay(zone: string, date: CivilDate): EpochSeconds {
  const wallSeconds = toDayNumber(date) * SECONDS_PER_DAY;
  const earliest = instantsForWallClock(zone, wallSeconds)[0];
  if (earliest !== undefined) return earliest;
  // Midnight is skipped: binary-search the transition instant where the date begins.
  let before = wallSeconds - 2 * SECONDS_PER_DAY;
  let after = wallSeconds + 2 * SECONDS_PER_DAY;
  while (after - before > 1) {
    const middle = Math.floor((before + after) / 2);
    if (localDateOf(zone, middle) >= date) after = middle;
    else before = middle;
  }
  return after;
}

export interface LocalDatePiece {
  date: CivilDate;
  startUtc: EpochSeconds;
  endUtc: EpochSeconds;
}

/** Splits the half-open interval [startUtc, endUtc) at local midnights of `zone` (R-03). */
export function splitAtLocalMidnights(zone: string, startUtc: EpochSeconds, endUtc: EpochSeconds): LocalDatePiece[] {
  if (endUtc <= startUtc) return [];
  const firstDate = localDateOf(zone, startUtc);
  const lastDate = localDateOf(zone, endUtc - 1);
  if (lastDate <= firstDate) return [{ date: firstDate, startUtc, endUtc }];
  const pieces: LocalDatePiece[] = [];
  let cursor = startUtc;
  for (let date = firstDate; date <= lastDate && cursor < endUtc; date = addDays(date, 1)) {
    const next = date === lastDate ? endUtc : Math.min(endUtc, startOfLocalDay(zone, addDays(date, 1)));
    if (next > cursor) {
      pieces.push({ date, startUtc: cursor, endUtc: next });
      cursor = next;
    }
  }
  return pieces;
}
