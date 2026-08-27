/**
 * Semantic Versioning (SemVer) utilities
 * Validates and compares versions according to SemVer 2.0.0 specifications
 */

const SEMVER_REGEX =
  /^v?(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;

/**
 * Validates if string matches SemVer 2.0.0 specification
 */
export function isValidSemver(version: string): boolean {
  if (!version || typeof version !== 'string') return false;
  return SEMVER_REGEX.test(version.trim());
}

/**
 * Normalizes semver string by trimming and removing optional leading 'v'
 */
export function normalizeSemver(version: string): string {
  const trimmed = version.trim();
  return trimmed.startsWith('v') || trimmed.startsWith('V') ? trimmed.slice(1) : trimmed;
}

/**
 * Compares two SemVer strings (returns > 0 if a > b, < 0 if a < b, 0 if equal)
 */
export function compareSemver(a: string, b: string): number {
  const normA = normalizeSemver(a);
  const normB = normalizeSemver(b);

  const matchA = SEMVER_REGEX.exec(normA);
  const matchB = SEMVER_REGEX.exec(normB);

  if (!matchA || !matchB) {
    return normA.localeCompare(normB);
  }

  const majorA = parseInt(matchA[1] || '0', 10);
  const majorB = parseInt(matchB[1] || '0', 10);
  if (majorA !== majorB) return majorA - majorB;

  const minorA = parseInt(matchA[2] || '0', 10);
  const minorB = parseInt(matchB[2] || '0', 10);
  if (minorA !== minorB) return minorA - minorB;

  const patchA = parseInt(matchA[3] || '0', 10);
  const patchB = parseInt(matchB[3] || '0', 10);
  if (patchA !== patchB) return patchA - patchB;

  // Prerelease comparison: non-prerelease is higher than prerelease
  const preA = matchA[4];
  const preB = matchB[4];

  if (!preA && preB) return 1;
  if (preA && !preB) return -1;
  if (preA && preB) return preA.localeCompare(preB);

  return 0;
}
