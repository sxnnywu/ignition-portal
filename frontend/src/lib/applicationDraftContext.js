import { createContext, useContext } from 'react'

// Context + hook for the hacker application draft. Kept in its own (non-JSX,
// non-component) module so the provider file only exports a component.
export const DraftContext = createContext(null)

export function useApplicationDraft() {
  const ctx = useContext(DraftContext)
  if (!ctx) throw new Error('useApplicationDraft must be used within ApplicationDraftProvider')
  return ctx
}
