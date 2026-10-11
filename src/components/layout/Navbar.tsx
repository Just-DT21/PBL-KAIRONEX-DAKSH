import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Bell, ChevronDown, Menu, Rocket, Telescope, X, LayoutDashboard, LogOut, MessageSquare, Search } from 'lucide-react'
import { useApp } from '../../state/AppContext'
import { initialsOf } from '../../data/format'
import { Logo } from '../../brand/Logo'

export default function Navbar() {
  const { user, logout, notifications, unreadCount, markAllRead } = useApp()
  const [scrolled, setScrolled] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [acctOpen, setAcctOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const navRef = useRef<HTMLElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setCreateOpen(false)
        setAcctOpen(false)
        setNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const dash = user?.role === 'investor' ? '/dashboard/discover' : '/dashboard'
  const links = [
    { to: '/explore', label: 'Explore Startups' },
    { to: '/investors', label: 'Investors' },
    { to: '/showcase', label: 'Showcase' },
    { to: '/#how-it-works', label: 'How It Works', plain: true },
    { to: '/ai-match', label: 'AI Match' },
  ]

  return (
    <header className={`nav ${scrolled ? 'scrolled' : ''}`} ref={navRef}>
      <div className="nav-inner">
        <Link to="/" className="logo" aria-label="KAIRONEXA home">
          <Logo size={30} />
        </Link>

        <nav className="nav-links" aria-label="Primary">
          {links.map((l) =>
            l.plain ? (
              <a key={l.to} className="nav-link" href={l.to} onClick={(e) => { e.preventDefault(); navigate('/'); setTimeout(() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' }), 80) }}>
                {l.label}
              </a>
            ) : (
              <NavLink key={l.to} to={l.to} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                {l.label}
              </NavLink>
            ),
          )}
        </nav>

        <div className="nav-cta">
          <button className="icon-btn search-trigger" aria-label="Open search" onClick={() => window.dispatchEvent(new Event('nb:open-search'))}>
            <Search size={16} />
          </button>
          {user ? (
            <>
              <div style={{ position: 'relative' }}>
                <button className="icon-btn" aria-label="Notifications" onClick={() => { setNotifOpen(!notifOpen); setAcctOpen(false); setCreateOpen(false) }}>
                  <Bell size={17} />
                  {unreadCount > 0 && <span className="notif-dot" aria-hidden />}
                </button>
                <AnimatePresence>
                  {notifOpen && (
                    <motion.div initial={{ opacity: 0, y: 6, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 6, scale: 0.98 }} transition={{ duration: 0.16 }} className="glass account-menu" style={{ width: 320 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px 10px' }}>
                        <b style={{ fontSize: 13 }}>Notifications</b>
                        <button className="btn btn-ghost btn-sm" style={{ padding: '3px 9px', fontSize: 11 }} onClick={markAllRead}>Mark all read</button>
                      </div>
                      <div style={{ maxHeight: 330, overflow: 'auto' }}>
                        {notifications.map((n) => (
                          <Link key={n.id} to={n.link ?? '#'} className="notif-item" onClick={() => setNotifOpen(false)} style={{ opacity: n.read ? 0.62 : 1 }}>
                            <span className={`notif-bubble ${n.kind}`} aria-hidden />
                            <span>
                              <b style={{ fontSize: 12.8 }}>{n.title}</b>
                              <span style={{ display: 'block', fontSize: 12, color: 'var(--text-2)' }}>{n.body}</span>
                            </span>
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div style={{ position: 'relative' }}>
                <button className="avatar-btn" onClick={() => { setAcctOpen(!acctOpen); setCreateOpen(false); setNotifOpen(false) }} aria-label="Account menu">
                  {initialsOf(user.name)}
                </button>
                <AnimatePresence>
                  {acctOpen && (
                    <motion.div initial={{ opacity: 0, y: 6, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 6, scale: 0.98 }} transition={{ duration: 0.16 }} className="glass account-menu">
                      <div style={{ padding: '8px 12px 10px', borderBottom: '1px solid var(--border)', marginBottom: 6 }}>
                        <b style={{ fontSize: 13.5 }}>{user.name}</b>
                        <div style={{ fontSize: 11.5, color: 'var(--text-2)' }}>{user.email}</div>
                        <span className="badge badge-blue" style={{ marginTop: 8 }}>{user.role === 'investor' ? 'Investor' : user.role === 'admin' ? 'Admin' : 'Entrepreneur'}</span>
                      </div>
                      <Link to={dash} onClick={() => setAcctOpen(false)}><LayoutDashboard size={14} /> Dashboard</Link>
                      <Link to="/messages" onClick={() => setAcctOpen(false)}><MessageSquare size={14} /> Messages</Link>
                      <button onClick={() => { logout(); setAcctOpen(false); navigate('/') }}><LogOut size={14} /> Log out</button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <>
              <Link to="/auth" className="btn btn-ghost btn-sm">Log In</Link>
              <div className="dropdown-wrap">
                <button className="btn btn-primary btn-sm" onClick={() => setCreateOpen(!createOpen)}>
                  Create Account <ChevronDown size={13} />
                </button>
                <AnimatePresence>
                  {createOpen && (
                    <motion.div initial={{ opacity: 0, y: 6, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 6, scale: 0.98 }} transition={{ duration: 0.16 }} className="glass dropdown">
                      <button className="dropdown-item" onClick={() => navigate('/auth?role=entrepreneur&mode=signup')}>
                        <span className="di-icon"><Rocket size={17} /></span>
                        <span><b>Entrepreneur</b><small>I'm building a company — publish my startup and find investors.</small></span>
                      </button>
                      <button className="dropdown-item" onClick={() => navigate('/auth?role=investor&mode=signup')}>
                        <span className="di-icon violet"><Telescope size={17} /></span>
                        <span><b>Investor</b><small>I'm looking to invest — discover opportunities matching my thesis.</small></span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          )}

          <button className="mobile-toggle" aria-label="Menu" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} className="mobile-menu">
            {links.map((l) =>
              l.plain ? (
                <a key={l.to} href={l.to} onClick={(e) => { e.preventDefault(); setMobileOpen(false); navigate('/'); setTimeout(() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' }), 120) }}>
                  {l.label}
                </a>
              ) : (
                <Link key={l.to} to={l.to} onClick={() => setMobileOpen(false)}>{l.label}</Link>
              ),
            )}
            {!user && (
              <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                <Link to="/auth" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setMobileOpen(false)}>Log In</Link>
                <Link to="/auth?role=entrepreneur&mode=signup" className="btn btn-primary" style={{ flex: 1 }} onClick={() => setMobileOpen(false)}>Create Account</Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
