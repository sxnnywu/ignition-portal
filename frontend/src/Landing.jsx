import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './Landing.css'
import landingBg from './assets/backgrounds/landing.png'
import startAppBtn from './assets/buttons/start-application.png'
import { getToken } from './lib/auth'

// Landing page is intentionally kept as the original design (background + Start Application button).
// If the user already has a token, we send them to /dashboard so they see their hacker status
// instead of the intro screen again. Otherwise Start Application drops them directly into the
// application form flow at /info (the original behavior before signup was wired in).
function Landing() {
  const navigate = useNavigate()

  useEffect(() => {
    if (getToken()) {
      navigate('/dashboard', { replace: true })
    }
  }, [navigate])

  return (
    <div className="landing">
      <div className="landing-content">
        <img src={landingBg} alt="" className="landing-bg" />
        <button className="start-application-btn" onClick={() => navigate('/info')}>
          <img src={startAppBtn} alt="Start Application" />
        </button>
      </div>
    </div>
  )
}

export default Landing
