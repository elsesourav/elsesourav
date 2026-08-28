type ClassValue = string | number | boolean | undefined | null;

/**
 * Clean, lightweight className combiner utility
 */
export function cn(...inputs: readonly ClassValue[]): string {
  return inputs.filter(Boolean).join(' ');
}
