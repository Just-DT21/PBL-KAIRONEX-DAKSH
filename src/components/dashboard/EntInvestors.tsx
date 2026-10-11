import { useState } from 'react'
import { Heart } from 'lucide-react'
import { useApp } from '../../state/AppContext'
import { computeMatch } from '../../data/match'
import InvestorCard from '../cards/InvestorCard'

const MY_COMPANY_ID = 'nova-robotics'

export default function EntInvestors({ matchesOnly = false }: { matchesOnly?: boolean }) {
  const { investors, companies } = useApp()
  const company = companies.find((c) => c.id === MY_COMPANY_ID)!
  const [ind, setInd] = useState<string>('')

  const scored = investors
    .map((i) => ({ inv: i, score: computeMatch(company, i).score }))
    .filter(({ inv }) => {
      if (!matchesOnly && !ind) return true
      if (matchesOnly) return computeMatch(company, inv).score >= 75
      return inv.industries.includes(ind)
    })
    .sort((a, b) => b.score - a.score)

  return (
    <div className="dash-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h1 className="dash-title">{matchesOnly ? 'Matches' : 'Discover Investors'}</h1>
          <p className="text-2" style={{ fontSize: 13.5 }}>
            {matchesOnly
              ? 'Investors whose stated focus overlaps your company profile.'
              : 'Browse the investor marketplace and connect directly.'}
          </p>
        </div>
        {!matchesOnly && (
          <select value={ind} onChange={(e) => setInd(e.target.value)} style={{ width: 210 }} aria-label="Filter by industry">
            <option value="">All industries</option>
            {['AI', 'Robotics', 'SaaS', 'Fintech', 'HealthTech', 'ClimateTech', 'AgriTech', 'Consumer'].map((i) => (
              <option key={i}>{i}</option>
            ))}
          </select>
        )}
      </div>

      {matchesOnly && (
        <div className="disclaimer-box" style={{ marginTop: 16 }}>
          <Heart size={15} />
          Match percentages are discovery scores based on stated preferences and founder-supplied data — not predictions
          of investment success or interest.
        </div>
      )}

      <div className="inv-grid" style={{ marginTop: 20 }}>
        {scored.map(({ inv, score }, i) => (
          <div key={inv.id} style={{ position: 'relative' }}>
            <span className="match-pill" style={{ position: 'absolute', top: 12, right: 12, zIndex: 2 }}>{score}% Match</span>
            <InvestorCard investor={inv} delay={i * 0.05} />
          </div>
        ))}
      </div>
    </div>
  )
}
