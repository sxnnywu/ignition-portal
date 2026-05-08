import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import './Submission.css'
import headerImg from '../../assets/backgrounds/header.svg'
import backBtn from '../../assets/buttons/back-button.svg'
import submitBtn from '../../assets/buttons/submit-button.svg'
import { getToken } from '../../lib/auth'
import { apiUrl } from '../../lib/api'

function Submission() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [isPending, setIsPending] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async () => {
    if (!id) return
    const token = getToken()
    if (!token) {
      setError('You must be logged in to submit your application. Please log in and try again.')
      return
    }
    setIsPending(true)
    setError(null)
    try {
      const res = await fetch(apiUrl(`/applications/${id}/submit`), {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || 'Something went wrong. Please try again.')
      }
      setIsSuccess(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsPending(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="hk-sub">
        <div className="hk-sub-content">
          <img src={headerImg} alt="Ignition Hacks V7" className="hk-sub-header" />
          <div className="hk-sub-card">
            <h2 className="hk-sub-done">All done!</h2>
            <h1 className="hk-sub-title">APPLICATION SUBMITTED</h1>
            <p className="hk-sub-subtitle">
              Your application has been submitted successfully. Good luck!
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="hk-sub">
      <div className="hk-sub-content">
        <img src={headerImg} alt="Ignition Hacks V7" className="hk-sub-header" />
        <div className="hk-sub-card">
          <h2 className="hk-sub-done">All done!</h2>
          <h1 className="hk-sub-title">READY TO SUBMIT?</h1>
          <p className="hk-sub-subtitle">Apply now to join this year's super fun hackathon!</p>

          {error && <p className="hk-sub-error">{error}</p>}

          <div className="hk-sub-buttons">
            <button className="hk-sub-back-btn" onClick={() => navigate(-1)} disabled={isPending}>
              <img src={backBtn} alt="Back" />
            </button>
            <button className="hk-sub-submit-btn" onClick={handleSubmit} disabled={isPending}>
              <img
                src={submitBtn}
                alt={isPending ? 'Submitting...' : 'Submit Application'}
                style={isPending ? { opacity: 0.5 } : undefined}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Submission
