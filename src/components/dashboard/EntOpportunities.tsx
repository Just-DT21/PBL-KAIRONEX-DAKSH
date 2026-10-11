import { Link } from 'react-router-dom'
import { Plus, Pause, Eye } from 'lucide-react'
import { useApp } from '../../state/AppContext'
import { inr } from '../../data/format'
import { Progress } from '../ui/primitives'

const MY_COMPANY_ID = 'nova-robotics'

export default function EntOpportunities() {
  const { companies } = useApp()
  const company = companies.find((c) => c.id === MY_COMPANY_ID)!
  const progress = (company.fundingRaised / company.fundingTarget) * 100

  return (
    <div className="dash-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h1 className="dash-title">My Opportunities</h1>
          <p className="text-2" style={{ fontSize: 13.5 }}>Manage what investors currently see in discovery.</p>
        </div>
        <button className="btn btn-primary"><Plus size={14} /> New opportunity</button>
      </div>

      <div className="glass" style={{ padding: 22, marginTop: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <div>
            <b style={{ fontFamily: 'var(--font-display)', fontSize: 16 }}>Seed Round — {company.name}</b>
            <div className="text-2" style={{ fontSize: 12.5, marginTop: 3 }}>
              Seeking {inr(company.fundingTarget)} · {company.equityOffered}% equity · min {inr(company.minInvestment)}
            </div>
          </div>
          <span className="badge badge-green">Published</span>
        </div>

        <div style={{ margin: '16px 0 8px' }}>
          <Progress value={progress} />
        </div>
        <div className="text-2" style={{ fontSize: 12.5 }}>
          {inr(company.fundingRaised)} committed of {inr(company.fundingTarget)} · figures founder-supplied
        </div>

        <div className="dash-stats" style={{ marginTop: 18, gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
          <div className="glass" style={{ padding: 14 }}>
            <div className="text-2" style={{ fontSize: 11.5, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Views</div>
            <b style={{ fontFamily: 'var(--font-display)', fontSize: 20 }}>{company.views.toLocaleString('en-IN')}</b>
          </div>
          <div className="glass" style={{ padding: 14 }}>
            <div className="text-2" style={{ fontSize: 11.5, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Interested</div>
            <b style={{ fontFamily: 'var(--font-display)', fontSize: 20 }}>{company.interestedCount}</b>
          </div>
          <div className="glass" style={{ padding: 14 }}>
            <div className="text-2" style={{ fontSize: 11.5, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Saves</div>
            <b style={{ fontFamily: 'var(--font-display)', fontSize: 20 }}>142</b>
          </div>
          <div className="glass" style={{ padding: 14 }}>
            <div className="text-2" style={{ fontSize: 11.5, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Connections</div>
            <b style={{ fontFamily: 'var(--font-display)', fontSize: 20 }}>4</b>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 18, flexWrap: 'wrap' }}>
          <button className="btn btn-ghost btn-sm"><Pause size={13} /> Pause</button>
          <Link to={`/startups/${company.id}`} className="btn btn-ghost btn-sm"><Eye size={13} /> Preview</Link>
        </div>
      </div>

      <div className="disclaimer-box" style={{ marginTop: 18 }}>
        Publishing an opportunity presents your company for discovery. It is not an offer of securities, and any
        investment agreement is made directly between you and the investor through appropriate legal processes.
      </div>
    </div>
  )
}
