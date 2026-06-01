import { useState } from 'react'
import { getUser } from '../../lib/auth'
import './UserIdBadge.css'

// Fixed top-right badge showing the signed-in hacker their own user id.
// Hackers share this id with their team so they can be added as teammates.
function UserIdBadge() {
  const user = getUser()
  const [copied, setCopied] = useState(false)

  if (!user?._id) return null

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(user._id)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // clipboard may be unavailable — selecting the text still works
    }
  }

  return (
    <button
      type="button"
      className="user-id-badge"
      onClick={handleCopy}
      title="Click to copy your User ID"
    >
      <span className="user-id-badge-label">Your User ID:</span>
      <span className="user-id-badge-value">{user._id}</span>
      <span className="user-id-badge-hint">{copied ? 'Copied!' : 'Copy'}</span>
    </button>
  )
}

export default UserIdBadge
