import { useState, useEffect, useCallback, useRef } from 'react'
import { getCached, setCache } from '../lib/cache'

/**
 * Drop-in fetch hook with built-in TTL caching.
 *
 * On mount it checks the module-level cache first.  If fresh data is
 * found, it returns it immediately (no loading spinner, no network).
 * Otherwise it calls `fetchFn` and stores the result.
 *
 * @param {string}   cacheKey  Unique key for this dataset.
 * @param {Function} fetchFn   Async function that returns the data.
 * @param {object}   [opts]
 * @param {number}   [opts.ttl=60000]  Cache lifetime in ms.
 * @param {boolean}  [opts.skip=false] Skip the automatic fetch (useful for conditional fetches).
 * @returns {{ data, loading, error, refresh }}
 */
export default function useCachedFetch(cacheKey, fetchFn, { ttl = 60_000, skip = false } = {}) {
  const [data, setData] = useState(() => getCached(cacheKey))
  const [loading, setLoading] = useState(() => !getCached(cacheKey) && !skip)
  const [error, setError] = useState(null)

  // Keep fetchFn stable across renders without forcing the caller to
  // wrap it in useCallback — we always call the latest version.
  const fetchRef = useRef(fetchFn)
  fetchRef.current = fetchFn

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetchRef.current()
      setCache(cacheKey, result, ttl)
      setData(result)
    } catch (err) {
      setError(err.message || 'Fetch failed')
    } finally {
      setLoading(false)
    }
  }, [cacheKey, ttl])

  useEffect(() => {
    if (skip) return

    const cached = getCached(cacheKey)
    if (cached) {
      // Instant — no loading flash
      setData(cached)
      setLoading(false)
      return
    }

    refresh()
  }, [cacheKey, skip, refresh])

  return { data, loading, error, refresh }
}
