import { Link } from 'react-router-dom'
import { Linkedin, Twitter, Youtube, Github } from 'lucide-react'
import { Logo } from '../../brand/Logo'

const COLS: { head: string; items: { label: string; to: string }[] }[] = [
  {
    head: 'Platform',
    items: [
      { label: 'Explore', to: '/explore' },
      { label: 'Startups', to: '/explore' },
      { label: 'Investors', to: '/investors' },
      { label: 'Showcase', to: '/showcase' },
      { label: 'AI Match', to: '/ai-match' },
    ],
  },
  {
    head: 'Company',
    items: [
      { label: 'About', to: '/#how-it-works' },
      { label: 'Careers', to: '/#how-it-works' },
      { label: 'Contact', to: '/#how-it-works' },
    ],
  },
  {
    head: 'Resources',
    items: [
      { label: 'Help Center', to: '/trust-safety' },
      { label: 'Founder Resources', to: '/trust-safety' },
      { label: 'Investor Resources', to: '/trust-safety' },
    ],
  },
  {
    head: 'Legal',
    items: [
      { label: 'Terms', to: '/legal/terms' },
      { label: 'Privacy', to: '/legal/privacy' },
      { label: 'Risk Disclosure', to: '/legal/risk-disclosure' },
      { label: 'Trust & Safety', to: '/trust-safety' },
    ],
  },
]

const SOCIALS = [
  { icon: <Linkedin size={15} />, label: 'LinkedIn' },
  { icon: <Twitter size={15} />, label: 'Twitter / X' },
  { icon: <Youtube size={15} />, label: 'YouTube' },
  { icon: <Github size={15} />, label: 'GitHub' },
]

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="logo" aria-label="KAIRONEXA home">
              <Logo size={32} stackedTagline />
            </Link>
            <p style={{ marginTop: 18 }}>
              Connecting the right ideas with the right capital at the right moment. Direct founder-to-investor
              discovery — no middlemen.
            </p>
            <div className="kx-venture" style={{ marginTop: 12 }}>
              A <b>DT21</b> Venture ·{' '}
              <a
                href="https://linktr.ee/Bapo21"
                target="_blank"
                rel="noopener noreferrer"
                className="dt21-link"
                aria-label="DT21 on Linktree (opens in a new tab)"
              >
                Follow DT21
              </a>
            </div>
            <div className="social-row" style={{ marginTop: 18 }}>
              {SOCIALS.map((s) => (
                <a key={s.label} href="#" aria-label={s.label} onClick={(e) => e.preventDefault()}>
                  {s.icon}
                </a>
              ))}
            </div>
          </div>
          {COLS.map((col) => (
            <div className="footer-col" key={col.head}>
              <h4>{col.head}</h4>
              {col.items.map((i) => (
                <Link key={i.label} to={i.to}>{i.label}</Link>
              ))}
            </div>
          ))}
        </div>
        <div className="footer-bottom">
          <p>
            <strong style={{ color: 'var(--text-2)' }}>Disclaimer:</strong> KAIRONEXA is a discovery and connection
            platform. It is not a party to any investment transaction and does not provide investment, legal or tax
            advice. Investing involves risk; users should independently conduct due diligence and obtain appropriate
            professional advice. Prototype shown with sample data.
          </p>
          <span style={{ fontSize: 12.5, color: 'var(--text-3)', whiteSpace: 'nowrap' }}>© {new Date().getFullYear()} KAIRONEXA · A DT21 Venture</span>
        </div>
      </div>
    </footer>
  )
}
