import './PortalSidebar.css'

export default function PortalSidebar({ items, activeKey, onSelect }) {
  return (
    <aside className="portal-sidebar">
      {items.map((item) => (
        <button
          key={item.key}
          className={`portal-sidebar-item${activeKey === item.key ? ' portal-sidebar-item--active' : ''}`}
          onClick={() => onSelect(item.key)}
        >
          <img src={item.icon} alt="" className="portal-sidebar-item-icon" />
          <span className="portal-sidebar-item-label">{item.label}</span>
          {item.count != null && (
            <span className="portal-sidebar-item-count">{item.count}</span>
          )}
        </button>
      ))}
    </aside>
  )
}
