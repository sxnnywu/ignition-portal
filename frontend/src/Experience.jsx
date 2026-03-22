import { useNavigate } from 'react-router-dom'
import './Experience.css'
import experienceBg from './assets/backgrounds/experience.png'
import backBtn from './assets/buttons/back.png'
import continueBtn from './assets/buttons/continue.png'

function Experience() {
  const navigate = useNavigate()

  return (
    <div className="experience">
      <div className="experience-content">
        <img src={experienceBg} alt="" className="experience-bg" />

        <div className="experience-form">
          <div className="experience-form-section">
            <label className="experience-section-label">Did you attend IgnitionHacks 2025?</label>
            <div className="experience-field-row">
              <select className="experience-select">
                <option value="" disabled selected>Select</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
          </div>

          <div className="experience-form-section">
            <label className="experience-section-label">How many hackathons have you attended?</label>
            <div className="experience-field-row">
              <select className="experience-select">
                <option value="" disabled selected>Select</option>
                <option value="0">0</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5 or more</option>
              </select>
            </div>
          </div>
        </div>

        <button className="experience-back-btn" onClick={() => navigate('/education')}>
          <img src={backBtn} alt="Back" />
        </button>
        <button className="experience-continue-btn" onClick={() => navigate('/teammates')}>
          <img src={continueBtn} alt="Continue" />
        </button>
      </div>
    </div>
  )
}

export default Experience