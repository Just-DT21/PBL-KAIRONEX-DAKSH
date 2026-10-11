import { useState } from 'react'
import {
  ShieldCheck,
  Flag,
  Users,
  Building2,
  BarChart3,
  Settings as SettingsIcon,
  Check,
  X,
  Eye,
} from 'lucide-react'
import { useApp } from '../state/AppContext'
import { inr, timeAgo } from '../data/format'
import { CountUp, StatTile } from '../components/ui/primitives'
import { AreaChart } from '../components/dashboard/charts'

type Tab = 'verification' | 'reports' | 'users' | 'companies' | 'analytics' | 'settings'

export default function Admin() {
  const [tab, setTab] = useState<Tab>('verification')
  const { verifications, setVerificationStatus, reports, setReportStatus, companies } = useApp()

  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'verification', label: 'Verification Queue', icon: <ShieldCheck size={15} /> },
    { id: 'reports', label: 'Reports', icon: <Flag size={15} /> },
    { id: 'users', label: 'User Management', icon: <Users size={15} /> },
    { id: 'companies', label: 'Company Management', icon: <Building2 size={15} /> },
    { id: 'analytics', label: 'Platform Analytics', icon: <BarChart3 size={15} /> },
    { id: 'settings', label: 'Platform Settings', icon: <SettingsIcon size={15} /> },
  ]

  return (
    <div className="page-pad">
      <div className="container">
        <div className="eyebrow">Trust operations</div>
        <h1 className="page-title">Admin Console</h1>
        <p className="page-sub" style={{ marginBottom: 24 }}>
          Moderation and verification tooling for the prototype. All actions are simulated and reset on reload.
        </p>

        <div className="tabs" style={{ marginBottom: 22 }}>
          {TABS.map((t) => (
            <button key={t.id} className={`tab ${tab === t.id ? 'on' : ''}`} onClick={() => setTab(t.id)}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {tab === 'verification' && (
          <div style={{ display: 'grid', gap: 12 }}>
            {verifications.map((v) => (
              <div key={v.id} className="glass" style={{ padding: 18, display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ flex: 1, minWidth: 240 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <b style={{ fontSize: 14 }}>{v.subject}</b>
                    <span className="badge badge-blue">{v.kind}</span>
                    <span className={`badge ${v.status === 'Approved' ? 'badge-green' : v.status === 'Rejected' ? 'badge-red' : 'badge-amber'}`}>{v.status}</span>
                  </div>
                  <div className="text-2" style={{ fontSize: 12, marginTop: 4 }}>
                    {v.submittedBy} · {timeAgo(v.submittedAt)} · {v.docs.length} documents
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                    {v.docs.map((d) => <span key={d} className="badge">{d}</span>)}
                  </div>
                </div>
                {v.status === 'Pending' ? (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-primary btn-sm" onClick={() => setVerificationStatus(v.id, 'Approved')}><Check size={13} /> Approve</button>
                    <button className="btn btn-danger btn-sm" onClick={() => setVerificationStatus(v.id, 'Rejected')}><X size={13} /> Reject</button>
                  </div>
                ) : (
                  <span className="text-2" style={{ fontSize: 12 }}>Reviewed</span>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === 'reports' && (
          <div style={{ display: 'grid', gap: 12 }}>
            {reports.map((r) => (
              <div key={r.id} className="glass" style={{ padding: 18, display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ flex: 1, minWidth: 240 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <b style={{ fontSize: 14 }}>{r.target}</b>
                    <span className="badge badge-red">{r.kind}</span>
                    <span className={`badge ${r.status === 'Resolved' ? 'badge-green' : r.status === 'Reviewing' ? 'badge-amber' : 'badge-blue'}`}>{r.status}</span>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-1)', marginTop: 6 }}>{r.detail}</div>
                  <div className="text-2" style={{ fontSize: 12, marginTop: 4 }}>{r.reason} · {timeAgo(r.createdAt)}</div>
                </div>
                {r.status !== 'Resolved' && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => setReportStatus(r.id, 'Reviewing')}>Mark reviewing</button>
                    <button className="btn btn-primary btn-sm" onClick={() => setReportStatus(r.id, 'Resolved')}><Check size={13} /> Resolve</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === 'users' && (
          <div className="glass" style={{ padding: 6 }}>
            <table className="admin-table">
              <thead>
                <tr><th>User</th><th>Role</th><th>Verification</th><th>Joined</th><th>Status</th><th /></tr>
              </thead>
              <tbody>
                {[
                  { name: 'Ananya Rao', role: 'Entrepreneur', v: 'documents', at: '34d', status: 'Active' },
                  { name: 'Rohan Kulkarni', role: 'Entrepreneur', v: 'documents', at: '21d', status: 'Active' },
                  { name: 'Karthik Srinivasan', role: 'Investor', v: 'documents', at: '60d', status: 'Active' },
                  { name: 'Ruchi Malhotra', role: 'Investor', v: 'identity', at: '45d', status: 'Review' },
                  { name: 'investor_purple@mail.com', role: 'Investor', v: 'none', at: '3d', status: 'Suspended' },
                  { name: 'Devika Nair', role: 'Entrepreneur', v: 'company', at: '9d', status: 'Active' },
                ].map((u) => (
                  <tr key={u.name}>
                    <td><b style={{ fontSize: 13 }}>{u.name}</b></td>
                    <td><span className="badge badge-blue">{u.role}</span></td>
                    <td><span className="text-2" style={{ fontSize: 12.5 }}>{u.v}</span></td>
                    <td><span className="text-2" style={{ fontSize: 12.5 }}>{u.at} ago</span></td>
                    <td>
                      <span className={`badge ${u.status === 'Active' ? 'badge-green' : u.status === 'Review' ? 'badge-amber' : 'badge-red'}`}>{u.status}</span>
                    </td>
                    <td><button className="icon-btn" aria-label="View user"><Eye size={15} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'companies' && (
          <div className="glass" style={{ padding: 6 }}>
            <table className="admin-table">
              <thead>
                <tr><th>Company</th><th>Stage</th><th>Target</th><th>Verification</th><th>Status</th><th /></tr>
              </thead>
              <tbody>
                {companies.map((c) => (
                  <tr key={c.id}>
                    <td><b style={{ fontSize: 13 }}>{c.name}</b></td>
                    <td><span className="text-2" style={{ fontSize: 12.5 }}>{c.stage}</span></td>
                    <td><span className="text-2" style={{ fontSize: 12.5 }}>{inr(c.fundingTarget)}</span></td>
                    <td><span className="text-2" style={{ fontSize: 12.5 }}>{c.verification}</span></td>
                    <td><span className="badge badge-green">Listed</span></td>
                    <td><button className="icon-btn" aria-label="View company"><Eye size={15} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'analytics' && (
          <div>
            <div className="dash-stats">
              <StatTile label="Total users" value={<CountUp to={16840} />} sub="+412 this month (demo)" icon={<Users size={18} />} />
              <StatTile label="Published opportunities" value={<CountUp to={companies.length} />} sub="live listings" icon={<Building2 size={18} />} accent="violet" />
              <StatTile label="Connections (30d)" value={<CountUp to={318} />} sub="accepted + pending" icon={<ShieldCheck size={18} />} accent="cyan" />
              <StatTile label="Open reports" value={<CountUp to={reports.filter((r) => r.status !== 'Resolved').length} />} sub="median response 9h" icon={<Flag size={18} />} accent="amber" />
            </div>
            <div className="glass" style={{ padding: 20, marginTop: 18 }}>
              <b style={{ fontFamily: 'var(--font-display)' }}>Signups & listing activity</b>
              <p className="text-2" style={{ fontSize: 12, marginBottom: 10 }}>Demo series — weekly, last 12 weeks</p>
              <AreaChart data={[120, 150, 140, 190, 220, 210, 260, 300, 290, 340, 380, 420]} label="Weekly signups (demo)" />
            </div>
            <p className="demo-tag" style={{ marginTop: 14 }}>Demo analytics · sample data</p>
          </div>
        )}

        {tab === 'settings' && (
          <div className="glass" style={{ padding: 22, maxWidth: 620, display: 'grid', gap: 16 }}>
            <b style={{ fontFamily: 'var(--font-display)' }}>Platform settings</b>
            {[
              'Featured opportunities carousel — enabled',
              'Auto-suspension on 3+ upheld reports — enabled',
              'New-listing review window — 24h',
              'Document watermarking — enabled',
              'Investor accreditation check (production) — pending legal review',
            ].map((s) => (
              <div key={s} className="traction-row">
                <span className="text-1" style={{ fontSize: 13.5 }}>{s}</span>
                <span className="badge badge-green">On</span>
              </div>
            ))}
            <p className="text-2" style={{ fontSize: 12 }}>Prototype settings are illustrative and non-persistent.</p>
          </div>
        )}
      </div>
    </div>
  )
}
