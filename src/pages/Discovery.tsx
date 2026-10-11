import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { SlidersHorizontal, X } from 'lucide-react'
import { StartupCard } from '../components/cards/platform-cards'
import { useApp } from '../state/AppContext'
import { computeMatch } from '../data/match'
import { INDUSTRIES, LOCATIONS, STAGES } from '../data/seed'
import { inr } from '../data/format'
import type { Stage } from '../data/types'

type SortKey = 'recent' | 'views' | 'traction' | 'target' | 'growth' | 'match'

const RISK = ['Lower', 'Moderate', 'Elevated'] as const
const MODELS = ['B2B', 'B2C', 'B2B2C', 'D2C'] as const

export default function Discovery() {
  const { companies, investors, investorPrefs } = useApp()
  const [params, setParams] = useSearchParams()

  const [q, setQ] = useState(params.get('q') ?? '')
  const [industries, setIndustries] = useState<string[]>(params.get('industry') ? [params.get('industry')!] : [])
  const [locations, setLocations] = useState<string[]>([])
  const [stages, setStages] = useState<Stage[]>([])
  const [risk, setRisk] = useState<string[]>([])
  const [models, setModels] = useState<string[]>([])
  const [minTarget, setMinTarget] = useState(0)
  const [maxTarget, setMaxTarget] = useState(1000000000)
  const [minTicket, setMinTicket] = useState(0)
  const [minGrowth, setMinGrowth] = useState(0)
  const [minTeam, setMinTeam] = useState(0)
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [sort, setSort] = useState<SortKey>('match')
  const [panelOpen, setPanelOpen] = useState(false)

  const demoInvestor = investors.find((i) => i.id === 'apex-ventures')!

  const results = useMemo(() => {
    const query = q.trim().toLowerCase()
    let list = companies.filter((c) => {
      if (query) {
        const hay = `${c.name} ${c.tagline} ${c.description} ${c.industry} ${c.sectorTags.join(' ')} ${c.location}`.toLowerCase()
        if (!hay.includes(query)) return false
      }
      if (industries.length && !industries.some((i) => c.industry.toLowerCase().includes(i.toLowerCase()) || c.sectorTags.some((t) => t.toLowerCase().includes(i.toLowerCase())))) return false
      if (locations.length && !locations.some((l) => c.location.toLowerCase().includes(l.toLowerCase()))) return false
      if (stages.length && !stages.includes(c.stage)) return false
      if (risk.length && !risk.includes(c.riskCategory)) return false
      if (models.length && !models.includes(c.audience)) return false
      if (c.fundingTarget < minTarget || c.fundingTarget > maxTarget) return false
      if (c.minInvestment < minTicket) return false
      if (minGrowth && c.revenueGrowth < minGrowth) return false
      if (minTeam && c.teamSize < minTeam) return false
      if (verifiedOnly && c.verification === 'none') return false
      return true
    })

    const score = (id: string) => computeMatch(companies.find((c) => c.id === id)!, demoInvestor, investorPrefs).score
    switch (sort) {
      case 'recent': list = [...list].sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt)); break
      case 'views': list = [...list].sort((a, b) => b.views - a.views); break
      case 'traction': list = [...list].sort((a, b) => b.interestedCount - a.interestedCount); break
      case 'target': list = [...list].sort((a, b) => b.fundingTarget - a.fundingTarget); break
      case 'growth': list = [...list].sort((a, b) => b.revenueGrowth - a.revenueGrowth); break
      case 'match': list = [...list].sort((a, b) => score(b.id) - score(a.id)); break
    }
    return list
  }, [companies, q, industries, locations, stages, risk, models, minTarget, maxTarget, minTicket, minGrowth, minTeam, verifiedOnly, sort, demoInvestor, investorPrefs])

  const activeCount = industries.length + locations.length + stages.length + risk.length + models.length + (minTarget ? 1 : 0) + (minTicket ? 1 : 0) + (minGrowth ? 1 : 0) + (minTeam ? 1 : 0) + (verifiedOnly ? 1 : 0)

  function clearAll() {
    setIndustries([]); setLocations([]); setStages([]); setRisk([]); setModels([])
    setMinTarget(0); setMaxTarget(1000000000); setMinTicket(0); setMinGrowth(0); setMinTeam(0); setVerifiedOnly(false)
    setParams({})
  }

  const chip = (on: boolean) => `chip ${on ? 'on' : ''}`

  const filterPanel = (
    <div className="filter-panel">
      <Group label="Industry">
        <div className="chip-grid">
          {INDUSTRIES.map((i) => (
            <button key={i} className={chip(industries.includes(i))} onClick={() => setIndustries(industries.includes(i) ? industries.filter((x) => x !== i) : [...industries, i])}>{i}</button>
          ))}
        </div>
      </Group>
      <Group label="Location">
        <div className="chip-grid">
          {LOCATIONS.map((l) => (
            <button key={l} className={chip(locations.includes(l))} onClick={() => setLocations(locations.includes(l) ? locations.filter((x) => x !== l) : [...locations, l])}>{l}</button>
          ))}
        </div>
      </Group>
      <Group label="Stage">
        <div className="chip-grid">
          {STAGES.map((s) => (
            <button key={s} className={chip(stages.includes(s))} onClick={() => setStages(stages.includes(s) ? stages.filter((x) => x !== s) : [...stages, s])}>{s}</button>
          ))}
        </div>
      </Group>
      <Group label="Funding target (₹)">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <label className="field"><span>Min</span><input type="number" value={minTarget || ''} placeholder="0" onChange={(e) => setMinTarget(Number(e.target.value))} /></label>
          <label className="field"><span>Max</span><input type="number" value={maxTarget === 1000000000 ? '' : maxTarget} placeholder="10 Cr" onChange={(e) => setMaxTarget(Number(e.target.value) || 1000000000)} /></label>
        </div>
      </Group>
      <Group label="Minimum investment ≥">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[250000, 1000000, 5000000, 25000000].map((v) => (
            <button key={v} className={chip(minTicket === v)} onClick={() => setMinTicket(minTicket === v ? 0 : v)}>{inr(v)}</button>
          ))}
        </div>
      </Group>
      <Group label="Revenue growth ≥">
        <div className="chip-grid">
          {[5, 10, 15, 20].map((v) => (
            <button key={v} className={chip(minGrowth === v)} onClick={() => setMinGrowth(minGrowth === v ? 0 : v)}>{v}% m/m</button>
          ))}
        </div>
      </Group>
      <Group label="Team size ≥">
        <div className="chip-grid">
          {[5, 10, 20].map((v) => (
            <button key={v} className={chip(minTeam === v)} onClick={() => setMinTeam(minTeam === v ? 0 : v)}>{v}+ people</button>
          ))}
        </div>
      </Group>
      <Group label="Business model">
        <div className="chip-grid">
          {MODELS.map((m) => (
            <button key={m} className={chip(models.includes(m))} onClick={() => setModels(models.includes(m) ? models.filter((x) => x !== m) : [...models, m])}>{m}</button>
          ))}
        </div>
      </Group>
      <Group label="Risk category (founder-declared)">
        <div className="chip-grid">
          {RISK.map((r) => (
            <button key={r} className={chip(risk.includes(r))} onClick={() => setRisk(risk.includes(r) ? risk.filter((x) => x !== r) : [...risk, r])}>{r}</button>
          ))}
        </div>
      </Group>
      <Group label="Verification">
        <button className={chip(verifiedOnly)} onClick={() => setVerifiedOnly(!verifiedOnly)}>Verified companies only</button>
      </Group>
      <button className="btn btn-ghost btn-sm" style={{ width: '100%' }} onClick={clearAll}>Clear all filters</button>
    </div>
  )

  return (
    <div className="page-pad">
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 18, flexWrap: 'wrap', marginBottom: 26 }}>
          <div>
            <div className="eyebrow">Discovery</div>
            <h1 className="page-title">Explore Startup Opportunities</h1>
            <p className="page-sub">
              Founder-published opportunities with transparent, structured data. {results.length} of {companies.length} shown.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search companies, sectors…" style={{ width: 250 }} aria-label="Search opportunities" />
            <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} style={{ width: 200 }} aria-label="Sort results">
              <option value="match">Sort: AI Match score</option>
              <option value="recent">Sort: Recently added</option>
              <option value="views">Sort: Most viewed</option>
              <option value="traction">Sort: Highest traction</option>
              <option value="target">Sort: Funding target</option>
              <option value="growth">Sort: Revenue growth</option>
            </select>
            <button className="btn btn-ghost" onClick={() => setPanelOpen(!panelOpen)}>
              <SlidersHorizontal size={15} /> Filters {activeCount > 0 && <span className="badge badge-blue">{activeCount}</span>}
            </button>
          </div>
        </div>

        <div className="discovery-layout">
          <aside className={`discovery-side ${panelOpen ? 'open' : ''}`}>{filterPanel}</aside>
          <div className="discovery-main">
            {results.length === 0 ? (
              <div className="empty-state glass">
                <X size={30} />
                <h3>No opportunities match these filters</h3>
                <p>Try widening the funding range or clearing a category.</p>
                <button className="btn btn-ghost" onClick={clearAll}>Clear all filters</button>
              </div>
            ) : (
              <motion.div layout className="cards-col">
                {results.map((c, i) => (
                  <StartupCard key={c.id} company={c} delay={Math.min(i * 0.05, 0.3)} showMatch />
                ))}
              </motion.div>
            )}
            <p className="demo-tag" style={{ marginTop: 22 }}>
              Demo catalogue · figures are founder-supplied sample data
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="filter-group">
      <div className="filter-label">{label}</div>
      {children}
    </div>
  )
}
