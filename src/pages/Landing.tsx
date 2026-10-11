import { useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import gsap from 'gsap'
import { Link2 } from 'lucide-react'
import {
  ArrowRight,
  Building2,
  LineChart,
  ShieldCheck,
  Sparkles,
  Handshake,
  Search,
  Layers,
  Rocket,
  Telescope,
  FileSearch,
  FileSignature,
  Eye,
  Lock,
  AlertTriangle,
} from 'lucide-react'
import BlackHoleLazy from '../hero/BlackHoleLazy'
import GravityCursor from '../hero/GravityCursor'
import { CountUp, Reveal, VerificationBadge } from '../components/ui/primitives'
import { StartupCard } from '../components/cards/platform-cards'
import { useApp } from '../state/AppContext'
import './Landing.css'

const STEPS = [
  {
    n: '01',
    icon: <Layers size={20} />,
    title: 'Build',
    body: 'Entrepreneurs create a structured company profile — story, metrics, documents and funding requirements.',
  },
  {
    n: '02',
    icon: <Search size={20} />,
    title: 'Discover',
    body: 'Investors explore opportunities matched to their thesis, with AI-assisted discovery and transparent filters.',
  },
  {
    n: '03',
    icon: <Handshake size={20} />,
    title: 'Connect',
    body: 'Both sides request a connection. Accepted connections unlock secure messaging and document sharing.',
  },
  {
    n: '04',
    icon: <FileSearch size={20} />,
    title: 'Due Diligence',
    body: 'Parties independently evaluate the opportunity with the information and documents supplied on-platform.',
  },
  {
    n: '05',
    icon: <FileSignature size={20} />,
    title: 'Deal',
    body: 'Any investment agreement happens directly between the relevant parties through appropriate legal and financial processes.',
  },
]

const WHY = [
  {
    icon: <Handshake size={22} />,
    title: 'Direct',
    body: 'Founders and investors discover each other directly. No broker layers, no listing fees stacked in the middle.',
  },
  {
    icon: <Eye size={22} />,
    title: 'Transparent',
    body: 'Structured, founder-supplied information makes opportunities easier to explore and compare on merit.',
  },
  {
    icon: <Sparkles size={22} />,
    title: 'Intelligent',
    body: 'NEXA AI helps both sides find relevant opportunities faster — as a research assistant, never an advisor.',
  },
]

export default function Landing({ anchor }: { anchor?: string }) {
  const { companies } = useApp()
  const navigate = useNavigate()
  const featured = companies.slice(0, 3)

  /* deep-link support: /how-it-works renders the landing page scrolled to the section */
  useEffect(() => {
    if (!anchor) return
    const t = setTimeout(() => {
      document.getElementById(anchor)?.scrollIntoView({ behavior: 'instant', block: 'start' })
    }, 150)
    return () => clearTimeout(t)
  }, [anchor])

  /* GSAP hero entrance — elements are VISIBLE by default and animated in with
     a single batched from() + clearProps, so the page is never left blank if
     rAF is throttled (hidden tab) or the user has reduced motion. */
  const heroRef = useRef<HTMLElement>(null)
  useEffect(() => {
    const root = heroRef.current
    if (!root) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const ctx = gsap.context(() => {
      gsap.from(root.querySelectorAll('[data-hero]'), {
        opacity: 0,
        y: 22,
        duration: 0.75,
        stagger: 0.07,
        ease: 'power3.out',
        delay: 0.05,
        clearProps: 'transform,opacity',
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <div>
      {/* ================= HERO ================= */}
      <section className="hero" ref={heroRef}>
        <BlackHoleLazy />
        <GravityCursor enabled />
        <div className="hero-shade" aria-hidden />
        <div className="hero-rail" data-hero="rail" aria-label="Follow the founder">
          <span className="rail-label">Follow</span>
          <a
            className="rail-link"
            href="https://linktr.ee/Bapo21"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="DT21 — founder profile (opens in a new tab)"
          >
            <Link2 size={14} />
            <span className="rail-name">DT21</span>
          </a>
          <span className="rail-label dim">DT21</span>
        </div>
        <div className="hero-inner container">
          <div className="eyebrow" data-hero="eyebrow">
            <Sparkles size={12} /> KAIRONEXA · A DT21 Venture
          </div>

          <h1 className="hero-h1">
            <span className="line"><span className="word" data-hero="word">WHERE</span> <span className="word" data-hero="word">IDEAS</span></span>
            <span className="line"><span className="word">MEET</span> <span className="word grad-text" data-hero="word">CAPITAL.</span></span>
            <span className="sr-only">WHERE IDEAS MEET CAPITAL.</span>
          </h1>

          <p className="hero-sub" data-hero="sub">
            Connect ambitious founders with investors looking for their next opportunity.
          </p>

          <div className="hero-ctas">
            <button className="btn btn-primary btn-lg magnetic kx-cta" data-hero="cta" onClick={() => navigate('/explore')}>
              Explore Opportunities <ArrowRight size={16} />
            </button>
            <button className="btn btn-ghost btn-lg magnetic kx-cta" data-hero="cta" onClick={() => navigate('/auth?role=entrepreneur&mode=signup')}>
              Raise Capital
            </button>
          </div>

          <div className="hero-trust" data-hero="trust">
            <ShieldCheck size={13} /> Built for founders. Designed for investors.
          </div>

          <p className="gravity-hint" data-hero="hint" aria-hidden>
            <Sparkles size={11} /> Move your cursor near the horizon — feel the pull.
          </p>

          {/* Two-journey chooser */}
          <div className="journey-grid">
            <JourneyCard
              data-hero="card"
              icon={<Rocket size={22} />}
              kicker="I'm building a company"
              title="Find Investors"
              body="Publish your verified company, present your opportunity, and get discovered by investors matching your sector and stage."
              cta="I'm an Entrepreneur"
              to="/auth?role=entrepreneur&mode=signup"
            />
            <JourneyCard
              data-hero="card"
              icon={<Telescope size={22} />}
              kicker="I'm looking to invest"
              title="Discover Opportunities"
              body="Browse verified startup opportunities with AI-assisted discovery built around your investment preferences."
              cta="I'm an Investor"
              to="/auth?role=investor&mode=signup"
            />
          </div>
        </div>
        <div className="hero-fade" aria-hidden />
      </section>

      {/* ================= STATS ================= */}
      <section className="section-pad stats-band">
        <div className="container">
          <Reveal className="center section-head">
            <div className="eyebrow">Marketplace scale</div>
            <h2>The ecosystem, in numbers</h2>
            <p style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
              <AlertTriangle size={14} color="var(--amber)" /> Prototype statistics — sample demo data, not production
              figures.
            </p>
          </Reveal>
          <div className="stats-grid">
            <StatChip value={<CountUp to={12000} />} label="Startup Opportunities" suffix="+" />
            <StatChip value={<CountUp to={8400} format={(n) => `₹${Math.round(n).toLocaleString('en-IN')}`} />} label="Capital Sought (Cr)" />
            <StatChip value={<CountUp to={4800} />} label="Investors" suffix="+" />
            <StatChip value={<CountUp to={24} />} label="Industries" />
          </div>
          <Reveal className="center" delay={0.1}>
            <span className="demo-tag">Demo data · replace with live platform metrics</span>
          </Reveal>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="section-pad" id="how-it-works">
        <div className="container">
          <Reveal className="section-head">
            <div className="eyebrow">How it works</div>
            <h2>
              From first look to term sheet — <span className="grad-text">on your terms</span>
            </h2>
            <p>
              KAIRONEXA is a discovery and connection layer. Deals are made directly between parties, independently.
            </p>
          </Reveal>
          <div className="steps-grid">
            {STEPS.map((s, i) => (
              <Reveal key={s.n} delay={i * 0.08}>
                <div className="glass card-hover step-card">
                  <div className="step-num">{s.n}</div>
                  <div className="step-icon">{s.icon}</div>
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================= WHY ================= */}
      <section className="section-pad">
        <div className="container">
          <Reveal className="section-head">
            <div className="eyebrow">Why KAIRONEXA</div>
            <h2>No Brokers. No Noise. Just Connections.</h2>
          </Reveal>
          <div className="why-grid">
            {WHY.map((w, i) => (
              <Reveal key={w.title} delay={i * 0.1}>
                <div className="glass card-hover why-card">
                  <div className="why-icon">{w.icon}</div>
                  <h3>{w.title}</h3>
                  <p>{w.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================= FEATURED ================= */}
      <section className="section-pad">
        <div className="container">
          <Reveal className="section-head" >
            <div className="eyebrow">Live on the platform</div>
            <h2>Featured opportunities</h2>
            <p>A sample of companies publishing on KAIRONEXA right now.</p>
          </Reveal>
          <div style={{ display: 'grid', gap: 18 }}>
            {featured.map((c, i) => (
              <Reveal key={c.id} delay={i * 0.08}>
                <StartupCard company={c} />
              </Reveal>
            ))}
          </div>
          <Reveal className="center" delay={0.15}>
            <Link to="/explore" className="btn btn-ghost btn-lg" style={{ marginTop: 34 }}>
              Explore all opportunities <ArrowRight size={15} />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ================= TRUST STRIP ================= */}
      <section className="section-pad">
        <div className="container">
          <Reveal>
            <div className="glass trust-strip">
              <div className="trust-cell">
                <VerificationBadge level="documents" />
                <p>Layered verification: identity, company and documents — always labelled, never implied as a seal of quality.</p>
              </div>
              <div className="trust-cell">
                <Lock size={18} color="var(--cyan)" />
                <p>Founder-supplied information is explicitly distinguished from verified information across the platform.</p>
              </div>
              <div className="trust-cell">
                <AlertTriangle size={18} color="var(--amber)" />
                <p>Discovery-first: KAIRONEXA is not a party to any investment. Independent due diligence always applies.</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ================= FINAL CTA ================= */}
      <section className="section-pad">
        <div className="container">
          <Reveal>
            <div className="final-cta glass">
              <h2>Your next chapter starts with a connection.</h2>
              <p>Join the marketplace where founders and investors find each other directly.</p>
              <div className="hero-ctas" style={{ justifyContent: 'center', marginTop: 26 }}>
                <Link to="/auth?role=entrepreneur&mode=signup" className="btn btn-primary btn-lg">
                  <Building2 size={16} /> I'm an Entrepreneur
                </Link>
                <Link to="/auth?role=investor&mode=signup" className="btn btn-ghost btn-lg">
                  <LineChart size={16} /> I'm an Investor
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  )
}

function JourneyCard({ icon, kicker, title, body, cta, to, ...rest }: { icon: React.ReactNode; kicker: string; title: string; body: string; cta: string; to: string } & React.HTMLAttributes<HTMLAnchorElement>) {
  return (
    <Link to={to} className="glass card-hover journey-card" {...rest}>
      <div className="journey-icon">{icon}</div>
      <div className="journey-kicker">{kicker}</div>
      <h3>{title}</h3>
      <p>{body}</p>
      <span className="journey-cta">
        {cta} <ArrowRight size={14} />
      </span>
    </Link>
  )
}

function StatChip({ value, label, prefix, suffix }: { value: React.ReactNode; label: string; prefix?: string; suffix?: string }) {
  return (
    <div className="glass stat-chip card-hover">
      <div className="stat-value">
        {prefix}
        {value}
        {suffix}
      </div>
      <div className="stat-label">{label}</div>
    </div>
  )
}
