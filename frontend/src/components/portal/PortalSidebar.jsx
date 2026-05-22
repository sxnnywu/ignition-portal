import './PortalSidebar.css'

export default function PortalSidebar({ title, items, activeKey, onSelect, children }) {
  return (
    <aside className="portal-sidebar">
      {title && <div className="portal-sidebar-title">{title}</div>}

      <nav className="portal-sidebar-nav">
        {items.map((item) => (
          <button
            key={item.key}
            className={`portal-sidebar-item${activeKey === item.key ? ' portal-sidebar-item--active' : ''}`}
            onClick={() => onSelect(item.key)}
          >
            {typeof item.icon === 'string' ? (
              <img src={item.icon} alt="" className="portal-sidebar-item-icon" />
            ) : (
              <span className="portal-sidebar-item-icon-wrap">{item.icon}</span>
            )}
            <span className="portal-sidebar-item-label">{item.label}</span>
            {item.count != null && (
              <span className="portal-sidebar-item-count">{item.count}</span>
            )}
          </button>
        ))}
      </nav>

      {children && (
        <>
          <div className="portal-sidebar-divider" />
          {children}
        </>
      )}
    </aside>
  )
}
