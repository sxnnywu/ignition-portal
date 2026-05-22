/**
 * Simple module-level TTL cache.
 *
 * Data lives in a plain Map that persists across React component
 * mount / unmount cycles (it's module scope, not React state).
 * This means navigating from /reviewer → /admin → /reviewer will
 * reuse the cached reviewer data instead of re-fetching.
 *
 * Each entry has a TTL (default 60 s).  After that it is treated as
 * stale and the next read returns null so the caller re-fetches.
 */

const store = new Map()

/* ---- read / write ---- */

export function getCached(key) {
  const entry = store.get(key)
  if (!entry) return null
  if (Date.now() > entry.expiresAt) {
    store.delete(key)
    return null
  }
  return entry.data
}

export function setCache(key, data, ttlMs = 60_000) {
  store.set(key, { data, expiresAt: Date.now() + ttlMs })
}

/* ---- invalidation ---- */

/** Drop a single key, or pass nothing / null to flush everything. */
export function invalidateCache(key) {
  if (key) {
    store.delete(key)
  } else {
    store.clear()
  }
}

/**
 * Drop every key whose name starts with `prefix`.
 * Useful for wiping all pages of a paginated list, e.g.
 *   invalidateCacheByPrefix('admin-apps:')
 */
export function invalidateCacheByPrefix(prefix) {
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) store.delete(key)
  }
}

/* ---- cache keys (single source of truth) ---- */

export const CACHE_KEYS = {
  REVIEWER_APPS: 'reviewer-apps',
  ADMIN_STATS: 'admin-stats',
  /** Parameterised — call with args to build the key */
  adminApps: (params) => `admin-apps:${JSON.stringify(params)}`,
  adminUsers: (params) => `admin-users:${JSON.stringify(params)}`,
}
