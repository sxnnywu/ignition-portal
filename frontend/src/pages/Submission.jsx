import { useNavigate } from 'react-router-dom'
import './Submission.css'
import headerImg from '../assets/backgrounds/Header.png'
import backBtn from '../assets/buttons/back-button.png'
import submitBtn from '../assets/buttons/Submit Button.png'

function Submission() {
  const navigate = useNavigate()

  const handleSubmit = () => {
    // TODO: integrate with backend submission logic
  }

  return (
    <div className="submission">
      <div className="submission-content">
        <img src={headerImg} alt="Ignition Hacks V7" className="submission-header" />

        <div className="submission-card">
          <h2 className="submission-done">All done!</h2>
          <h1 className="submission-title">READY TO SUBMIT?</h1>
          <p className="submission-subtitle">Apply now to join this year's super fun hackathon!</p>

          <div className="submission-buttons">
            <button className="submission-back-btn" onClick={() => navigate(-1)}>
              <img src={backBtn} alt="Back" />
            </button>
            <button className="submission-submit-btn" onClick={handleSubmit}>
              <img src={submitBtn} alt="Submit Application" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Submission
