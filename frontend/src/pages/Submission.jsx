import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import './Submission.css'
import headerImg from '../assets/backgrounds/header.svg'
import backBtn from '../assets/buttons/back-button.svg'
import submitBtn from '../assets/buttons/submit-button.svg'

function Submission() {
  const navigate = useNavigate()
  const { id } = useParams() // application id from the URL e.g. /submission/abc123
  const [isPending, setIsPending] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async () => {
    if (!id) return
    setIsPending(true)
    setError(null)
    try {
      // grab the JWT token the backend gave us when we logged in
      const token = sessionStorage.getItem('token')
      // POST to the backend submit endpoint, sending the token so the backend knows who we are
      const res = await fetch(`/applications/${id}/submit`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      // if the response isn't 2xx, read the error message from the backend and throw it
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || 'Something went wrong. Please try again.')
      }
      setIsSuccess(true)
    } catch (err) {
      setError(err.message)
    } finally {
      // always re-enable the button when the request finishes
      setIsPending(false)
    }
  }

  // success screen shown after a successful submission
  if (isSuccess) {
    return (
      <div className="submission">
        <div className="submission-content">
          <img src={headerImg} alt="Ignition Hacks V7" className="submission-header" />
          <div className="submission-card">
            <h2 className="submission-done">All done!</h2>
            <h1 className="submission-title">APPLICATION SUBMITTED</h1>
            <p className="submission-subtitle">
              Your application has been submitted successfully. Good luck!
            </p>
          </div>
        </div>
      </div>
    )
  }

  // default screen — shown before the user submits
  return (
    <div className="submission">
      <div className="submission-content">
        <img src={headerImg} alt="Ignition Hacks V7" className="submission-header" />
        <div className="submission-card">
          <h2 className="submission-done">All done!</h2>
          <h1 className="submission-title">READY TO SUBMIT?</h1>
          <p className="submission-subtitle">Apply now to join this year's super fun hackathon!</p>

          {/* show error message from backend if the submission fails */}
          {error && <p className="submission-error">{error}</p>}

          <div className="submission-buttons">
            <button className="submission-back-btn" onClick={() => navigate(-1)} disabled={isPending}>
              <img src={backBtn} alt="Back" />
            </button>
            <button className="submission-submit-btn" onClick={handleSubmit} disabled={isPending}>
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
