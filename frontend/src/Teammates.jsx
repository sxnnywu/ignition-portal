import { useNavigate } from 'react-router-dom'
import './Teammates.css'
import teammatesBg from './assets/backgrounds/teammates.png'
import backBtn from './assets/buttons/back.png'
import continueBtn from './assets/buttons/continue.png'

function Teammates() {
  const navigate = useNavigate()

  return (
    <div className="teammates">
      <div className="teammates-content">
        <img src={teammatesBg} alt="" className="teammates-bg" />

        <div className="teammates-form">
          <div className="teammates-form-section">
            <label className="education-section-label">Enter the information of you teammates!</label>
            <div className="teammates-field-row">
              <input type="text" placeholder="Full name" className="teammates-input" />
              <input type="email" placeholder="Email address" className="teammates-input" />
            </div>
          </div>

          <div className="teammates-form-section">
            <div className="teammates-field-row">
              <input type="text" placeholder="Full name" className="teammates-input" />
              <input type="email" placeholder="Email address" className="teammates-input" />
            </div>
          </div>

          <div className="teammates-form-section">
            <div className="teammates-field-row">
              <input type="text" placeholder="Full name" className="teammates-input" />
              <input type="email" placeholder="Email address" className="teammates-input" />
            </div>
          </div>
        </div>

        <button className="teammates-back-btn" onClick={() => navigate('/experience')}>
          <img src={backBtn} alt="Back" />
        </button>
        <button className="teammates-continue-btn">
          <img src={continueBtn} alt="Continue" />
        </button>
      </div>
    </div>
  )
}

export default Teammates
