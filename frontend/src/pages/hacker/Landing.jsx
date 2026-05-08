import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './Landing.css'
import landingBg from '../../assets/backgrounds/landing.png'
import startAppBtn from '../../assets/buttons/start-application.png'
import { getToken } from '../../lib/auth'

function Landing() {
  const navigate = useNavigate()

  useEffect(() => {
    if (getToken()) {
      navigate('/dashboard', { replace: true })
    }
  }, [navigate])

  return (
    <div className="hk-landing">
      <div className="hk-landing-content">
        <img src={landingBg} alt="" className="hk-landing-bg" aria-hidden="true" />
        <button className="hk-landing-start-btn" onClick={() => navigate('/info')}>
          <img src={startAppBtn} alt="Start Application" />
        </button>
      </div>
    </div>
  )
}

export default Landing
