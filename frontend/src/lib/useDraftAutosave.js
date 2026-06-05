import { useEffect, useRef } from 'react'
import { getToken } from './auth'
import { apiUrl } from './api'

/**
 * Persists the current application step to the backend draft when the component
 * unmounts (i.e. the user navigates away), so in-progress data is never lost —
 * even if they didn't click "Save Draft".
 *
 * `getPayload` should return the slice to save (e.g. `{ personal: {...} }`) or
 * `null`/`undefined` when there is nothing worth saving. Return null until the
 * user has actually edited the form, otherwise the unmount that happens right
 * after a fresh prefill would overwrite the saved draft with blanks.
 */
export function useDraftAutosave(getPayload) {
  // keep the latest getPayload in a ref so the unmount cleanup reads fresh state
  const payloadRef = useRef(getPayload)
  payloadRef.current = getPayload

  useEffect(() => {
    return () => {
      const payload = payloadRef.current?.()
      if (!payload) return

      const token = getToken()
      if (!token) return

      fetch(apiUrl('/applications'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...payload, status: 'draft' }),
        keepalive: true,
      }).catch(() => {})
    }
  }, [])
}
