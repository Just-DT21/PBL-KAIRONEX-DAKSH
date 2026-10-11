import { useMemo, useState } from 'react'
import { InvestorCard } from '../components/cards/platform-cards'
import { useApp } from '../state/AppContext'
import { INDUSTRIES, INVESTOR_TYPES, STAGES } from '../data/seed'

export default function InvestorsPage() {
  const { investors } = useApp()
  const [types, setTypes] = useState<string[]>([])
  const [industries, setIndustries] = useState<string[]>([])
  const [stages, setStages] = useState<string[]>([])

  const results = useMemo(() => {
    return investors.filter((i) => {
      if (types.length && !types.includes(i.type)) return false
      if (industries.length && !i.industries.some((x) => industries.includes(x))) return false
      if (stages.length && !i.stages.some((s) => stages.includes(s))) return false
      return true
    })
  }, [investors, types, industries, stages])

  const chip = (on: boolean) => `chip ${on ? 'on' : ''}`
  const tgl = (arr: string[], v: string, set: (a: string[]) => void) =>
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v])

  return (
    <div className="page-pad">
      <div className="container">
        <div className="center section-head" style={{ margin: '0 auto 30px' }}>
          <div className="eyebrow">Capital, catalogued</div>
          <h1 className="page-title">Discover Investors</h1>
          <p className="page-sub">
            Firms, angels and funds publishing their thesis and preferences. Founders can see who focuses on their
            sector and stage — and connect directly.
          </p>
        </div>

        <div className="glass" style={{ padding: 18, marginBottom: 24 }}>
          <div style={{ display: 'grid', gap: 14 }}>
            <div>
              <div className="filter-label">Investor type</div>
              <div className="chip-grid">
                {INVESTOR_TYPES.map((t) => (
                  <button key={t} className={chip(types.includes(t))} onClick={() => tgl(types, t, setTypes)}>{t}</button>
                ))}
              </div>
            </div>
            <div>
              <div className="filter-label">Industries</div>
              <div className="chip-grid">
                {INDUSTRIES.map((t) => (
                  <button key={t} className={chip(industries.includes(t))} onClick={() => tgl(industries, t, setIndustries)}>{t}</button>
                ))}
              </div>
            </div>
            <div>
              <div className="filter-label">Stages they back</div>
              <div className="chip-grid">
                {STAGES.map((t) => (
                  <button key={t} className={chip(stages.includes(t))} onClick={() => tgl(stages, t, setStages)}>{t}</button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="inv-grid">
          {results.map((i, idx) => (
            <InvestorCard key={i.id} investor={i} delay={Math.min(idx * 0.05, 0.3)} />
          ))}
        </div>
        {results.length === 0 && (
          <div className="empty-state glass"><p>No investors match these filters yet.</p></div>
        )}
      </div>
    </div>
  )
}
