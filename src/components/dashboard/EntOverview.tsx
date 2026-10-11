import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Eye,
  Users,
  Handshake,
  Gauge,
  TrendingUp,
  Wallet,
  ArrowUpRight,
  ArrowRight,
} from 'lucide-react'
import { useApp } from '../../state/AppContext'
import { inr, timeAgo } from '../../data/format'
import { CountUp, Progress, StatTile, LogoAvatar } from '../ui/primitives'
import { AreaChart, BarChart, Donut } from './charts'
import InvestorCard from '../cards/InvestorCard'

const MY_COMPANY_ID = 'nova-robotics'

export default function EntOverview({ analytics = false }: { analytics?: boolean }) {
  const { companies, investors, connections, conversations } = useApp()
  const company = companies.find((c) => c.id === MY_COMPANY_ID)!
  const progress = (company.fundingRaised / company.fundingTarget) * 100
  const myConns = connections.filter((c) => c.companyId === MY_COMPANY_ID)

  const profileComplete = 87
  const viewsSeries = [140, 190, 165, 240, 310, 285, 380, 420, 390, 480, 520, 611]
  const interestSeries = [3, 5, 4, 8, 9, 7, 12, 11, 14, 13, 16, 19]

  return (
    <div className="dash-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h1 className="dash-title">{analytics ? 'Analytics' : 'Overview'}</h1>
          <p className="text-2" style={{ fontSize: 13.5 }}>
            {company.name} · {company.stage} · {company.location}
          </p>
        </div>
        <Link to={`/startups/${company.id}`} className="btn btn-ghost btn-sm">
          View public profile <ArrowUpRight size={13} />
        </Link>
      </div>

      {/* Funding progress */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass funding-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700 }}>
              Funding progress
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 700, marginTop: 4 }}>
              {inr(company.fundingRaised)} <span className="text-2" style={{ fontSize: 18 }}>raised</span>{' '}
              <span className="text-3" style={{ fontSize: 18 }}>/ {inr(company.fundingTarget)} target</span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="match-pill" style={{ fontSize: 14, padding: '6px 14px' }}>{Math.round(progress)}%</div>
            <div className="text-2" style={{ fontSize: 11.5, marginTop: 6 }}>{company.equityOffered}% equity offered</div>
          </div>
        </div>
        <Progress value={progress} height={14} />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 12, color: 'var(--text-2)' }}>
          <span>{inr(company.minInvestment)} minimum ticket</span>
          <span>{company.interestedCount} investors interested · founder-supplied figures</span>
        </div>
      </motion.div>

      {/* Stat tiles */}
      <div className="dash-stats">
        <StatTile label="Profile views" value={<CountUp to={company.views} />} sub="+18% vs last month" icon={<Eye size={18} />} accent="blue" />
        <StatTile label="Investor interest" value={<CountUp to={company.interestedCount} />} sub="investors interested" icon={<Users size={18} />} accent="violet" />
        <StatTile label="Active connections" value={<CountUp to={myConns.filter((c) => c.status === 'accepted').length} />} sub={`${myConns.filter((c) => c.status === 'pending').length} pending`} icon={<Handshake size={18} />} accent="cyan" />
        <StatTile label="Profile completion" value={<CountUp to={profileComplete} format={(n) => `${Math.round(n)}%`} />} sub="documents pending" icon={<Gauge size={18} />} accent="green" />
      </div>

      {/* Charts */}
      <div className="dash-grid2">
        <div className="glass" style={{ padding: 20 }}>
          <ChartHead icon={<TrendingUp size={15} />} title="Profile views" sub="Last 12 weeks" />
          <AreaChart data={viewsSeries} label="Weekly profile views" />
        </div>
        <div className="glass" style={{ padding: 20 }}>
          <ChartHead icon={<Wallet size={15} />} title="Investor interest" sub="New interested investors per week" />
          <BarChart data={interestSeries} labels={['W1', '', '', 'W4', '', '', 'W7', '', '', 'W10', '', 'W12']} />
        </div>
      </div>

      {analytics && (
        <div className="dash-grid2" style={{ marginTop: 18 }}>
          <div className="glass" style={{ padding: 20 }}>
            <ChartHead icon={<Wallet size={15} />} title="Use of funds" sub="As published on your profile" />
            <Donut
              data={company.useOfFunds.map((u, i) => ({
                label: u.label,
                value: u.pct,
                color: ['#5b8cff', '#7c5cff', '#3ee6d8', '#fbbf24'][i % 4],
              }))}
            />
          </div>
          <div className="glass" style={{ padding: 20 }}>
            <ChartHead icon={<Users size={15} />} title="Interest by investor type" sub="Sample distribution" />
            <Donut
              data={[
                { label: 'Venture Capital', value: 42, color: '#5b8cff' },
                { label: 'Angel networks', value: 31, color: '#7c5cff' },
                { label: 'Family offices', value: 15, color: '#3ee6d8' },
                { label: 'Corporate', value: 12, color: '#fbbf24' },
              ]}
            />
          </div>
        </div>
      )}

      {!analytics && (
        <>
          {/* Activity */}
          <div className="glass" style={{ padding: 20, marginTop: 18 }}>
            <ChartHead icon={<Handshake size={15} />} title="Recent activity" sub="Connections and messages" />
            <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
              {myConns.map((cn) => {
                const inv = investors.find((i) => i.id === cn.investorId)
                if (!inv) return null
                const cv = conversations.find((c) => c.investorId === cn.investorId)
                return (
                  <div key={cn.id} className="traction-row">
                    <span style={{ display: 'flex', gap: 10, alignItems: 'center', minWidth: 0 }}>
                      <LogoAvatar name={inv.firm} hue={inv.hue} size={34} />
                      <span style={{ minWidth: 0 }}>
                        <b style={{ fontSize: 13.5 }}>{inv.firm}</b>
                        <span className="text-2" style={{ fontSize: 12, display: 'block' }}>
                          {cn.status === 'accepted' ? 'Connection accepted' : cn.status === 'pending' ? `${cn.initiator === 'entrepreneur' ? 'Request sent' : 'Wants to connect'} · ${timeAgo(cn.createdAt)}` : 'Declined'}{cv ? ` · last message ${timeAgo(cv.messages[cv.messages.length - 1].createdAt)}` : ''}
                        </span>
                      </span>
                    </span>
                    <span className={`badge ${cn.status === 'accepted' ? 'badge-green' : cn.status === 'pending' ? 'badge-amber' : ''}`}>{cn.status}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Suggested investors */}
          <div style={{ marginTop: 26 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h2 style={{ fontSize: 19 }}>Investors exploring your sector</h2>
              <Link to="/dashboard/investors" className="linklike" style={{ fontSize: 13 }}>
                View all <ArrowRight size={12} style={{ verticalAlign: '-2px' }} />
              </Link>
            </div>
            <div className="inv-grid">
              {investors.slice(0, 3).map((inv, i) => (
                <InvestorCard key={inv.id} investor={inv} delay={i * 0.06} showMatch />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function ChartHead({ icon, title, sub }: { icon: React.ReactNode; title: string; sub: string }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <span style={{ color: 'var(--blue)', display: 'grid' }}>{icon}</span>
        <b style={{ fontFamily: 'var(--font-display)', fontSize: 15 }}>{title}</b>
      </div>
      <div className="text-2" style={{ fontSize: 12, marginTop: 2 }}>{sub}</div>
    </div>
  )
}
