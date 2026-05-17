import { Outlet } from 'react-router-dom'
import PortalNavBar from '../../components/portal/PortalNavBar'
import './ReviewerLayout.css'

export default function ReviewerLayout() {
  return (
    <div className="reviewer-layout">
      <PortalNavBar />
      <div className="reviewer-layout-body">
        <Outlet />
      </div>
    </div>
  )
}
