export const LEARNER_STORAGE_KEY = "live-cash-os:learner-state";
export const SYNC_META_KEY = "live-cash-os:sync-meta";
export const RECOVERY_BACKUP_KEY = "live-cash-os:recovery-backup";
export const IMPORT_BACKUP_KEY = "live-cash-os:pre-import-backup";
export const CONFLICT_BACKUP_KEY = "live-cash-os:sync-conflict";
export const PORTABLE_PROFILE_KEY = "live-cash-os:portable-profile-code";
export const PROFILE_STORAGE_MIGRATION_KEY = "live-cash-os:profile-storage-migration-v1";

export const PROFILE_LOCAL_STATE_KEYS = [
  LEARNER_STORAGE_KEY,
  SYNC_META_KEY,
  RECOVERY_BACKUP_KEY,
  IMPORT_BACKUP_KEY,
  CONFLICT_BACKUP_KEY,
] as const;

function hash32(value: string, seed: number): number {
  let hash = seed >>> 0;
  for (const character of value) {
    hash = Math.imul(hash ^ character.charCodeAt(0), 16777619) >>> 0;
  }
  return hash >>> 0;
}

/**
 * Stable browser-local namespace only. Server identity remains the SHA-256
 * portable profile hash; this token merely keeps one browser's local snapshots
 * from sharing raw storage keys or embedding the secret profile code in a key.
 */
export function profileStorageId(rawCode: string | null | undefined): string | null {
  const code = rawCode?.trim().toUpperCase();
  if (!code) return null;
  const seeds = [2166136261, 2246822519, 3266489917, 668265263];
  return seeds
    .map((seed, index) => hash32(`${index}:${code}`, seed).toString(16).padStart(8, "0"))
    .join("");
}

export function profileStorageKey(baseKey: string, rawCode: string | null | undefined): string {
  const storageId = profileStorageId(rawCode);
  return storageId ? `${baseKey}:profile:${storageId}` : baseKey;
}

export function activeProfileStorageKey(baseKey: string): string {
  if (typeof window === "undefined") return baseKey;
  let profileCode: string | null = null;
  try { profileCode = window.localStorage.getItem(PORTABLE_PROFILE_KEY); } catch { /* best effort */ }
  return profileStorageKey(baseKey, profileCode);
}

// A storage-denied browser (private mode, blocked cookies/storage, a
// storage-restricted embed) throws on localStorage access. Every read/write
// touchpoint in this codebase should degrade instead of crashing or hanging;
// these are the one canonical pair of wrappers for that.
export function safeStorageGet(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}

export function safeStorageSet(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}
