import { randomBytes, scrypt, type ScryptOptions, timingSafeEqual } from 'node:crypto';

/*
 * scrypt password hashing from node:crypto (no native dependency). Stored format:
 * scrypt$<log2 N>$<r>$<p>$<salt base64>$<key base64>. Parameters travel with the hash
 * so they can be raised later without invalidating existing passwords.
 */

const LOG2_N = 15;
const BLOCK_SIZE = 8;
const PARALLELISM = 1;
const KEY_LENGTH = 32;
const MAX_MEMORY = 64 * 1024 * 1024;
export const MIN_PASSWORD_LENGTH = 12;
export const MAX_PASSWORD_LENGTH = 256;

function derive(password: string, salt: Buffer, keyLength: number, options: ScryptOptions): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password.normalize('NFKC'), salt, keyLength, options, (error, key) => (error ? reject(error) : resolve(key)));
  });
}

export function isAcceptablePassword(password: string): boolean {
  return password.length >= MIN_PASSWORD_LENGTH && password.length <= MAX_PASSWORD_LENGTH;
}

export async function hashPassword(password: string): Promise<string> {
  if (!isAcceptablePassword(password)) {
    throw new Error(`Passwords must be ${MIN_PASSWORD_LENGTH}–${MAX_PASSWORD_LENGTH} characters`);
  }
  const salt = randomBytes(16);
  const key = await derive(password, salt, KEY_LENGTH, {
    N: 2 ** LOG2_N,
    r: BLOCK_SIZE,
    p: PARALLELISM,
    maxmem: MAX_MEMORY,
  });
  return ['scrypt', LOG2_N, BLOCK_SIZE, PARALLELISM, salt.toString('base64'), key.toString('base64')].join('$');
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split('$');
  if (parts.length !== 6 || parts[0] !== 'scrypt' || password.length > MAX_PASSWORD_LENGTH) return false;
  const [, logN, r, p, saltText, keyText] = parts;
  const expected = Buffer.from(keyText ?? '', 'base64');
  const options = { N: 2 ** Number(logN), r: Number(r), p: Number(p), maxmem: MAX_MEMORY };
  if (expected.length === 0 || ![options.N, options.r, options.p].every(Number.isSafeInteger)) return false;
  const actual = await derive(password, Buffer.from(saltText ?? '', 'base64'), expected.length, options);
  return timingSafeEqual(actual, expected);
}

let dummyHash: Promise<string> | undefined;

/** Burns comparable time for unknown accounts so login timing does not reveal them. */
export async function verifyAgainstDummy(password: string): Promise<false> {
  dummyHash ??= hashPassword(randomBytes(24).toString('base64'));
  await verifyPassword(password, await dummyHash);
  return false;
}
