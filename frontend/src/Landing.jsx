import { useNavigate } from 'react-router-dom'
import './Landing.css'
import cloudImg from './assets/backgrounds/landing-cloud.svg'
import iggyImg from './assets/backgrounds/landing-iggy.svg'
import logoImg from './assets/logo.svg'

function Landing() {
  const navigate = useNavigate()

  return (
    <div className="landing">
      <div className="landing-header">
        <img src={logoImg} alt="Ignition Hacks Logo" className="landing-logo" />
        <span className="landing-header-text">IGNITION HACKS V7</span>
      </div>
      <img src={cloudImg} alt="" className="landing-cloud" />
      <img src={iggyImg} alt="" className="landing-iggy" />
      <div className="landing-card">
        <div className="landing-card-text">
          <div className="landing-heading">
            <p className="landing-welcome">Welcome to</p>
            <p className="landing-title">IGNITION HACKS</p>
          </div>
          <p className="landing-subtitle">Apply now to join this year&apos;s super fun hackathon!</p>
        </div>
        <div className="landing-btn-row">
          <button className="start-application-btn" onClick={() => navigate('/info')}>
            Start Application
            <span className="start-application-arrow" aria-hidden="true" />
          </button>
          <button className="continue-draft-btn" onClick={() => navigate('/info')}>
            Continue Draft
          </button>
        </div>
      </div>
    </div>
  )
}

export default Landing
