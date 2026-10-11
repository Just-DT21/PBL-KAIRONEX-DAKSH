import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Save, ArrowRight } from 'lucide-react'
import type { Investor } from '../../data/types'
import { inrRange } from '../../data/format'
import { useApp } from '../../state/AppContext'
import { LogoAvatar, VerificationBadge } from '../ui/primitives'
import ConnectButton from './ConnectButton'

const DEMO_COMPANY_ID = 'nova-robotics'

export default function InvestorCard({ investor, delay = 0, showMatch }: { investor: Investor; delay?: number; showMatch?: boolean }) {
  const { savedInvestors, toggleSavedInvestor, connections } = useApp()
  const navigate = useNavigate()
  const saved = savedInvestors.includes(investor.id)
  const conn = connections.find((c) => c.companyId === DEMO_COMPANY_ID && c.investorId === investor.id)

  return (
    <motion.article
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay, ease: [0.22, 0.7, 0.25, 1] }}
      className="glass card-hover"
      style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 14 }}
    >
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        <LogoAvatar name={investor.firm} hue={investor.hue} size={48} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <Link to={`/investors/${investor.id}`} style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16.5 }}>
              {investor.firm}
            </Link>
            <VerificationBadge level={investor.verification} size="xs" />
            {showMatch && <MatchPillInline score={investorMatchScore(investor.id)} />}
          </div>
          <div className="sc-meta">
            <span>{investor.type}</span>
            <span aria-hidden>·</span>
            <span>{investor.person}</span>
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 4 }}>{investor.thesis}</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {investor.industries.slice(0, 5).map((ind) => (
          <span key={ind} className="badge badge-blue">
            {ind}
          </span>
        ))}
        {investor.stages.length > 0 && (
          <span className="badge badge-violet">
            {investor.stages[0]}
            {investor.stages.length > 1 ? ` +${investor.stages.length - 1}` : ''}
          </span>
        )}
      </div>

      <div className="sc-facts">
        <div className="sc-fact">
          <span className="sc-fact-label">Typical investment</span>
          <span className="sc-fact-value strong">{inrRange(investor.investmentRange.min, investor.investmentRange.max)}</span>
        </div>
        <div className="sc-fact">
          <span className="sc-fact-label">Geography</span>
          <span className="sc-fact-value">{investor.geography.join(', ')}</span>
        </div>
        <div className="sc-fact">
          <span className="sc-fact-label">Deals closed</span>
          <span className="sc-fact-value">{investor.dealsClosed}</span>
        </div>
        <div className="sc-fact">
          <span className="sc-fact-label">Portfolio</span>
          <span className="sc-fact-value">{investor.portfolio.length} ventures</span>
        </div>
      </div>

      <div className="sc-actions">
        <button className="btn btn-primary btn-sm" onClick={() => navigate(`/investors/${investor.id}`)}>
          View Profile <ArrowRight size={13} />
        </button>
        <button className="btn btn-ghost btn-sm" onClick={() => toggleSavedInvestor(investor.id)} aria-pressed={saved}>
          <Save size={13} /> {saved ? 'Saved' : 'Save'}
        </button>
        {conn?.status === 'accepted' ? (
          <Link className="btn btn-ghost btn-sm" to="/messages">
            Open chat
          </Link>
        ) : (
          <ConnectButton companyId={DEMO_COMPANY_ID} investorId={investor.id} compact />
        )}
      </div>
    </motion.article>
  )
}

function MatchPillInline({ score }: { score: number }) {
  return (
    <span className="match-pill">
      ✦ {score}% Match
    </span>
  )
}

function investorMatchScore(investorId: string): number {
  // Deterministic demo score derived from id length; real backend would compute this.
  const base = 72 + (investorId.length * 3) % 26
  return Math.min(base, 96)
}
