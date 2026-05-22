import { Outlet } from 'react-router-dom'
import PortalNavBar from './PortalNavBar'
import './PortalLayout.css'

export default function PortalLayout() {
  return (
    <div className="portal-layout">
      <PortalNavBar />
      <div className="portal-layout-body">
        <Outlet />
      </div>
    </div>
  )
}
