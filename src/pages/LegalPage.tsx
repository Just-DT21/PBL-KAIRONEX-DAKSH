import { Link, useParams } from 'react-router-dom'
import { FileText, ArrowLeft } from 'lucide-react'

const CONTENT: Record<string, { title: string; body: string[] }> = {
  terms: {
    title: 'Terms of Service',
    body: [
      'This is a prototype. The full Terms of Service will govern your use of the KAIRONEXA platform, accounts, content standards and prohibited conduct.',
      'KAIRONEXA provides discovery and connection tools only. It is not a broker-dealer, investment adviser, or a party to any transaction between users.',
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    body: [
      'This is a prototype. The Privacy Policy will describe what data is collected, how documents are encrypted and stored, retention windows, and your data-protection rights including export and deletion.',
      'The prototype stores no personal data; demo accounts exist only in memory.',
    ],
  },
  'risk-disclosure': {
    title: 'Risk Disclosure',
    body: [
      'Investing in early-stage companies involves significant risk, including illiquidity, loss of capital, dilution and uncertain returns. Past performance is not indicative of future results.',
      'Information on KAIRONEXA — including KAIRONEXA Match scores and AI summaries — is provided for discovery and informational purposes only. It is not investment, legal or tax advice, and does not guarantee performance.',
      'Users should independently conduct due diligence and obtain appropriate professional advice before entering into any investment transaction.',
    ],
  },
  'investor-disclaimer': {
    title: 'Investor Disclaimer',
    body: [
      'This is a prototype. Investor verification confirms reviewed status only; it is not a recommendation, solicitation, or confirmation of accreditation.',
      'Nothing on the platform constitutes an offer to sell or a solicitation of an offer to buy any security.',
    ],
  },
  'founder-agreement': {
    title: 'Founder Agreement',
    body: [
      'This is a prototype. The Founder Agreement will cover listing standards, accuracy obligations for founder-supplied information, document responsibilities, and conduct rules.',
    ],
  },
  'platform-rules': {
    title: 'Platform Rules',
    body: [
      'This is a prototype. Platform rules will prohibit misleading claims (including guaranteed-return language), spam, impersonation, and off-platform payment solicitation.',
    ],
  },
  'verification-policy': {
    title: 'Verification Policy',
    body: [
      'This is a prototype. The Verification Policy will define each badge level, the evidence required, review timelines, expiry and revocation.',
      'Verification confirms that information was checked — it is never an endorsement of an opportunity or its prospects.',
    ],
  },
  'data-protection': {
    title: 'Data Protection',
    body: [
      'This is a prototype. Data-protection documentation will cover encryption standards, access logging for documents, sub-processors, and breach-notification commitments.',
    ],
  },
  'content-policy': {
    title: 'Content Policy',
    body: [
      'This is a prototype. The Content Policy will define acceptable media for profiles and showcase posts, attribution requirements, and takedown procedures.',
    ],
  },
}

export default function LegalPage() {
  const { slug } = useParams()
  const page = CONTENT[slug ?? ''] ?? {
    title: 'Legal',
    body: ['This page is a placeholder in the prototype. The final document will be published before launch.'],
  }

  return (
    <div className="page-pad">
      <div className="container" style={{ maxWidth: 760 }}>
        <Link to="/" className="linklike" style={{ display: 'inline-flex', gap: 6, alignItems: 'center', marginBottom: 18 }}>
          <ArrowLeft size={14} /> Home
        </Link>
        <div className="eyebrow"><FileText size={12} /> Legal</div>
        <h1 className="page-title">{page.title}</h1>
        <span className="demo-tag" style={{ marginBottom: 24, display: 'inline-flex' }}>Prototype placeholder — not legal text</span>
        <div style={{ display: 'grid', gap: 14, marginTop: 18 }}>
          {page.body.map((p, i) => (
            <p key={i} className="text-1" style={{ fontSize: 14.5, lineHeight: 1.75 }}>{p}</p>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 30 }}>
          {Object.entries(CONTENT).map(([k, v]) => (
            <Link key={k} to={`/legal/${k}`} className={`chip ${(slug ?? '') === k ? 'on' : ''}`}>{v.title}</Link>
          ))}
          <Link to="/legal/investor-disclaimer" className={`chip ${slug === 'investor-disclaimer' ? 'on' : ''}`}>Investor Disclaimer</Link>
          <Link to="/legal/founder-agreement" className={`chip ${slug === 'founder-agreement' ? 'on' : ''}`}>Founder Agreement</Link>
          <Link to="/legal/platform-rules" className={`chip ${slug === 'platform-rules' ? 'on' : ''}`}>Platform Rules</Link>
          <Link to="/legal/verification-policy" className={`chip ${slug === 'verification-policy' ? 'on' : ''}`}>Verification Policy</Link>
          <Link to="/legal/data-protection" className={`chip ${slug === 'data-protection' ? 'on' : ''}`}>Data Protection</Link>
          <Link to="/legal/content-policy" className={`chip ${slug === 'content-policy' ? 'on' : ''}`}>Content Policy</Link>
        </div>
      </div>
    </div>
  )
}
