import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  MapPin,
  Eye,
  Users,
  Banknote,
  FileText,
  Download,
  HelpCircle,
  Sparkles,
  AlertTriangle,
  ArrowLeft,
  Info,
  Target,
  Lightbulb,
  Wrench,
  TrendingUp,
  PiggyBank,
  HandCoins,
  UsersRound,
  Scale,
  Save,
} from 'lucide-react'
import { useApp } from '../state/AppContext'
import { inr } from '../data/format'
import { computeMatch } from '../data/match'
import { LogoAvatar, VerificationBadge, FounderProvided, Progress, MatchPill } from '../components/ui/primitives'
import MatchExplainer from '../components/cards/MatchExplainer'
import ConnectButton from '../components/cards/ConnectButton'
import NotFound from './NotFound'

const DEMO_INVESTOR_ID = 'apex-ventures'

const ANALYSIS_ICONS: Record<string, React.ReactNode> = {
  businessModel: <Wrench size={15} />,
  market: <Target size={15} />,
  traction: <TrendingUp size={15} />,
  fundingRequest: <PiggyBank size={15} />,
  useOfFunds: <HandCoins size={15} />,
  team: <UsersRound size={15} />,
  considerations: <Scale size={15} />,
}

export default function StartupProfile() {
  const { id } = useParams()
  const { getCompany, investors, investorPrefs, savedStartups, toggleSaved, addReport } = useApp()
  const company = getCompany(id ?? '')
  const [tab, setTab] = useState('overview')

  if (!company) return <NotFound />

  const demoInvestor = investors.find((i) => i.id === DEMO_INVESTOR_ID)!
  const match = computeMatch(company, demoInvestor, investorPrefs)
  const saved = savedStartups.includes(company.id)
  const progress = company.fundingTarget ? (company.fundingRaised / company.fundingTarget) * 100 : 0

  // Deterministic AI summary from founder-supplied fields only; nulls → "Not provided by founder."
  const analysis = {
    businessModel: company.businessModel
      ? `${company.name} monetizes via ${company.businessModel}, serving a ${company.audience} audience. Revenue is currently ${company.revenue ? `${inr(company.revenue)} annualised, growing ${company.revenueGrowth}% m/m (founder-reported)` : 'pre-revenue — the model is validated only by pilots/LoIs so far'}.`
      : null,
    market: company.market
      ? `Founder-supplied market sizing — TAM: ${company.market.tam ?? 'not provided'}; SAM: ${company.market.sam ?? 'not provided'}; SOM: ${company.market.som ?? 'not provided'}. ${company.market.note ?? ''}`.trim()
      : null,
    traction: company.traction.length
      ? company.traction.map((t) => `${t.label}: ${t.value}`).join(' · ')
      : null,
    fundingRequest: `Seeking ${inr(company.fundingTarget)} (${company.equityOffered ? `${company.equityOffered}% equity` : 'equity terms not stated'}), ${inr(company.fundingRaised)} already committed, minimum ticket ${inr(company.minInvestment)}. ${company.previousFunding?.length ? `Previous rounds: ${company.previousFunding.map((p) => `${p.round} ${inr(p.amount)}${p.investor ? ` (${p.investor})` : ''}`).join(', ')}.` : 'No previous rounds disclosed.'}`,
    useOfFunds: company.useOfFunds.length
      ? company.useOfFunds.map((u) => `${u.label} ${u.pct}%`).join(' · ')
      : null,
    team: company.team.length
      ? company.team.map((t) => `${t.name} — ${t.title}${t.bio ? ` (${t.bio})` : ''}`).join(' · ')
      : null,
    considerations: [
      company.revenue ? null : 'Pre-revenue: model unproven at scale; execution and adoption risk is inherently higher.',
      company.runwayMonths && company.runwayMonths <= 9 ? `Founder-reported runway of ${company.runwayMonths} months — raise timing matters.` : null,
      company.verification === 'identity' || company.verification === 'none' ? 'Limited verification: company documents are not yet verified on-platform.' : null,
      'All information is founder-supplied unless explicitly badged as verified. Independent diligence is essential.',
    ].filter(Boolean).join(' ') || null,
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'analysis', label: 'AI Opportunity Summary' },
    { id: 'traction', label: 'Traction' },
    { id: 'team', label: 'Team' },
    { id: 'funding', label: 'Funding' },
    { id: 'documents', label: 'Documents' },
    { id: 'faq', label: 'Investor Questions' },
  ]

  return (
    <div className="page-pad profile-pad">
      <div className="container">
        <button className="linklike" style={{ display: 'inline-flex', gap: 6, alignItems: 'center', marginBottom: 18 }} onClick={() => history.back()}>
          <ArrowLeft size={14} /> Back
        </button>

        {/* Header card */}
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="glass profile-hero">
          <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <LogoAvatar name={company.name} hue={company.hue} size={72} />
            <div style={{ flex: 1, minWidth: 260 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: 'clamp(24px, 3.4vw, 34px)' }}>{company.name}</h1>
                <VerificationBadge level={company.verification} />
                {match.score >= 70 && <MatchPill score={match.score} />}
              </div>
              <p className="text-1" style={{ fontSize: 16, marginTop: 6 }}>{company.tagline}</p>
              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 12, fontSize: 13, color: 'var(--text-2)' }}>
                <span><MapPin size={13} style={{ verticalAlign: '-2px' }} /> {company.location}</span>
                <span><Users size={13} style={{ verticalAlign: '-2px' }} /> {company.teamSize} people</span>
                <span><Eye size={13} style={{ verticalAlign: '-2px' }} /> {company.views.toLocaleString('en-IN')} views</span>
                <span>Founded {company.foundedYear}</span>
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 12 }}>
                {company.sectorTags.map((t) => <span key={t} className="badge badge-blue">{t}</span>)}
                <span className="badge badge-violet">{company.stage}</span>
                <span className="badge">{company.audience}</span>
                <FounderProvided>financials</FounderProvided>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 230 }}>
              <div className="glass" style={{ padding: 16, borderRadius: 14 }}>
                <div style={{ fontSize: 11.5, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>Raising</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700 }}>{inr(company.fundingTarget)}</div>
                <div style={{ margin: '10px 0 6px' }}>
                  <Progress value={progress} height={8} />
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-2)' }}>
                  {inr(company.fundingRaised)} committed · {inr(company.minInvestment)} minimum
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <ConnectButton companyId={company.id} />
                <button className="btn btn-ghost" onClick={() => toggleSaved(company.id)} aria-pressed={saved}>
                  <Save size={14} /> {saved ? 'Saved' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="tabs" role="tablist" aria-label="Startup profile sections">
          {tabs.map((t) => (
            <button key={t.id} role="tab" aria-selected={tab === t.id} className={`tab ${tab === t.id ? 'on' : ''}`} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Panels */}
        <motion.div key={tab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} style={{ marginTop: 22 }}>
          {tab === 'overview' && (
            <div className="profile-grid">
              <Section icon={<Lightbulb size={15} />} title="The story">
                <p>{company.description}</p>
              </Section>
              <Section icon={<AlertTriangle size={15} />} title="Problem">
                <p>{company.problem ?? 'Not provided by founder.'}</p>
              </Section>
              <Section icon={<Sparkles size={15} />} title="Solution">
                <p>{company.solution ?? 'Not provided by founder.'}</p>
              </Section>
              <Section icon={<Target size={15} />} title="Market (TAM / SAM / SOM)">
                {company.market ? (
                  <div style={{ display: 'grid', gap: 8 }}>
                    <div className="market-row"><span>TAM</span><b>{company.market.tam ?? '—'}</b></div>
                    <div className="market-row"><span>SAM</span><b>{company.market.sam ?? '—'}</b></div>
                    <div className="market-row"><span>SOM</span><b>{company.market.som ?? '—'}</b></div>
                    {company.market.note && <p className="text-2" style={{ fontSize: 12 }}>{company.market.note}</p>}
                  </div>
                ) : (
                  <p className="not-provided">Not provided by founder.</p>
                )}
              </Section>
              <Section icon={<Wrench size={15} />} title="Product & gallery">
                {company.productGallery?.length ? (
                  <div className="gallery-grid">
                    {company.productGallery.map((g) => (
                      <div key={g.label} className="glass gallery-item" style={{ padding: 14 }}>
                        <b style={{ fontSize: 13 }}>{g.label}</b>
                        <span className="text-2" style={{ fontSize: 12 }}>{g.type} · {g.note ?? 'founder-uploaded'}</span>
                        <span className="demo-tag" style={{ marginTop: 8 }}>Sample media</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="not-provided">Not provided by founder.</p>
                )}
              </Section>
              <Section icon={<Info size={15} />} title="Technologies">
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {company.technologies.map((t) => <span key={t} className="badge">{t}</span>)}
                </div>
              </Section>
            </div>
          )}

          {tab === 'analysis' && (
            <div style={{ display: 'grid', gap: 16 }}>
              <div className="disclaimer-box">
                <AlertTriangle size={15} />
                AI-generated analysis is informational only and should not be considered investment advice or a guarantee of performance.
              </div>
              <div className="profile-grid">
                {(Object.keys(analysis) as (keyof typeof analysis)[]).map((k) => (
                  <Section key={k} icon={ANALYSIS_ICONS[k]} title={ANALYSIS_TITLES[k]}>
                    <p>{analysis[k] ?? <span className="not-provided">Not provided by founder.</span>}</p>
                  </Section>
                ))}
                <MatchExplainer match={match} />
              </div>
            </div>
          )}

          {tab === 'traction' && (
            <div className="profile-grid">
              <Section icon={<TrendingUp size={15} />} title="Traction & metrics">
                {company.traction.length ? (
                  <div style={{ display: 'grid', gap: 10 }}>
                    {company.traction.map((t) => (
                      <div key={t.label} className="traction-row">
                        <span className="text-2">{t.label}</span>
                        <b>{t.value}</b>
                      </div>
                    ))}
                    <FounderProvided>all metrics</FounderProvided>
                  </div>
                ) : (
                  <p className="not-provided">Not provided by founder.</p>
                )}
              </Section>
              <Section icon={<Banknote size={15} />} title="Financial snapshot">
                <div style={{ display: 'grid', gap: 10 }}>
                  <div className="traction-row"><span className="text-2">Revenue (annualised)</span><b>{company.revenue ? inr(company.revenue) : 'Pre-revenue'}</b></div>
                  <div className="traction-row"><span className="text-2">Growth</span><b>{company.revenueGrowth ? `+${company.revenueGrowth}% m/m` : '—'}</b></div>
                  {company.monthlyBurn && <div className="traction-row"><span className="text-2">Monthly burn</span><b>{inr(company.monthlyBurn)}</b></div>}
                  {company.runwayMonths && <div className="traction-row"><span className="text-2">Runway</span><b>{company.runwayMonths} months</b></div>}
                  <div className="traction-row"><span className="text-2">Valuation</span><b>{inr(company.valuation)}</b></div>
                  <FounderProvided>displayed only as supplied by the company</FounderProvided>
                </div>
              </Section>
            </div>
          )}

          {tab === 'team' && (
            <div className="profile-grid">
              {company.team.map((f) => (
                <div key={f.id} className="glass card-hover" style={{ padding: 20, display: 'flex', gap: 14 }}>
                  <LogoAvatar name={f.name} hue={company.hue} />
                  <div>
                    <b style={{ fontFamily: 'var(--font-display)' }}>{f.name}</b>
                    <div style={{ fontSize: 12.5, color: 'var(--blue)', marginBottom: 4 }}>{f.title}</div>
                    <p style={{ fontSize: 13, color: 'var(--text-1)' }}>{f.bio ?? 'Bio not provided by founder.'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'funding' && (
            <div className="profile-grid">
              <Section icon={<PiggyBank size={15} />} title="Funding">
                <div style={{ display: 'grid', gap: 10 }}>
                  <div className="traction-row"><span className="text-2">Target</span><b>{inr(company.fundingTarget)}</b></div>
                  <div className="traction-row"><span className="text-2">Committed</span><b>{inr(company.fundingRaised)}</b></div>
                  <div className="traction-row"><span className="text-2">Valuation</span><b>{inr(company.valuation)}</b></div>
                  <div className="traction-row"><span className="text-2">Equity offered</span><b>{company.equityOffered ? `${company.equityOffered}%` : 'Not stated'}</b></div>
                  <div className="traction-row"><span className="text-2">Minimum ticket</span><b>{inr(company.minInvestment)}</b></div>
                </div>
              </Section>
              <Section icon={<FileText size={15} />} title="Previous rounds">
                {company.previousFunding?.length ? (
                  <div style={{ display: 'grid', gap: 10 }}>
                    {company.previousFunding.map((p) => (
                      <div key={p.round} className="traction-row">
                        <span className="text-2">{p.round}{p.investor ? ` · ${p.investor}` : ''}</span>
                        <b>{inr(p.amount)}</b>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="not-provided">Not provided by founder.</p>
                )}
              </Section>
              <Section icon={<HandCoins size={15} />} title="Use of funds">
                {company.useOfFunds.length ? (
                  <div style={{ display: 'grid', gap: 12 }}>
                    {company.useOfFunds.map((u) => (
                      <div key={u.label}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 5 }}>
                          <span className="text-1">{u.label}</span><b>{u.pct}%</b>
                        </div>
                        <Progress value={u.pct} height={7} showGlow={false} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="not-provided">Not provided by founder.</p>
                )}
              </Section>
            </div>
          )}

          {tab === 'documents' && (
            <div style={{ display: 'grid', gap: 12, maxWidth: 640 }}>
              <p className="text-2" style={{ fontSize: 13 }}>
                Documents are shared by the founder. Access may require an accepted connection. Files shown are sample placeholders in this prototype.
              </p>
              {company.documents.map((d) => (
                <div key={d.name} className="glass doc-row">
                  <FileText size={18} color="var(--blue)" />
                  <div style={{ flex: 1 }}>
                    <b style={{ fontSize: 13.5 }}>{d.name}</b>
                    <div style={{ fontSize: 12, color: 'var(--text-2)' }}>{d.kind}</div>
                  </div>
                  <button className="btn btn-ghost btn-sm"><Download size={13} /> Request</button>
                </div>
              ))}
              {company.documents.length === 0 && <p className="not-provided">No documents provided by founder.</p>}
            </div>
          )}

          {tab === 'faq' && (
            <div style={{ display: 'grid', gap: 12, maxWidth: 720 }}>
              {(company.faqs?.length
                ? company.faqs
                : [{ q: 'No investor questions published yet.', a: 'The founder has not added an FAQ. Accepted connections can ask questions directly via messages.' }
              ]).map((f) => (
                <div key={f.q} className="glass" style={{ padding: 18 }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 6 }}>
                    <HelpCircle size={15} color="var(--blue)" />
                    <b style={{ fontSize: 14 }}>{f.q}</b>
                  </div>
                  <p style={{ fontSize: 13.5, color: 'var(--text-1)', paddingLeft: 25 }}>{f.a}</p>
                </div>
              ))}
              <div className="disclaimer-box">
                <AlertTriangle size={15} />
                Answers are founder-supplied and informational only.
              </div>
            </div>
          )}
        </motion.div>

        <div style={{ display: 'flex', gap: 10, marginTop: 34, flexWrap: 'wrap', alignItems: 'center' }}>
          <ConnectButton companyId={company.id} />
          <button className="btn btn-ghost" onClick={() => addReport({ kind: 'Opportunity', target: company.name, reason: 'Flag from profile', detail: 'User-initiated report from startup profile page.' })}>
            Report this opportunity
          </button>
          <Link to="/trust-safety" className="text-2" style={{ fontSize: 12.5 }}>Investing involves risk — read our Trust &amp; Safety principles</Link>
        </div>
      </div>
    </div>
  )
}

const ANALYSIS_TITLES: Record<string, string> = {
  businessModel: 'Business Model',
  market: 'Market',
  traction: 'Traction',
  fundingRequest: 'Funding Request',
  useOfFunds: 'Use of Funds',
  team: 'Team',
  considerations: 'Potential Considerations',
}

function Section({ icon, title, children }: { icon?: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="glass profile-section">
      <div className="profile-section-head">
        {icon}
        <h3>{title}</h3>
      </div>
      <div style={{ fontSize: 14, color: 'var(--text-1)', lineHeight: 1.7 }}>{children}</div>
    </div>
  )
}
