import { isIP } from 'node:net';
import { getConnInfo } from '@hono/node-server/conninfo';
import type { Context } from 'hono';

/*
 * Client address for the login limiter (docs/03: never trust client-supplied proxy headers).
 *
 * The socket peer is the only address the client cannot choose. `X-Forwarded-For` is read
 * only when that peer is an exact member of the configured trusted-proxy list, and then the
 * right-most hop that is not itself a trusted proxy is the client (every hop to its left was
 * supplied by someone else and may be forged). A missing or malformed header falls back to
 * the peer, so a bad header can only merge buckets, never split them.
 */

export const UNKNOWN_ADDRESS = 'unknown';

/** Canonical form of one IP address (lower-case, compressed IPv6, IPv4-mapped IPv6 as IPv4), or null. */
export function normalizeAddress(value: string): string | null {
  const text = value.trim();
  const family = isIP(text);
  if (family === 4) return text;
  // Zone ids (fe80::1%eth0) are interface-local and never a proxy or client identity.
  if (family !== 6 || text.includes('%')) return null;
  let canonical: string;
  try {
    canonical = new URL(`http://[${text}]/`).hostname.slice(1, -1);
  } catch {
    return null;
  }
  const mapped = /^::ffff:(?<v4>[0-9]{1,3}(?:\.[0-9]{1,3}){3})$/.exec(canonical)?.groups?.v4;
  if (mapped !== undefined) return isIP(mapped) === 4 ? mapped : null;
  // WHATWG URL writes an IPv4-mapped address in hex pairs (::ffff:a00:2); fold it back to dotted IPv4.
  const hex = /^::ffff:(?<hi>[0-9a-f]{1,4}):(?<lo>[0-9a-f]{1,4})$/.exec(canonical)?.groups;
  if (hex?.hi !== undefined && hex.lo !== undefined) {
    const high = Number.parseInt(hex.hi, 16);
    const low = Number.parseInt(hex.lo, 16);
    return `${high >> 8}.${high & 0xff}.${low >> 8}.${low & 0xff}`;
  }
  return canonical;
}

/**
 * Parses TRUSTED_PROXY_ADDRESSES: a comma-separated list of exact IP addresses (no CIDR, no
 * host names, no wildcard). Throws a message that never echoes the value. Empty means none.
 */
export function parseTrustedProxyAddresses(value: string | undefined): readonly string[] {
  if (value === undefined) return [];
  const addresses: string[] = [];
  for (const item of value.split(',')) {
    if (item.trim() === '') continue;
    const address = normalizeAddress(item);
    if (address === null) throw new Error('TRUSTED_PROXY_ADDRESSES must be a comma-separated list of exact IP addresses');
    if (!addresses.includes(address)) addresses.push(address);
  }
  return addresses;
}

function socketAddress(c: Context): string {
  try {
    const raw = getConnInfo(c).remote.address;
    return raw === undefined ? UNKNOWN_ADDRESS : (normalizeAddress(raw) ?? raw);
  } catch {
    // No socket (e.g. in-process tests).
    return UNKNOWN_ADDRESS;
  }
}

/** The address a request is attributed to; see the header comment for the trust rule. */
export function resolveClientAddress(c: Context, trustedProxies: readonly string[]): string {
  const peer = socketAddress(c);
  if (trustedProxies.length === 0 || !trustedProxies.includes(peer)) return peer;
  const forwarded = c.req.header('x-forwarded-for');
  if (forwarded === undefined) return peer;
  const hops = forwarded.split(',');
  for (let index = hops.length - 1; index >= 0; index -= 1) {
    const hop = normalizeAddress(hops[index] ?? '');
    if (hop === null) return peer;
    if (!trustedProxies.includes(hop)) return hop;
  }
  return peer;
}
