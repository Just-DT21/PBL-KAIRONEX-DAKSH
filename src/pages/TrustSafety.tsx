import { Link } from 'react-router-dom'
import {
  Building2,
  FileCheck2,
  UserCheck,
  Flag,
  Eye,
  BadgeCheck,
  AlertTriangle,
} from 'lucide-react'
import { Reveal } from '../components/ui/primitives'

const PROTECTIONS = [
  { icon: <UserCheck size={20} />, title: 'Identity verification', body: 'Founders and investors can verify identity with government ID (hashed, never shared). Verified members carry a visible badge.' },
  { icon: <Building2 size={20} />, title: 'Company verification', body: 'Incorporation documents and CIN are cross-checked against the registry before the Company Verified badge is granted.' },
  { icon: <FileCheck2 size={20} />, title: 'Document verification', body: 'Financial summaries and legal documents can be reviewed by the trust team and labelled as verified.' },
  { icon: <BadgeCheck size={20} />, title: 'Investor verification', body: 'Investors can verify type, firm and (where applicable) accreditation status. Founder-facing badges make this visible.' },
  { icon: <Flag size={20} />, title: 'Fraud reporting', body: 'Every opportunity, user and message can be reported in one tap. Reports go straight to the trust queue.' },
  { icon: <Eye size={20} />, title: 'Content moderation', body: 'Listings and showcase posts pass automated checks plus human review before and after publishing.' },
]

export default function TrustSafety() {
  return (
    <div className="page-pad">
      <div className="container" style={{ maxWidth: 940 }}>
        <div className="center section-head" style={{ margin: '0 auto 40px' }}>
          <div className="eyebrow">Trust & Safety</div>
          <h1 className="page-title">Discovery works on trust.</h1>
          <p className="page-sub">
            KAIRONEXA verifies what it can, labels what it can't, and keeps every party in control of their own due
            diligence.
          </p>
        </div>

        <div className="disclaimer-box" style={{ marginBottom: 36 }}>
          <AlertTriangle size={17} />
          <span>
            <b>Investing involves risk.</b> Information displayed on this platform is provided for discovery and
            informational purposes. Users should independently conduct due diligence and obtain appropriate
            professional advice before entering into any investment transaction.
          </span>
        </div>

        <div className="profile-grid">
          {PROTECTIONS.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.06}>
              <div className="glass card-hover" style={{ padding: 24, height: '100%' }}>
                <div className="why-icon" style={{ marginBottom: 14 }}>{p.icon}</div>
                <h3 style={{ fontSize: 17, marginBottom: 8 }}>{p.title}</h3>
                <p className="text-1" style={{ fontSize: 13.5 }}>{p.body}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.1}>
          <div className="glass" style={{ padding: 26, marginTop: 30 }}>
            <h2 style={{ fontSize: 20, marginBottom: 12 }}>Verification ≠ endorsement</h2>
            <p className="text-1" style={{ fontSize: 14, lineHeight: 1.75 }}>
              Verification badges confirm that a document, identity or registration was checked at a point in time.
              They do <b>not</b> mean an opportunity is safe, profitable, liquid or guaranteed. Founder-provided
              information is always labelled as such. Verified information is labelled where it appears. Nothing on
              KAIRONEXA is investment advice, and KAIRONEXA is never a party to any investment transaction.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="glass" style={{ padding: 26, marginTop: 20 }}>
            <h2 style={{ fontSize: 20, marginBottom: 12 }}>Report something</h2>
            <p className="text-1" style={{ fontSize: 14, marginBottom: 18 }}>
              Use the <b>Report</b> button on any opportunity, profile or message. Our trust team reviews reports within
              24 hours in the prototype workflow.
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <Link to="/explore" className="btn btn-ghost"><Flag size={14} /> Report an opportunity</Link>
              <Link to="/investors" className="btn btn-ghost"><Flag size={14} /> Report a user</Link>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  )
}
