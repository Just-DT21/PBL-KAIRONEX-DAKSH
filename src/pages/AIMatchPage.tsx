import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, Wand2, RefreshCw } from 'lucide-react'
import { useApp } from '../state/AppContext'
import { computeMatch } from '../data/match'
import { inrRange } from '../data/format'
import { StartupCard } from '../components/cards/platform-cards'
import MatchExplainer from '../components/cards/MatchExplainer'
import { INDUSTRIES, STAGES } from '../data/seed'
import type { Stage } from '../data/types'

const DEMO_INVESTOR_ID = 'apex-ventures'

export default function AIMatchPage() {
  const { companies, investors, investorPrefs, setInvestorPrefs } = useApp()
  const navigate = useNavigate()
  const demoInvestor = investors.find((i) => i.id === DEMO_INVESTOR_ID)!

  const [query, setQuery] = useState(investorPrefs.rawQuery ?? '')
  const [range, setRange] = useState(investorPrefs.range ?? { min: 2000000, max: 5000000 })
  const [inds, setInds] = useState<string[]>(investorPrefs.industries)
  const [stages, setStages] = useState<Stage[]>(investorPrefs.stages)
  const [geo, setGeo] = useState<string[]>(investorPrefs.geography)
  const [topId, setTopId] = useState<string | null>(null)

  const ranked = useMemo(() => {
    const prefs = { ...investorPrefs, range, industries: inds, stages, geography: geo, rawQuery: query }
    const scored = companies
      .map((c) => ({ c, m: computeMatch(c, demoInvestor, prefs) }))
      .sort((a, b) => b.m.score - a.m.score)
    return scored
  }, [companies, demoInvestor, investorPrefs, range, inds, stages, geo, query])

  const top = ranked.find((r) => r.c.id === topId) ?? ranked[0]

  function apply() {
    setInvestorPrefs({ rawQuery: query, range, industries: inds, stages, geography: geo, audience: investorPrefs.audience, riskAppetite: investorPrefs.riskAppetite })
  }

  const chip = (on: boolean) => `chip ${on ? 'on' : ''}`

  return (
    <div className="page-pad">
      <div className="container">
        <div className="center section-head" style={{ margin: '0 auto 34px' }}>
          <div className="eyebrow"><Sparkles size={12} /> KAIRONEXA MATCH · AI-powered opportunity discovery</div>
          <h1 className="page-title">
            Find opportunities aligned with <span className="grad-text">your preferences.</span>
          </h1>
          <p className="page-sub">
            KAIRONEXA MATCH ranks published opportunities against your stated preferences and shows exactly why each one scored
            the way it did. A discovery and research tool — never investment advice.
          </p>
        </div>

        <div className="aimatch-layout">
          {/* Preferences console */}
          <div className="glass" style={{ padding: 22, display: 'grid', gap: 16, alignContent: 'start' }}>
            <label className="field">
              <span>Your investment statement</span>
              <textarea
                rows={3}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="I want to invest ₹20L–₹50L into early-stage robotics or AI startups in India."
              />
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <label className="field"><span>Min ticket (₹)</span><input type="number" value={range.min} onChange={(e) => setRange({ ...range, min: Number(e.target.value) })} /></label>
              <label className="field"><span>Max ticket (₹)</span><input type="number" value={range.max} onChange={(e) => setRange({ ...range, max: Number(e.target.value) })} /></label>
            </div>

            <div>
              <div className="filter-label">Industries</div>
              <div className="chip-grid">
                {INDUSTRIES.map((i) => (
                  <button key={i} className={chip(inds.includes(i))} onClick={() => setInds(inds.includes(i) ? inds.filter((x) => x !== i) : [...inds, i])}>{i}</button>
                ))}
              </div>
            </div>

            <div>
              <div className="filter-label">Stages</div>
              <div className="chip-grid">
                {STAGES.map((s) => (
                  <button key={s} className={chip(stages.includes(s))} onClick={() => setStages(stages.includes(s) ? stages.filter((x) => x !== s) : [...stages, s])}>{s}</button>
                ))}
              </div>
            </div>

            <div>
              <div className="filter-label">Geography</div>
              <div className="chip-grid">
                {['India', 'Bengaluru', 'Mumbai', 'Delhi NCR', 'Singapore', 'US'].map((g) => (
                  <button key={g} className={chip(geo.includes(g))} onClick={() => setGeo(geo.includes(g) ? geo.filter((x) => x !== g) : [...geo, g])}>{g}</button>
                ))}
              </div>
            </div>

            <button className="btn btn-primary" onClick={apply}>
              <Wand2 size={15} /> Update AI Match preferences
            </button>
            <p className="text-2" style={{ fontSize: 11.5 }}>
              Preferences refine discovery only. KAIRONEXA does not evaluate investment merit, and no result implies
              approval, safety or likely returns.
            </p>
          </div>

          {/* Ranked results */}
          <div style={{ display: 'grid', gap: 18, alignContent: 'start' }}>
            <div className="glass" style={{ padding: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <b style={{ fontFamily: 'var(--font-display)' }}>Top matches</b>
                <span className="demo-tag">Ranked live from stated preferences</span>
              </div>
              <div style={{ display: 'grid', gap: 10 }}>
                {ranked.slice(0, 5).map((r, i) => (
                  <button
                    key={r.c.id}
                    className={`aimatch-row ${top?.c.id === r.c.id ? 'sel' : ''}`}
                    onClick={() => setTopId(r.c.id)}
                  >
                    <span className="aimatch-rank">{i + 1}</span>
                    <span style={{ flex: 1, textAlign: 'left', minWidth: 0 }}>
                      <b style={{ fontSize: 13.5 }}>{r.c.name}</b>
                      <span style={{ display: 'block', fontSize: 12, color: 'var(--text-2)' }}>
                        {r.c.stage} · {r.c.industry} · seeking {inrRange(r.c.minInvestment, r.c.fundingTarget)}
                      </span>
                    </span>
                    <span className="match-pill">{r.m.score}%</span>
                  </button>
                ))}
              </div>
              {top && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: 16 }}>
                  <MatchExplainer match={top.m} />
                </motion.div>
              )}
            </div>

            {ranked.slice(0, 4).map((r, i) => (
              <div key={r.c.id}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span className="match-pill">AI Match: {r.m.score}%</span>
                  <span className="text-2" style={{ fontSize: 12 }}>{r.m.summary}</span>
                </div>
                <StartupCard company={r.c} delay={i * 0.05} />
              </div>
            ))}

            <button className="btn btn-ghost" onClick={() => navigate('/explore')}>
              <RefreshCw size={14} /> Open full discovery feed with these filters
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
