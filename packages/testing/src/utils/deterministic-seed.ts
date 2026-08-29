/**
 * Deterministic pseudo-random number generator and sequence generator for tests.
 * Ensures consistent, repeatable test runs across all CI and local environments.
 */
export class DeterministicSequence {
  private seed: number;

  constructor(seed = 42) {
    this.seed = seed;
  }

  /**
   * Generates a deterministic float between 0 and 1 (Mulberry32 PRNG algorithm).
   */
  next(): number {
    let t = (this.seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /**
   * Generates a deterministic integer between min and max (inclusive).
   */
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  /**
   * Picks a deterministic item from an array.
   */
  pick<T>(items: readonly T[]): T {
    if (items.length === 0) {
      throw new Error('Cannot pick from empty array');
    }
    const index = this.nextInt(0, items.length - 1);
    return items[index] as T;
  }

  /**
   * Deterministic timestamp generator within a reference range.
   */
  timestamp(baseDate = 1704067200000, offsetDays = 0): number {
    return baseDate + offsetDays * 86400000 + this.nextInt(0, 3600000);
  }

  /**
   * Resets the seed.
   */
  reset(seed = 42): void {
    this.seed = seed;
  }
}

export const defaultSequence = new DeterministicSequence(42);
