export interface RateLimiterOptions {
  /**
   * Time window in milliseconds (default: 60,000 ms = 1 minute)
   */
  windowMs?: number;
  /**
   * Maximum allowed attempts within the window (default: 60)
   */
  max?: number;
  /**
   * Interval for cleaning up expired entries in milliseconds (default: 60,000 ms)
   */
  cleanupIntervalMs?: number;
}

export interface RateLimitResult {
  /**
   * Whether the request is permitted
   */
  success: boolean;
  /**
   * Maximum limit allowed for the window
   */
  limit: number;
  /**
   * Number of remaining attempts in the current window
   */
  remaining: number;
  /**
   * Epoch millisecond timestamp when the current window resets
   */
  resetAt: number;
  /**
   * Seconds until the rate limit resets (0 if not limited)
   */
  retryAfterSeconds: number;
}

interface RateLimitRecord {
  timestamps: number[];
}

export class RateLimiter {
  private readonly windowMs: number;
  private readonly max: number;
  private readonly storage = new Map<string, RateLimitRecord>();
  private readonly cleanupTimer?: ReturnType<typeof setInterval>;

  constructor(options: RateLimiterOptions = {}) {
    this.windowMs = options.windowMs ?? 60000;
    this.max = options.max ?? 60;

    const cleanupInterval = options.cleanupIntervalMs ?? 60000;
    if (cleanupInterval > 0 && typeof setInterval !== 'undefined') {
      this.cleanupTimer = setInterval(() => this.cleanup(), cleanupInterval);
      if (this.cleanupTimer.unref) {
        this.cleanupTimer.unref();
      }
    }
  }

  /**
   * Checks and consumes a rate limit token for the given key.
   */
  consume(key: string): RateLimitResult {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    let record = this.storage.get(key);
    if (!record) {
      record = { timestamps: [] };
      this.storage.set(key, record);
    }

    // Filter out timestamps outside the active window
    record.timestamps = record.timestamps.filter((ts) => ts > windowStart);

    const count = record.timestamps.length;
    const resetAt = record.timestamps.length > 0 ? record.timestamps[0]! + this.windowMs : now + this.windowMs;
    const retryAfterSeconds = Math.max(0, Math.ceil((resetAt - now) / 1000));

    if (count >= this.max) {
      return {
        success: false,
        limit: this.max,
        remaining: 0,
        resetAt,
        retryAfterSeconds: Math.max(1, retryAfterSeconds),
      };
    }

    record.timestamps.push(now);

    return {
      success: true,
      limit: this.max,
      remaining: Math.max(0, this.max - record.timestamps.length),
      resetAt,
      retryAfterSeconds: 0,
    };
  }

  /**
   * Checks current rate limit status without consuming a token.
   */
  peek(key: string): RateLimitResult {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    const record = this.storage.get(key);
    if (!record) {
      return {
        success: true,
        limit: this.max,
        remaining: this.max,
        resetAt: now + this.windowMs,
        retryAfterSeconds: 0,
      };
    }

    const validTimestamps = record.timestamps.filter((ts) => ts > windowStart);
    const count = validTimestamps.length;
    const resetAt = validTimestamps.length > 0 ? validTimestamps[0]! + this.windowMs : now + this.windowMs;
    const retryAfterSeconds = Math.max(0, Math.ceil((resetAt - now) / 1000));

    return {
      success: count < this.max,
      limit: this.max,
      remaining: Math.max(0, this.max - count),
      resetAt,
      retryAfterSeconds: count >= this.max ? Math.max(1, retryAfterSeconds) : 0,
    };
  }

  /**
   * Resets rate limit for a specific key.
   */
  reset(key: string): void {
    this.storage.delete(key);
  }

  /**
   * Clears all stored rate limit entries.
   */
  clear(): void {
    this.storage.clear();
  }

  /**
   * Cleans up expired timestamp records from memory.
   */
  cleanup(): void {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    for (const [key, record] of this.storage.entries()) {
      record.timestamps = record.timestamps.filter((ts) => ts > windowStart);
      if (record.timestamps.length === 0) {
        this.storage.delete(key);
      }
    }
  }

  /**
   * Destroys the rate limiter and stops periodic cleanup timers.
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    this.clear();
  }
}

/**
 * Extracts a client IP from common proxy headers (Cloudflare, X-Forwarded-For, X-Real-IP).
 */
export function extractClientIp(
  headers: Headers | Record<string, string | string[] | undefined>
): string {
  const getHeader = (name: string): string | undefined => {
    if (typeof headers.get === 'function') {
      return headers.get(name) || undefined;
    }
    const val = (headers as Record<string, string | string[] | undefined>)[name];
    if (Array.isArray(val)) return val[0];
    return val;
  };

  const cfIp = getHeader('cf-connecting-ip');
  if (cfIp && cfIp.trim()) return cfIp.trim();

  const forwardedFor = getHeader('x-forwarded-for');
  if (forwardedFor && forwardedFor.trim()) {
    const firstIp = forwardedFor.split(',')[0]?.trim();
    if (firstIp) return firstIp;
  }

  const realIp = getHeader('x-real-ip');
  if (realIp && realIp.trim()) return realIp.trim();

  return '127.0.0.1';
}

export function createRateLimiter(options?: RateLimiterOptions): RateLimiter {
  return new RateLimiter(options);
}

const defaultRateLimiterMap = new Map<string, RateLimiter>();

/**
 * Functional rate limit checker that manages internal rate limiters by configuration.
 */
export function checkRateLimit(
  key: string,
  max: number = 60,
  windowMs: number = 60000
): RateLimitResult {
  const configKey = `${max}:${windowMs}`;
  let limiter = defaultRateLimiterMap.get(configKey);
  if (!limiter) {
    limiter = new RateLimiter({ max, windowMs });
    defaultRateLimiterMap.set(configKey, limiter);
  }
  return limiter.consume(key);
}

