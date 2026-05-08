import { useNavigate } from 'react-router-dom'
import HkFormPage from '../../components/hacker/HkFormPage'
import educationBg from '../../assets/backgrounds/education.png'

function Education() {
  const navigate = useNavigate()

  return (
    <HkFormPage
      backgroundSrc={educationBg}
      backTo="/info"
      onContinue={() => navigate('/experience')}
    >
      <div className="hk-form-section">
        <label className="hk-section-label">School</label>
        <div className="hk-field-row">
          <input type="text" placeholder="Educational institution" className="hk-input" />
          <select className="hk-select" defaultValue="">
            <option value="" disabled>Level of education</option>
            <option value="high-school">High School</option>
            <option value="undergraduate">Undergraduate</option>
            <option value="graduate">Graduate</option>
            <option value="bootcamp">Bootcamp</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <div className="hk-form-section">
        <label className="hk-section-label">Program</label>
        <div className="hk-field-row">
          <input type="text" placeholder="Program name" className="hk-input" />
          <select className="hk-select" defaultValue="">
            <option value="" disabled>Co-op student?</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>
      </div>
    </HkFormPage>
  )
}

export default Education
