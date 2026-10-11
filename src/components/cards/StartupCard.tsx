import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin, Save, ArrowRight } from 'lucide-react'
import type { Company } from '../../data/types'
import { inr } from '../../data/format'
import { computeMatch } from '../../data/match'
import { useApp } from '../../state/AppContext'
import { LogoAvatar, VerificationBadge, MatchPill } from '../ui/primitives'
import ConnectButton from './ConnectButton'

const DEMO_INVESTOR_ID = 'apex-ventures'

function Fact({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="sc-fact">
      <span className="sc-fact-label">{label}</span>
      <span className={strong ? 'sc-fact-value strong' : 'sc-fact-value'}>{value}</span>
    </div>
  )
}

export default function StartupCard({ company, delay = 0, showMatch }: { company: Company; delay?: number; showMatch?: boolean }) {
  const { savedStartups, toggleSaved, investorPrefs, investors } = useApp()
  const navigate = useNavigate()
  const saved = savedStartups.includes(company.id)
  const demoInvestor = investors.find((i) => i.id === DEMO_INVESTOR_ID)!
  const match = computeMatch(company, demoInvestor, investorPrefs)
  const progress = company.fundingTarget ? (company.fundingRaised / company.fundingTarget) * 100 : 0

  return (
    <motion.article
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay, ease: [0.22, 0.7, 0.25, 1] }}
      className="glass card-hover startup-card"
    >
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        <LogoAvatar name={company.name} hue={company.hue} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <Link to={`/startups/${company.id}`} className="sc-name">
              {company.name}
            </Link>
            <VerificationBadge level={company.verification} size="xs" />
            {showMatch && <MatchPill score={match.score} />}
          </div>
          <div className="sc-meta">
            <span>{company.industry}</span>
            <span aria-hidden>·</span>
            <span>
              <MapPin size={11} style={{ verticalAlign: '-1px', marginRight: 3 }} />
              {company.location}
            </span>
            <span aria-hidden>·</span>
            <span>{company.stage}</span>
          </div>
          <p className="sc-pitch">
            {company.tagline}. {company.description}
          </p>
        </div>
      </div>

      <div className="sc-facts">
        <Fact label="Seeking" value={inr(company.fundingTarget)} strong />
        <Fact label="Raised" value={inr(company.fundingRaised)} />
        <Fact label="Valuation" value={inr(company.valuation)} />
        <Fact label="Revenue" value={company.revenue ? `${inr(company.revenue)} ARR` : 'Pre-revenue'} />
        <Fact label="Growth" value={company.revenueGrowth ? `+${company.revenueGrowth}% m/m` : '—'} />
        <Fact label="Min. invest" value={inr(company.minInvestment)} />
        <Fact label="Team" value={`${company.teamSize}`} />
      </div>

      <div className="sc-progress">
        <div className="sc-progress-head">
          <span>{Math.round(progress)}% of target</span>
          <span className="text-2">founder-supplied figures</span>
        </div>
        <div className="bar">
          <motion.span
            initial={{ width: 0 }}
            whileInView={{ width: `${Math.min(progress, 100)}%` }}
            viewport={{ once: true }}
            transition={{ duration: 1.1, ease: [0.22, 0.7, 0.25, 1] }}
          />
        </div>
      </div>

      <div className="sc-actions">
        <button className="btn btn-primary btn-sm" onClick={() => navigate(`/startups/${company.id}`)}>
          View Startup <ArrowRight size={13} />
        </button>
        <button className="btn btn-ghost btn-sm" onClick={() => toggleSaved(company.id)} aria-pressed={saved}>
          <Save size={13} /> {saved ? 'Saved' : 'Save'}
        </button>
        <ConnectButton companyId={company.id} compact />
      </div>
    </motion.article>
  )
}
