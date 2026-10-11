import { useState } from 'react'
import { Save, Eye, Plus, X } from 'lucide-react'
import { useApp } from '../../state/AppContext'
import { inr } from '../../data/format'

const MY_COMPANY_ID = 'nova-robotics'

export default function EntCompany() {
  const { companies, updateCompany } = useApp()
  const company = companies.find((c) => c.id === MY_COMPANY_ID)!
  const [savedFlash, setSavedFlash] = useState(false)

  const [form, setForm] = useState({
    tagline: company.tagline,
    description: company.description,
    problem: company.problem ?? '',
    solution: company.solution ?? '',
    teamSize: String(company.teamSize),
    minInvestment: String(company.minInvestment),
  })

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [k]: e.target.value })

  function save() {
    updateCompany(MY_COMPANY_ID, {
      tagline: form.tagline,
      description: form.description,
      problem: form.problem,
      solution: form.solution,
      teamSize: Number(form.teamSize) || company.teamSize,
      minInvestment: Number(form.minInvestment) || company.minInvestment,
    })
    setSavedFlash(true)
    setTimeout(() => setSavedFlash(false), 2200)
  }

  return (
    <div className="dash-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h1 className="dash-title">My Company</h1>
          <p className="text-2" style={{ fontSize: 13.5 }}>
            {company.name} · changes publish instantly to your investor-facing profile.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {savedFlash && <span className="badge badge-green">Saved ✓</span>}
          <button className="btn btn-primary" onClick={save}><Save size={14} /> Save changes</button>
        </div>
      </div>

      <div className="dash-grid2" style={{ marginTop: 20 }}>
        <div className="glass" style={{ padding: 20, display: 'grid', gap: 14 }}>
          <label className="field"><span>Tagline</span><input value={form.tagline} onChange={set('tagline')} /></label>
          <label className="field">
            <span>Description</span>
            <textarea rows={4} value={form.description} onChange={set('description')} />
          </label>
          <label className="field"><span>Problem</span><textarea rows={3} value={form.problem} onChange={set('problem')} /></label>
          <label className="field"><span>Solution</span><textarea rows={3} value={form.solution} onChange={set('solution')} /></label>
        </div>

        <div style={{ display: 'grid', gap: 18, alignContent: 'start' }}>
          <div className="glass" style={{ padding: 20, display: 'grid', gap: 14 }}>
            <label className="field"><span>Team size</span><input value={form.teamSize} onChange={set('teamSize')} /></label>
            <label className="field"><span>Minimum investment (₹)</span><input value={form.minInvestment} onChange={set('minInvestment')} /></label>
            <div className="traction-row"><span className="text-2">Valuation</span><b>{inr(company.valuation)}</b></div>
            <div className="traction-row"><span className="text-2">Funding target</span><b>{inr(company.fundingTarget)}</b></div>
          </div>

          <div className="glass" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <b style={{ fontFamily: 'var(--font-display)', fontSize: 15 }}>Traction</b>
              <button className="btn btn-ghost btn-sm"><Plus size={13} /> Add</button>
            </div>
            <div style={{ display: 'grid', gap: 8 }}>
              {company.traction.map((t) => (
                <div key={t.label} className="traction-row">
                  <span className="text-2">{t.label}</span>
                  <span style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <b style={{ fontSize: 13 }}>{t.value}</b>
                    <X size={13} color="var(--text-3)" style={{ cursor: 'pointer' }} />
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass" style={{ padding: 20 }}>
            <b style={{ fontFamily: 'var(--font-display)', fontSize: 15 }}>Preview</b>
            <p className="text-2" style={{ fontSize: 12.5, margin: '8px 0 12px' }}>
              Investors see this live on your public profile.
            </p>
            <button className="btn btn-ghost btn-sm" onClick={() => window.open(`/startups/${company.id}`, '_self')}>
              <Eye size={13} /> Open public profile
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
