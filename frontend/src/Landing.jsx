import './Landing.css'
import landingBg from './assets/backgrounds/landing.png'
import startAppBtn from './assets/buttons/start-application.png'

function Landing() {
  return (
    <div className="landing">
      <div className="landing-content">
        <img src={landingBg} alt="" className="landing-bg" />
        <button className="start-application-btn">
          <img src={startAppBtn} alt="Start Application" />
        </button>
      </div>
    </div>
  )
}

export default Landing
