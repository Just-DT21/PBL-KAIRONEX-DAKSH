import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles } from 'lucide-react'
import { useApp } from '../../state/AppContext'
import { computeMatch } from '../../data/match'
import MatchExplainer from '../cards/MatchExplainer'
import StartupCard from '../cards/StartupCard'

const DEMO_INVESTOR_ID = 'apex-ventures'

export default function InvAIMatch({ prefsOnly = false }: { prefsOnly?: boolean }) {
  const { companies, investors, investorPrefs } = useApp()
  const demoInvestor = investors.find((i) => i.id === DEMO_INVESTOR_ID)!

  const ranked = companies
    .map((c) => ({ c, m: computeMatch(c, demoInvestor, investorPrefs) }))
    .sort((a, b) => b.m.score - a.m.score)

  const top = ranked[0]

  return (
    <div className="dash-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h1 className="dash-title">{prefsOnly ? 'Investment Preferences' : 'AI Match'}</h1>
          <p className="text-2" style={{ fontSize: 13.5 }}>
            {investorPrefs.rawQuery ?? 'Your stated preferences, ranked against every published opportunity.'}
          </p>
        </div>
        {!prefsOnly && (
          <Link to="/ai-match" className="btn btn-primary btn-sm">
            <Sparkles size={13} /> Open full AI Match
          </Link>
        )}
      </div>

      {top && (
        <div className="dash-grid2" style={{ marginTop: 20 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <span className="match-pill">AI Match: {top.m.score}%</span>
              <span className="text-2" style={{ fontSize: 12.5 }}>strongest current overlap</span>
            </div>
            <StartupCard company={top.c} />
          </div>
          <MatchExplainer match={top.m} />
        </div>
      )}

      <div style={{ display: 'grid', gap: 16, marginTop: 20 }}>
        {ranked.slice(1, 5).map(({ c, m }, i) => (
          <div key={c.id}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span className="match-pill">{m.score}%</span>
              <span className="text-2" style={{ fontSize: 12.5 }}>{m.summary}</span>
            </div>
            <StartupCard company={c} delay={i * 0.04} />
          </div>
        ))}
      </div>

      <Link to="/explore" className="btn btn-ghost" style={{ marginTop: 20 }}>
        Browse everything in Discovery <ArrowRight size={14} />
      </Link>
    </div>
  )
}
