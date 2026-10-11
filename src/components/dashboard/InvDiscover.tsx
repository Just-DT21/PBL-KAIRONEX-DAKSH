import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import { useApp } from '../../state/AppContext'
import { computeMatch } from '../../data/match'
import StartupCard from '../cards/StartupCard'
import { INDUSTRIES, STAGES } from '../../data/seed'
import type { Stage } from '../../data/types'

const DEMO_INVESTOR_ID = 'apex-ventures'

export default function InvDiscover() {
  const { companies, investors, investorPrefs } = useApp()
  const [q, setQ] = useState('')
  const [stages, setStages] = useState<Stage[]>([])
  const [inds, setInds] = useState<string[]>([])
  const [page, setPage] = useState(0)

  const demoInvestor = investors.find((i) => i.id === DEMO_INVESTOR_ID)!

  const results = useMemo(() => {
    const query = q.trim().toLowerCase()
    return companies
      .filter((c) => {
        if (query && !`${c.name} ${c.tagline} ${c.industry} ${c.sectorTags.join(' ')}`.toLowerCase().includes(query)) return false
        if (stages.length && !stages.includes(c.stage)) return false
        if (inds.length && !inds.some((i) => c.industry.toLowerCase().includes(i.toLowerCase()) || c.sectorTags.some((t) => t.toLowerCase().includes(i.toLowerCase())))) return false
        return true
      })
      .sort((a, b) => computeMatch(b, demoInvestor, investorPrefs).score - computeMatch(a, demoInvestor, investorPrefs).score)
  }, [companies, q, stages, inds, demoInvestor, investorPrefs])

  const perPage = 4
  const pages = Math.ceil(results.length / perPage)
  const pageItems = results.slice(page * perPage, page * perPage + perPage)

  const chip = (on: boolean) => `chip ${on ? 'on' : ''}`

  return (
    <div className="dash-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h1 className="dash-title">Discover</h1>
          <p className="text-2" style={{ fontSize: 13.5 }}>
            Founder-published opportunities ranked by overlap with your preferences.
          </p>
        </div>
        <Link to="/ai-match" className="btn btn-ghost btn-sm"><SparkleIcon /> Refine in AI Match</Link>
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: 18, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-3)' }} />
          <input value={q} onChange={(e) => { setQ(e.target.value); setPage(0) }} placeholder="Search companies, sectors…" style={{ paddingLeft: 36 }} aria-label="Search opportunities" />
        </div>
      </div>

      <div className="glass" style={{ padding: 16, marginTop: 14 }}>
        <div style={{ display: 'grid', gap: 12 }}>
          <div>
            <div className="filter-label">Stage</div>
            <div className="chip-grid">
              {STAGES.map((s) => (
                <button key={s} className={chip(stages.includes(s))} onClick={() => setStages(stages.includes(s) ? stages.filter((x) => x !== s) : [...stages, s])}>{s}</button>
              ))}
            </div>
          </div>
          <div>
            <div className="filter-label">Industry</div>
            <div className="chip-grid">
              {INDUSTRIES.slice(0, 10).map((i) => (
                <button key={i} className={chip(inds.includes(i))} onClick={() => setInds(inds.includes(i) ? inds.filter((x) => x !== i) : [...inds, i])}>{i}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop grid / mobile swipe deck */}
      <div className="inv-discover-desktop">
        <div style={{ display: 'grid', gap: 16, marginTop: 18 }}>
          {pageItems.map((c, i) => (
            <StartupCard key={c.id} company={c} delay={i * 0.05} showMatch />
          ))}
        </div>
        {pages > 1 && (
          <Pager page={page} pages={pages} setPage={setPage} />
        )}
      </div>

      <div className="inv-discover-mobile">
        <SwipeDeck items={results.slice(0, 8)} />
        <Link to="/explore" className="btn btn-ghost" style={{ width: '100%', marginTop: 14 }}>
          See all {results.length} opportunities <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  )
}

function Pager({ page, pages, setPage }: { page: number; pages: number; setPage: (p: number) => void }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 20, alignItems: 'center' }}>
      <button className="btn btn-ghost btn-sm" disabled={page === 0} onClick={() => setPage(page - 1)}><ChevronLeft size={14} /> Prev</button>
      <span className="text-2" style={{ fontSize: 12.5 }}>{page + 1} / {pages}</span>
      <button className="btn btn-ghost btn-sm" disabled={page >= pages - 1} onClick={() => setPage(page + 1)}>Next <ChevronRight size={14} /></button>
    </div>
  )
}

function SwipeDeck({ items }: { items: ReturnType<typeof useApp>['companies'] }) {
  const [idx, setIdx] = useState(0)
  if (items.length === 0) return null
  const card = items[Math.min(idx, items.length - 1)]

  return (
    <div style={{ marginTop: 18 }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={card.id}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.6}
          onDragEnd={(_, info) => {
            if (info.offset.x < -70 && idx < items.length - 1) setIdx(idx + 1)
            else if (info.offset.x > 70 && idx > 0) setIdx(idx - 1)
          }}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, x: -60 }}
          transition={{ duration: 0.25 }}
        >
          <StartupCard company={card} showMatch />
        </motion.div>
      </AnimatePresence>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 12, alignItems: 'center' }}>
        <button className="btn btn-ghost btn-sm" disabled={idx === 0} onClick={() => setIdx(idx - 1)}><ChevronLeft size={14} /></button>
        <span className="text-2" style={{ fontSize: 12 }}>{Math.min(idx + 1, items.length)} / {items.length} · swipe or tap</span>
        <button className="btn btn-ghost btn-sm" disabled={idx >= items.length - 1} onClick={() => setIdx(idx + 1)}><ChevronRight size={14} /></button>
      </div>
    </div>
  )
}

function SparkleIcon() {
  return <SparklesSmall />
}

function SparklesSmall() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" style={{ verticalAlign: '-2px', marginRight: 4 }}>
      <path d="M12 2l1.9 6.1L20 10l-6.1 1.9L12 18l-1.9-6.1L4 10l6.1-1.9L12 2z" />
    </svg>
  )
}
