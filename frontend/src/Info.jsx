import { useNavigate } from 'react-router-dom'
import './Info.css'
import infoBg from './assets/backgrounds/info.png'
import backBtn from './assets/buttons/back.png'
import continueBtn from './assets/buttons/continue.png'

function Info() {
  const navigate = useNavigate()

  return (
    <div className="info">
      <div className="info-content">
        <img src={infoBg} alt="" className="info-bg" />

        <div className="info-form">
          <div className="info-form-section">
            <label className="info-section-label">Basics</label>
            <div className="info-field-row">
              <input type="text" placeholder="First name" className="info-input" />
              <input type="text" placeholder="Last name" className="info-input" />
            </div>
            <div className="info-field-row">
              <select className="info-select">
                <option value="" disabled>
                  Gender
                </option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="nonbinary">Non-binary</option>
                <option value="other">Other</option>
                <option value="prefer-not">Prefer not to say</option>
              </select>
              <input type="text" placeholder="Age" className="info-input" />
            </div>
            <div className="info-field-row">
              <select className="info-select">
                <option value="" disabled>
                  Ethnicity
                </option>
                <option value="asian">Asian</option>
                <option value="black">Black</option>
                <option value="hispanic">Hispanic/Latino</option>
                <option value="white">White</option>
                <option value="indigenous">Indigenous</option>
                <option value="middle-eastern">Middle Eastern</option>
                <option value="pacific-islander">Pacific Islander</option>
                <option value="multiracial">Multiracial</option>
                <option value="other">Other</option>
                <option value="prefer-not">Prefer not to say</option>
              </select>
            </div>
          </div>

          <div className="info-form-section">
            <label className="info-section-label">Location</label>
            <div className="info-field-row">
              <input type="text" placeholder="Country" className="info-input" />
              <input type="text" placeholder="City" className="info-input" />
            </div>
            <div className="info-field-row">
              <input type="text" placeholder="State/Province" className="info-input" />
            </div>
          </div>
        </div>

        <button className="info-back-btn" onClick={() => navigate('/')}>
          <img src={backBtn} alt="Back" />
        </button>
        <button className="info-continue-btn" onClick={() => navigate('/education')}>
          <img src={continueBtn} alt="Continue" />
        </button>
      </div>
    </div>
  )
}

export default Info
