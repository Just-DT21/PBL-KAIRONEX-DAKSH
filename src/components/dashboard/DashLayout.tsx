import type { ReactNode } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import { initialsOf } from '../../data/format'
import { useApp } from '../../state/AppContext'

export interface DashItem {
  to: string
  label: string
  short?: string
  icon: LucideIcon
  badge?: number
}

export default function DashLayout({ items, title, accent, children }: { items: DashItem[]; title: string; accent?: string; children?: ReactNode }) {
  const { user } = useApp()
  return (
    <div className="dash-shell">
      <aside className="dash-side">
        <div className="dash-side-head">
          <span className="avatar-btn" style={{ cursor: 'default' }}>{initialsOf(user?.name ?? 'NB')}</span>
          <div style={{ minWidth: 0 }}>
            <b style={{ fontSize: 13.5, display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name ?? 'Guest'}</b>
            <span style={{ fontSize: 11.5, color: accent ?? 'var(--blue)', fontWeight: 600 }}>{title}</span>
          </div>
        </div>
        <nav className="dash-nav" aria-label="Dashboard sections">
          {items.map((it) => (
            <NavLink key={it.to} to={it.to} end className={({ isActive }) => `dash-link ${isActive ? 'on' : ''}`}>
              <it.icon size={16} />
              <span>{it.label}</span>
              {it.badge ? <span className="dash-badge">{it.badge}</span> : null}
            </NavLink>
          ))}
        </nav>
        <div className="dash-side-foot">
          <span className="demo-tag">Demo workspace</span>
        </div>
      </aside>

      <main className="dash-main">
        {children ?? <Outlet />}
      </main>

      <nav className="dash-bottomnav" aria-label="Dashboard sections">
        {items.slice(0, 5).map((it) => (
          <NavLink key={it.to} to={it.to} end className={({ isActive }) => `bn-item ${isActive ? 'on' : ''}`}>
            <it.icon size={18} />
            <span>{it.short ?? it.label.split(' ')[0]}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
