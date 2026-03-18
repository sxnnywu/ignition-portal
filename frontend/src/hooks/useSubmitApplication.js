import { useMutation } from '@tanstack/react-query'
import api from '../lib/axios'

// react-query mutation hook for POST /applications/:id/submit
export function useSubmitApplication() {
  return useMutation({
    mutationFn: (applicationId) => {
      return api.post(`/applications/${applicationId}/submit`)
    },
  })
}
