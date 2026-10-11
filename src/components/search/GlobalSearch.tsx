import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Search, Building2, TrendingUp, UserRound, X, CornerDownLeft } from 'lucide-react'
import { useApp } from '../../state/AppContext'

interface Result {
  type: 'startup' | 'investor' | 'industry'
  id: string
  name: string
  sub: string
  to: string
}

export default function GlobalSearch({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { companies, investors } = useApp()
  const [q, setQ] = useState('')
  const [sel, setSel] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 40)
    else setQ('')
  }, [open])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!open) return
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowDown') { e.preventDefault(); setSel((s) => Math.min(s + 1, results.length - 1)) }
      if (e.key === 'ArrowUp') { e.preventDefault(); setSel((s) => Math.max(s - 1, 0)) }
      if (e.key === 'Enter' && results[sel]) { navigate(results[sel].to); onClose() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const results = useMemo<Result[]>(() => {
    const query = q.trim().toLowerCase()
    const out: Result[] = []
    if (!query) {
      for (const c of companies.slice(0, 4))
        out.push({ type: 'startup', id: c.id, name: c.name, sub: `${c.industry} · ${c.location}`, to: `/startups/${c.id}` })
      for (const i of investors.slice(0, 3))
        out.push({ type: 'investor', id: i.id, name: i.firm, sub: `${i.type} · ${i.industries.slice(0, 2).join(', ')}`, to: `/investors/${i.id}` })
      return out
    }
    const tokens = query.split(/\s+/).filter(Boolean)
    const matches = (hay: string) => tokens.every((t) => hay.includes(t))
    for (const c of companies) {
      const hay = `${c.name} ${c.tagline} ${c.industry} ${c.sectorTags.join(' ')} ${c.location} ${c.stage}`.toLowerCase()
      if (matches(hay)) out.push({ type: 'startup', id: c.id, name: c.name, sub: `${c.industry} · ${c.location}`, to: `/startups/${c.id}` })
    }
    for (const i of investors) {
      const hay = `${i.firm} ${i.person} ${i.type} ${i.industries.join(' ')} ${i.stages.join(' ')}`.toLowerCase()
      if (matches(hay)) out.push({ type: 'investor', id: i.id, name: i.firm, sub: `${i.type} · ${i.person}`, to: `/investors/${i.id}` })
    }
    const inds = new Set<string>()
    for (const c of companies) {
      for (const t of [c.industry, ...c.sectorTags]) {
        if (tokens.some((tok) => t.toLowerCase().includes(tok))) inds.add(t)
      }
    }
    for (const ind of inds)
      out.push({ type: 'industry', id: ind, name: ind, sub: 'Industry — explore opportunities', to: `/explore?industry=${encodeURIComponent(ind)}` })
    return out.slice(0, 12)
  }, [q, companies, investors])

  if (!open) return null

  const counts = {
    startups: results.filter((r) => r.type === 'startup').length,
    investors: results.filter((r) => r.type === 'investor').length,
    industries: results.filter((r) => r.type === 'industry').length,
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="search-overlay"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 14, scale: 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 14, scale: 0.99 }}
          transition={{ duration: 0.18 }}
          className="glass search-panel"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-label="Global search"
        >
          <div className="search-input-row">
            <Search size={17} color="var(--text-2)" />
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => { setQ(e.target.value); setSel(0) }}
              placeholder="Search startups, investors, industries…"
              aria-label="Search query"
            />
            <button className="icon-btn" onClick={onClose} aria-label="Close search"><X size={16} /></button>
          </div>

          {q.trim() && (
            <div className="search-counts">
              <span><b>{counts.startups}</b> startups</span>
              <span><b>{counts.investors}</b> investors & firms</span>
              <span><b>{counts.industries}</b> industries</span>
            </div>
          )}

          <div className="search-results">
            {results.length === 0 && (
              <div className="empty-state" style={{ padding: '34px 10px' }}>
                <Search size={26} />
                <p>No matches for “{q}”. Try “robotics”, “AI”, “seed” or a city.</p>
              </div>
            )}
            {results.map((r, i) => (
              <button
                key={`${r.type}-${r.id}`}
                className={`search-item ${i === sel ? 'selected' : ''}`}
                onMouseEnter={() => setSel(i)}
                onClick={() => { navigate(r.to); onClose() }}
              >
                <span className="si-icon">
                  {r.type === 'startup' ? <Building2 size={15} /> : r.type === 'investor' ? <TrendingUp size={15} /> : <UserRound size={15} />}
                </span>
                <span style={{ flex: 1, textAlign: 'left' }}>
                  <b style={{ fontSize: 13.5 }}>{r.name}</b>
                  <span style={{ display: 'block', fontSize: 12, color: 'var(--text-2)' }}>{r.sub}</span>
                </span>
                {i === sel && <CornerDownLeft size={13} color="var(--text-3)" />}
              </button>
            ))}
          </div>

          <div className="search-foot">
            <kbd>↑↓</kbd> navigate · <kbd>↵</kbd> open · <kbd>esc</kbd> close
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
