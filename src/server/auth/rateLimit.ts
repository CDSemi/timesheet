/*
 * In-memory login failure limiter for the single application instance. Failures are
 * counted per (client address + account) and per client address in a fixed window.
 */

interface Bucket {
  failures: number;
  windowStart: number;
}

export interface RateLimitDecision {
  allowed: boolean;
  retryAfterSeconds: number;
}

export interface LoginRateLimiterOptions {
  windowSeconds: number;
  maxFailuresPerAccount: number;
  maxFailuresPerAddress: number;
}

export const DEFAULT_LOGIN_LIMITS: LoginRateLimiterOptions = {
  windowSeconds: 15 * 60,
  maxFailuresPerAccount: 5,
  maxFailuresPerAddress: 30,
};

export class LoginRateLimiter {
  private readonly buckets = new Map<string, Bucket>();
  private readonly options: LoginRateLimiterOptions;

  constructor(options: LoginRateLimiterOptions = DEFAULT_LOGIN_LIMITS) {
    this.options = options;
  }

  private keys(address: string, account: string): Array<[string, number]> {
    return [
      [`account:${address}:${account}`, this.options.maxFailuresPerAccount],
      [`address:${address}`, this.options.maxFailuresPerAddress],
    ];
  }

  private current(key: string, nowSeconds: number): Bucket | undefined {
    const bucket = this.buckets.get(key);
    if (bucket !== undefined && nowSeconds - bucket.windowStart >= this.options.windowSeconds) {
      this.buckets.delete(key);
      return undefined;
    }
    return bucket;
  }

  check(address: string, account: string, nowSeconds: number): RateLimitDecision {
    for (const [key, limit] of this.keys(address, account)) {
      const bucket = this.current(key, nowSeconds);
      if (bucket !== undefined && bucket.failures >= limit) {
        return { allowed: false, retryAfterSeconds: bucket.windowStart + this.options.windowSeconds - nowSeconds };
      }
    }
    return { allowed: true, retryAfterSeconds: 0 };
  }

  recordFailure(address: string, account: string, nowSeconds: number): void {
    if (this.buckets.size > MAX_TRACKED_KEYS) this.pruneExpired(nowSeconds);
    for (const [key] of this.keys(address, account)) {
      const bucket = this.current(key, nowSeconds);
      if (bucket === undefined) this.buckets.set(key, { failures: 1, windowStart: nowSeconds });
      else bucket.failures += 1;
    }
  }

  recordSuccess(address: string, account: string): void {
    this.buckets.delete(`account:${address}:${account}`);
  }

  /** Bounded memory: forget windows that have already expired. */
  private pruneExpired(nowSeconds: number): void {
    for (const [key, bucket] of this.buckets) {
      if (nowSeconds - bucket.windowStart >= this.options.windowSeconds) this.buckets.delete(key);
    }
  }

  get trackedKeys(): number {
    return this.buckets.size;
  }
}

const MAX_TRACKED_KEYS = 1000;
