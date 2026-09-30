import type { LoginRateLimiter } from './auth/rateLimit.ts';
import type { SessionUser } from './auth/sessions.ts';
import type { Clock } from './clock.ts';
import type { AppConfig } from './config.ts';
import type { Db } from './db/database.ts';

export interface AppDeps {
  db: Db;
  clock: Clock;
  config: AppConfig;
  loginLimiter: LoginRateLimiter;
  /** Built client assets (dist/client); null serves the API only. */
  staticDir: string | null;
}

export interface AppEnv {
  Variables: {
    user: SessionUser;
  };
}
