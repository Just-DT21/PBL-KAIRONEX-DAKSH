import { FileText, Upload, ShieldCheck, Lock } from 'lucide-react'
import { useApp } from '../../state/AppContext'

const MY_COMPANY_ID = 'nova-robotics'

export default function EntDocuments() {
  const { companies } = useApp()
  const company = companies.find((c) => c.id === MY_COMPANY_ID)!

  return (
    <div className="dash-page">
      <h1 className="dash-title">Documents</h1>
      <p className="text-2" style={{ fontSize: 13.5 }}>
        Pitch materials and company documents. Investors can request access; accepted connections can view what you
        approve.
      </p>

      <div className="glass" style={{ padding: 22, marginTop: 20, display: 'grid', gap: 12 }}>
        {company.documents.map((d) => (
          <div key={d.name} className="doc-row glass" style={{ padding: 14 }}>
            <FileText size={18} color="var(--blue)" />
            <div style={{ flex: 1 }}>
              <b style={{ fontSize: 13.5 }}>{d.name}</b>
              <div style={{ fontSize: 12, color: 'var(--text-2)' }}>{d.kind} · shared with 2 accepted connections</div>
            </div>
            <span className="badge badge-cyan"><ShieldCheck size={11} /> On file</span>
          </div>
        ))}
        <button className="btn btn-ghost" style={{ borderStyle: 'dashed', padding: 14 }}>
          <Upload size={14} /> Upload new document
        </button>
      </div>

      <div className="glass" style={{ padding: 20, marginTop: 18, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <Lock size={16} color="var(--cyan)" style={{ flex: 'none', marginTop: 2 }} />
        <p className="text-1" style={{ fontSize: 13 }}>
          In production, documents are encrypted at rest, watermarked per viewer, and access is logged. The prototype
          stores nothing — sample documents only.
        </p>
      </div>
    </div>
  )
}
