// imports
import { useNavigate, useParams } from 'react-router-dom'
import { useSubmitApplication } from '../hooks/useSubmitApplication'
import './Submission.css'
import headerImg from '../assets/backgrounds/header.svg'
import backBtn from '../assets/buttons/back-button.svg'
import submitBtn from '../assets/buttons/submit-button.svg'

function Submission() {
  const navigate = useNavigate()
  const { id } = useParams() // application id from URL
  const { mutate, isPending, isSuccess, isError, error } = useSubmitApplication()

  // submit the application by id
  const handleSubmit = () => {
    if (!id) return
    mutate(id)
  }

  // success state after submission
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

  // default state - ready to submit
  return (
    <div className="submission">
      <div className="submission-content">
        <img src={headerImg} alt="Ignition Hacks V7" className="submission-header" />

        <div className="submission-card">
          <h2 className="submission-done">All done!</h2>
          <h1 className="submission-title">READY TO SUBMIT?</h1>
          <p className="submission-subtitle">Apply now to join this year's super fun hackathon!</p>

          {/* display error message from backend if submission fails */}
          {isError && (
            <p className="submission-error">
              {error?.response?.data?.message || 'Something went wrong. Please try again.'}
            </p>
          )}

          <div className="submission-buttons">
            <button
              className="submission-back-btn"
              onClick={() => navigate(-1)}
              disabled={isPending}
            >
              <img src={backBtn} alt="Back" />
            </button>
            <button
              className="submission-submit-btn"
              onClick={handleSubmit}
              disabled={isPending}
            >
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
