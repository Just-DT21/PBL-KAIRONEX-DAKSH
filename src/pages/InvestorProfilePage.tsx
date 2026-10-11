import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, TrendingUp, Users, MapPin, Gauge } from 'lucide-react'
import { useApp } from '../state/AppContext'
import { inrRange } from '../data/format'
import { LogoAvatar, VerificationBadge } from '../components/ui/primitives'
import ConnectButton from '../components/cards/ConnectButton'
import NotFound from './NotFound'

const DEMO_COMPANY_ID = 'nova-robotics'

export default function InvestorProfilePage() {
  const { id } = useParams()
  const { getInvestor } = useApp()
  const inv = getInvestor(id ?? '')

  if (!inv) return <NotFound />

  return (
    <div className="page-pad">
      <div className="container" style={{ maxWidth: 880 }}>
        <Link to="/investors" className="linklike" style={{ display: 'inline-flex', gap: 6, alignItems: 'center', marginBottom: 18 }}>
          <ArrowLeft size={14} /> All investors
        </Link>

        <div className="glass" style={{ padding: 28, display: 'flex', gap: 22, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <LogoAvatar name={inv.firm} hue={inv.hue} size={74} />
          <div style={{ flex: 1, minWidth: 260 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: 'clamp(24px, 3vw, 32px)' }}>{inv.firm}</h1>
              <VerificationBadge level={inv.verification} />
            </div>
            <div className="sc-meta" style={{ marginTop: 6 }}>
              <span>{inv.type}</span><span aria-hidden>·</span><span>{inv.person}</span>
            </div>
            <p style={{ color: 'var(--text-1)', fontSize: 14.5, marginTop: 12 }}>{inv.about}</p>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 14 }}>
              {inv.industries.map((i) => <span key={i} className="badge badge-blue">{i}</span>)}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 220 }}>
            <div className="glass" style={{ padding: 16, borderRadius: 14 }}>
              <div style={{ fontSize: 11.5, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>Typical investment</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, marginTop: 2 }}>{inrRange(inv.investmentRange.min, inv.investmentRange.max)}</div>
            </div>
            <ConnectButton companyId={DEMO_COMPANY_ID} investorId={inv.id} />
          </div>
        </div>

        <div className="profile-grid" style={{ marginTop: 20 }}>
          <div className="glass profile-section">
            <div className="profile-section-head"><TrendingUp size={15} /><h3>Investment thesis</h3></div>
            <p>{inv.thesis}</p>
          </div>

          <div className="glass profile-section">
            <div className="profile-section-head"><Gauge size={15} /><h3>Preferences</h3></div>
            <div style={{ display: 'grid', gap: 10 }}>
              <div className="traction-row"><span className="text-2">Investment range</span><b>{inrRange(inv.investmentRange.min, inv.investmentRange.max)}</b></div>
              <div className="traction-row"><span className="text-2">Preferred stages</span><b>{inv.stages.join(', ')}</b></div>
              <div className="traction-row"><span className="text-2">Geography</span><b>{inv.geography.join(', ')}</b></div>
              <div className="traction-row"><span className="text-2">Business models</span><b>{inv.businessModels.join(', ')}</b></div>
            </div>
          </div>

          <div className="glass profile-section">
            <div className="profile-section-head"><Users size={15} /><h3>Portfolio</h3></div>
            <div style={{ display: 'grid', gap: 10 }}>
              {inv.portfolio.map((p) => (
                <div key={p.name} className="traction-row">
                  <span><b style={{ color: 'var(--text-hi)' }}>{p.name}</b> <span className="text-2">· {p.sector}{p.note ? ` · ${p.note}` : ''}</span></span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass profile-section">
            <div className="profile-section-head"><MapPin size={15} /><h3>Previous investments</h3></div>
            <div style={{ display: 'grid', gap: 10 }}>
              {inv.previousInvestments.map((p) => (
                <div key={p.name} className="traction-row">
                  <span className="text-2">{p.name} · {p.round}</span><b>{p.year}</b>
                </div>
              ))}
            </div>
          </div>

          <div className="glass profile-section">
            <div className="profile-section-head"><TrendingUp size={15} /><h3>Current interests</h3></div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {inv.currentInterests.map((i) => <span key={i} className="badge badge-violet">{i}</span>)}
            </div>
          </div>

          <div className="glass profile-section">
            <div className="profile-section-head"><Users size={15} /><h3>Founder preferences</h3></div>
            <ul style={{ paddingLeft: 18, display: 'grid', gap: 6, fontSize: 13.5, color: 'var(--text-1)' }}>
              {inv.founderPreferences.map((p) => <li key={p}>{p}</li>)}
            </ul>
          </div>
        </div>

        <div className="disclaimer-box" style={{ marginTop: 22 }}>
          Listed preferences are self-reported by the investor. A connection request does not guarantee interest, and
          interest does not constitute an offer to invest.
        </div>
      </div>
    </div>
  )
}
