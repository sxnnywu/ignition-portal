import { useNavigate } from 'react-router-dom'
import HkFormPage from '../../components/hacker/HkFormPage'
import infoBg from '../../assets/backgrounds/info.png'

function Info() {
  const navigate = useNavigate()

  return (
    <HkFormPage
      backgroundSrc={infoBg}
      backTo="/"
      onContinue={() => navigate('/education')}
    >
      <div className="hk-form-section">
        <label className="hk-section-label">Basics</label>
        <div className="hk-field-row">
          <input type="text" placeholder="First name" className="hk-input" />
          <input type="text" placeholder="Last name" className="hk-input" />
        </div>
        <div className="hk-field-row">
          <select className="hk-select" defaultValue="">
            <option value="" disabled>Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="nonbinary">Non-binary</option>
            <option value="other">Other</option>
            <option value="prefer-not">Prefer not to say</option>
          </select>
          <input type="text" placeholder="Age" className="hk-input" />
        </div>
        <div className="hk-field-row">
          <select className="hk-select" defaultValue="">
            <option value="" disabled>Ethnicity</option>
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

      <div className="hk-form-section">
        <label className="hk-section-label">Location</label>
        <div className="hk-field-row">
          <input type="text" placeholder="Country" className="hk-input" />
          <input type="text" placeholder="City" className="hk-input" />
        </div>
        <div className="hk-field-row">
          <input type="text" placeholder="State/Province" className="hk-input" />
        </div>
      </div>
    </HkFormPage>
  )
}

export default Info
