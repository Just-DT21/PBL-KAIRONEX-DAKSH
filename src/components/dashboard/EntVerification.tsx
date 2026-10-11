import { ShieldCheck, FileCheck2, UserCheck, Building2, Clock, CheckCircle2 } from 'lucide-react'
import { useApp } from '../../state/AppContext'

const MY_COMPANY_ID = 'nova-robotics'

export default function EntVerification() {
  const { companies } = useApp()
  const company = companies.find((c) => c.id === MY_COMPANY_ID)!

  const levels = [
    {
      id: 'identity',
      icon: <UserCheck size={18} />,
      name: 'Identity Verified',
      desc: 'Government-ID match of the founding signatory. Stored as a hash; document never leaves secure storage.',
      done: company.verification !== 'none',
    },
    {
      id: 'company',
      icon: <Building2 size={18} />,
      name: 'Company Verified',
      desc: 'Certificate of incorporation and CIN cross-checked against the registry.',
      done: company.verification === 'company' || company.verification === 'documents',
    },
    {
      id: 'documents',
      icon: <FileCheck2 size={18} />,
      name: 'Documents Verified',
      desc: 'Financial summaries and legal documents reviewed by the KAIRONEXA trust team.',
      done: company.verification === 'documents',
    },
  ]

  return (
    <div className="dash-page">
      <h1 className="dash-title">Verification</h1>
      <p className="text-2" style={{ fontSize: 13.5 }}>
        Verification confirms that information was checked — it is never an endorsement of the opportunity's quality,
        safety, or prospects.
      </p>

      <div style={{ display: 'grid', gap: 14, marginTop: 20, maxWidth: 680 }}>
        {levels.map((l) => (
          <div key={l.id} className="glass" style={{ padding: 20, display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            <div
              style={{
                width: 44, height: 44, borderRadius: 12, display: 'grid', placeItems: 'center', flex: 'none',
                background: l.done ? 'rgba(52,211,153,0.12)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${l.done ? 'rgba(52,211,153,0.4)' : 'var(--border)'}`,
                color: l.done ? 'var(--green)' : 'var(--text-2)',
              }}
            >
              {l.icon}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <b style={{ fontFamily: 'var(--font-display)', fontSize: 15 }}>{l.name}</b>
                {l.done ? (
                  <span className="badge badge-green"><CheckCircle2 size={11} /> Achieved</span>
                ) : (
                  <span className="badge badge-amber"><Clock size={11} /> Available</span>
                )}
              </div>
              <p className="text-2" style={{ fontSize: 13, marginTop: 6 }}>{l.desc}</p>
            </div>
            {!l.done && <button className="btn btn-ghost btn-sm">Start</button>}
          </div>
        ))}
      </div>

      <div className="disclaimer-box" style={{ marginTop: 20, maxWidth: 680 }}>
        <ShieldCheck size={15} />
        Verified information is labelled on-platform and distinguished from founder-provided information everywhere it
        appears.
      </div>
    </div>
  )
}
