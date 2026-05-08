import { useNavigate } from 'react-router-dom'
import './HkFormPage.css'
import backBtn from '../../assets/buttons/back.png'
import continueBtn from '../../assets/buttons/continue.png'

function HkFormPage({
  backgroundSrc,
  backTo,
  onContinue,
  continueDisabled,
  formClassName,
  children,
}) {
  const navigate = useNavigate()

  const handleBack = () => {
    navigate(backTo)
  }

  const handleContinue = () => {
    if (onContinue) {
      onContinue()
    }
  }

  return (
    <div className="hk-page">
      <div className="hk-page-content">
        <img src={backgroundSrc} alt="" className="hk-page-bg" aria-hidden="true" />

        <div className={`hk-form${formClassName ? ` ${formClassName}` : ''}`}>
          {children}
        </div>

        <button className="hk-back-btn" onClick={handleBack}>
          <img src={backBtn} alt="Back" />
        </button>
        <button
          className="hk-continue-btn"
          onClick={handleContinue}
          disabled={continueDisabled}
        >
          <img src={continueBtn} alt="Continue" />
        </button>
      </div>
    </div>
  )
}

export default HkFormPage
