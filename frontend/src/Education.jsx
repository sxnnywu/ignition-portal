import { useNavigate } from 'react-router-dom'
import './Education.css'
import educationBg from './assets/backgrounds/education.png'
import backBtn from './assets/buttons/back.png'
import continueBtn from './assets/buttons/continue.png'

function Education() {
  const navigate = useNavigate()

  return (
    <div className="education">
      <div className="education-content">
        <img src={educationBg} alt="" className="education-bg" />

        <div className="education-form">
          <div className="education-form-section">
            <label className="education-section-label">School</label>
            <div className="education-field-row">
              <input type="text" placeholder="Educational institution" className="education-input" />
              <select className="education-select">
                <option value="" disabled>
                  Level of education
                </option>
                <option value="high-school">High School</option>
                <option value="undergraduate">Undergraduate</option>
                <option value="graduate">Graduate</option>
                <option value="bootcamp">Bootcamp</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="education-form-section">
            <label className="education-section-label">Program</label>
            <div className="education-field-row">
              <input type="text" placeholder="Program name" className="education-input" />
              <select className="education-select">
                <option value="" disabled>
                  Co-op student?
                </option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
          </div>
        </div>

        <button className="education-back-btn" onClick={() => navigate('/info')}>
          <img src={backBtn} alt="Back" />
        </button>
        <button className="education-continue-btn" onClick={() => navigate('/experience')}>
          <img src={continueBtn} alt="Continue" />
        </button>
      </div>
    </div>
  )
}

export default Education
