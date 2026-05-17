import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import HkFormPage from '../../components/hacker/HkFormPage'
import teammatesBg from '../../assets/backgrounds/teammates.png'
import { getToken } from '../../lib/auth'
import { apiUrl } from '../../lib/api'

function Teammates() {
  const navigate = useNavigate()
  const [teammates, setTeammates] = useState([
    { name: '', email: '' },
    { name: '', email: '' },
    { name: '', email: '' },
  ])
  const [loading, setLoading] = useState(false)

  const handleTeammateChange = (index, field, value) => {
    const updated = [...teammates]
    updated[index] = { ...updated[index], [field]: value }
    setTeammates(updated)
  }

  const handleContinue = async () => {
    const token = getToken()
    if (!token) {
      alert('You must be logged in to save your application. Please log in and try again.')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(apiUrl('/applications'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          answers: { teammates },
          status: 'draft',
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save teammates data')
      }

      navigate('/info')
    } catch (error) {
      console.error('Error saving teammates data:', error)
      alert('Error saving your data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <HkFormPage
      backgroundSrc={teammatesBg}
      backTo="/experience"
      onContinue={handleContinue}
      continueDisabled={loading}
      formClassName="hk-form--vertical"
    >
      <div className="hk-form-section">
        <label className="hk-section-label">Enter the information of your teammates!</label>
        <div className="hk-field-row">
          <input
            type="text"
            placeholder="Full name"
            className="hk-input"
            value={teammates[0].name}
            onChange={(e) => handleTeammateChange(0, 'name', e.target.value)}
          />
          <input
            type="email"
            placeholder="Email address"
            className="hk-input"
            value={teammates[0].email}
            onChange={(e) => handleTeammateChange(0, 'email', e.target.value)}
          />
        </div>
      </div>

      <div className="hk-form-section">
        <div className="hk-field-row">
          <input
            type="text"
            placeholder="Full name"
            className="hk-input"
            value={teammates[1].name}
            onChange={(e) => handleTeammateChange(1, 'name', e.target.value)}
          />
          <input
            type="email"
            placeholder="Email address"
            className="hk-input"
            value={teammates[1].email}
            onChange={(e) => handleTeammateChange(1, 'email', e.target.value)}
          />
        </div>
      </div>

      <div className="hk-form-section">
        <div className="hk-field-row">
          <input
            type="text"
            placeholder="Full name"
            className="hk-input"
            value={teammates[2].name}
            onChange={(e) => handleTeammateChange(2, 'name', e.target.value)}
          />
          <input
            type="email"
            placeholder="Email address"
            className="hk-input"
            value={teammates[2].email}
            onChange={(e) => handleTeammateChange(2, 'email', e.target.value)}
          />
        </div>
      </div>
    </HkFormPage>
  )
}

export default Teammates
