import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, ChevronLeft, Rocket, Telescope } from 'lucide-react'
import { useApp } from '../state/AppContext'

const ENT_STEPS = [
  'Personal Information',
  'Company Information',
  'Legal Verification',
  'Business Information',
  'Funding Information',
  'Pitch',
  'Documents',
  'Publish',
]
const INV_STEPS = [
  'Personal Information',
  'Investor Type',
  'Investment Range',
  'Industries & Geography',
  'Stage Preferences',
  'Business Model',
  'Review & Confirm',
]

export default function Onboarding() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { user, setInvestorPrefs } = useApp()
  const isInvestor = params.get('type') === 'investor' || user?.role === 'investor'
  const steps = isInvestor ? INV_STEPS : ENT_STEPS
  const [step, setStep] = useState(0)
  const [prefs, setPrefs] = useState({
    min: 20,
    max: 50,
    industries: ['Robotics', 'AI'] as string[],
    stages: ['Seed'] as string[],
    geo: ['India'] as string[],
    models: ['B2B'] as string[],
  })

  const pctDone = Math.round(((step + 1) / steps.length) * 100)

  function finish() {
    if (isInvestor) {
      setInvestorPrefs({
        rawQuery: `Investing ₹${prefs.min}L–₹${prefs.max}L in ${prefs.stages.join('/')} ${prefs.industries.join(' & ')} startups in ${prefs.geo.join(', ')}.`,
        range: { min: prefs.min * 100000, max: prefs.max * 100000 },
        industries: prefs.industries,
        stages: prefs.stages as never,
        geography: prefs.geo,
        audience: prefs.models as never,
        riskAppetite: 'Balanced',
      })
    }
    navigate(isInvestor ? '/dashboard/discover' : '/dashboard')
  }

  const toggle = (arr: string[], v: string, set: (a: string[]) => void) =>
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v])

  return (
    <div className="onb-wrap">
      <div className="onb-card glass">
        <div className="onb-head">
          <span className="onb-icon">{isInvestor ? <Telescope size={20} /> : <Rocket size={20} />}</span>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 22 }}>
              {isInvestor ? 'Build Your Investment Profile' : 'Complete Your Company Profile'}
            </h1>
            <p className="text-2" style={{ fontSize: 13 }}>
              {isInvestor
                ? 'These preferences power AI Match — the discovery engine surfaces opportunities that overlap them.'
                : 'Structured information builds investor trust. You can edit everything later from your dashboard.'}
            </p>
          </div>
          <div className="onb-progress-num">{pctDone}%</div>
        </div>

        <div className="onb-steps">
          {steps.map((s, i) => (
            <div key={s} className={`onb-step ${i < step ? 'done' : i === step ? 'now' : ''}`}>
              <span className="onb-dot">{i < step ? <Check size={10} /> : i + 1}</span>
              <span className="onb-label">{s}</span>
            </div>
          ))}
        </div>

        <div className="onb-body" style={{ minHeight: 320 }}>
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 22 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -22 }} transition={{ duration: 0.25 }}>
              {isInvestor ? <InvStep step={step} prefs={prefs} setPrefs={setPrefs} toggle={toggle} /> : <EntStep step={step} />}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="onb-foot">
          <button className="btn btn-ghost" onClick={() => (step === 0 ? navigate(-1) : setStep(step - 1))}>
            <ChevronLeft size={15} /> {step === 0 ? 'Cancel' : 'Back'}
          </button>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-ghost" onClick={() => navigate(isInvestor ? '/dashboard/discover' : '/dashboard')}>
              Skip for now
            </button>
            {step < steps.length - 1 ? (
              <button className="btn btn-primary" onClick={() => setStep(step + 1)}>Continue</button>
            ) : (
              <button className="btn btn-primary" onClick={finish}>
                {isInvestor ? 'Enter Discovery' : 'Publish & Go to Dashboard'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({ label, placeholder, type = 'text' }: { label: string; placeholder?: string; type?: string }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input type={type} placeholder={placeholder} />
    </label>
  )
}

function EntStep({ step }: { step: number }) {
  switch (step) {
    case 0:
      return (
        <div className="onb-grid2">
          <Field label="Full name" placeholder="Ananya Rao" />
          <Field label="Role / title" placeholder="Co-founder & CEO" />
          <Field label="Email" placeholder="you@company.com" />
          <Field label="Phone" placeholder="+91 98XXX XXXXX" />
        </div>
      )
    case 1:
      return (
        <div className="onb-grid2">
          <Field label="Company name" placeholder="NOVA Robotics" />
          <Field label="Tagline" placeholder="AI-powered warehouse robotics" />
          <label className="field" style={{ gridColumn: '1 / -1' }}>
            <span>What does your company do?</span>
            <textarea rows={4} placeholder="Two or three sentences, outcome-first." />
          </label>
          <Field label="Founded year" placeholder="2023" />
          <Field label="Team size" placeholder="14" />
        </div>
      )
    case 2:
      return (
        <div style={{ display: 'grid', gap: 16 }}>
          <p className="text-2" style={{ fontSize: 13.5 }}>
            Verification is optional but badged. Documents stay encrypted; reviewers only see masked copies. Verification
            confirms documents were checked — it is <b style={{ color: 'var(--text-1)' }}>not</b> an endorsement of the
            opportunity.
          </p>
          <div className="onb-grid2">
            <label className="field"><span>Company registration no. (CIN)</span><input placeholder="U29299KA2023PTC000000" /></label>
            <label className="field"><span>GSTIN (if applicable)</span><input placeholder="29ABCDE1234F1Z5" /></label>
          </div>
          <div className="upload-zone">
            <b>Certificate of Incorporation</b>
            <span className="text-2" style={{ fontSize: 12.5 }}>PDF up to 10 MB</span>
            <button className="btn btn-ghost btn-sm">Choose file</button>
          </div>
          <div className="upload-zone">
            <b>Founder ID (masked)</b>
            <span className="text-2" style={{ fontSize: 12.5 }}>Aadhaar / Passport / DL — we store a hash, not the document</span>
            <button className="btn btn-ghost btn-sm">Choose file</button>
          </div>
        </div>
      )
    case 3:
      return (
        <div className="onb-grid2">
          <Field label="Industry" placeholder="Robotics" />
          <Field label="Location" placeholder="Bengaluru, India" />
          <label className="field"><span>Business model</span><input placeholder="RaaS + software subscriptions" /></label>
          <label className="field">
            <span>Audience</span>
            <select><option>B2B</option><option>B2C</option><option>B2B2C</option><option>D2C</option></select>
          </label>
          <label className="field" style={{ gridColumn: '1 / -1' }}>
            <span>Traction highlights (one per line)</span>
            <textarea rows={3} placeholder={'12 paying warehouses\n38 robots deployed\n94% uptime'} />
          </label>
        </div>
      )
    case 4:
      return (
        <div className="onb-grid2">
          <Field label="Funding target (₹)" placeholder="20000000" />
          <Field label="Minimum investment (₹)" placeholder="500000" />
          <Field label="Valuation (₹)" placeholder="420000000" />
          <Field label="Equity offered (%)" placeholder="8" />
          <label className="field" style={{ gridColumn: '1 / -1' }}>
            <span>How will the funds be used?</span>
            <textarea rows={3} placeholder={'Product & engineering — 40%\nFleet manufacturing — 30%\nGo-to-market — 20%\nCompliance & ops — 10%'} />
          </label>
        </div>
      )
    case 5:
      return (
        <div style={{ display: 'grid', gap: 16 }}>
          <label className="field">
            <span>Pitch summary</span>
            <textarea rows={4} placeholder="The problem, your wedge, and why now." />
          </label>
          <div className="upload-zone">
            <b>Pitch deck</b>
            <span className="text-2" style={{ fontSize: 12.5 }}>PDF / PPTX up to 20 MB</span>
            <button className="btn btn-ghost btn-sm">Upload deck</button>
          </div>
        </div>
      )
    case 6:
      return (
        <div style={{ display: 'grid', gap: 12 }}>
          {['Pitch deck', 'Financial summary', 'Cap table (summary)', 'Product screenshots'].map((d) => (
            <div key={d} className="upload-zone" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <b style={{ fontSize: 13.5 }}>{d}</b>
              <button className="btn btn-ghost btn-sm">Upload</button>
            </div>
          ))}
        </div>
      )
    default:
      return (
        <div style={{ display: 'grid', gap: 14, textAlign: 'center', justifyItems: 'center', padding: '20px 0' }}>
          <span className="onb-publish-icon">🚀</span>
          <h3 style={{ fontSize: 19 }}>Ready to publish?</h3>
          <p className="text-2" style={{ fontSize: 13.5, maxWidth: 420 }}>
            Your opportunity will appear in investor discovery with your current verification level. You can pause or
            update it any time. Publishing presents your company — it does not constitute an offer of securities.
          </p>
        </div>
      )
  }
}

function InvStep({
  step,
  prefs,
  setPrefs,
  toggle,
}: {
  step: number
  prefs: { min: number; max: number; industries: string[]; stages: string[]; geo: string[]; models: string[] }
  setPrefs: (p: { min: number; max: number; industries: string[]; stages: string[]; geo: string[]; models: string[] }) => void
  toggle: (arr: string[], v: string, set: (a: string[]) => void) => void
}) {
  const INDUSTRIES = ['AI', 'Robotics', 'SaaS', 'Fintech', 'HealthTech', 'ClimateTech', 'AgriTech', 'Consumer', 'D2C', 'DevTools', 'FoodTech', 'TravelTech']
  const STAGES = ['Idea', 'Prototype', 'MVP', 'Seed', 'Series A', 'Series B', 'Growth']
  const GEO = ['India', 'Bengaluru', 'Mumbai', 'Delhi NCR', 'Singapore', 'US', 'UAE', 'UK']
  const MODELS = ['B2B', 'B2C', 'B2B2C', 'D2C']

  switch (step) {
    case 0:
      return (
        <div className="onb-grid2">
          <Field label="Full name" placeholder="Nadia Qureshi" />
          <Field label="Firm (optional)" placeholder="Lightning Rock" />
        </div>
      )
    case 1:
      return (
        <div className="onb-grid2">
          <label className="field">
            <span>Investor type</span>
            <select>
              <option>Angel Investor</option><option>Venture Capital</option><option>Investment Firm</option>
              <option>Family Office</option><option>Corporate Investor</option><option>Other</option>
            </select>
          </label>
          <Field label="Years investing" placeholder="6" />
        </div>
      )
    case 2:
      return (
        <div style={{ display: 'grid', gap: 18 }}>
          <div className="onb-grid2">
            <label className="field">
              <span>Minimum ticket (₹ lakhs)</span>
              <input type="number" value={prefs.min} onChange={(e) => setPrefs({ ...prefs, min: Number(e.target.value) })} />
            </label>
            <label className="field">
              <span>Maximum ticket (₹ lakhs)</span>
              <input type="number" value={prefs.max} onChange={(e) => setPrefs({ ...prefs, max: Number(e.target.value) })} />
            </label>
          </div>
          <div className="range-preview glass">
            Typical cheque: <b>₹{prefs.min}L – ₹{prefs.max}L</b>
          </div>
        </div>
      )
    case 3:
      return (
        <div style={{ display: 'grid', gap: 20 }}>
          <div>
            <div className="chip-grid-label">Industries</div>
            <div className="chip-grid">
              {INDUSTRIES.map((i) => (
                <button key={i} type="button" className={`chip ${prefs.industries.includes(i) ? 'on' : ''}`} onClick={() => toggle(prefs.industries, i, (a) => setPrefs({ ...prefs, industries: a }))}>{i}</button>
              ))}
            </div>
          </div>
          <div>
            <div className="chip-grid-label">Geography</div>
            <div className="chip-grid">
              {GEO.map((g) => (
                <button key={g} type="button" className={`chip ${prefs.geo.includes(g) ? 'on' : ''}`} onClick={() => toggle(prefs.geo, g, (a) => setPrefs({ ...prefs, geo: a }))}>{g}</button>
              ))}
            </div>
          </div>
        </div>
      )
    case 4:
      return (
        <div>
          <div className="chip-grid-label">Preferred stages</div>
          <div className="chip-grid">
            {STAGES.map((s) => (
              <button key={s} type="button" className={`chip ${prefs.stages.includes(s) ? 'on' : ''}`} onClick={() => toggle(prefs.stages, s, (a) => setPrefs({ ...prefs, stages: a }))}>{s}</button>
            ))}
          </div>
        </div>
      )
    case 5:
      return (
        <div>
          <div className="chip-grid-label">Preferred business models</div>
          <div className="chip-grid">
            {MODELS.map((m) => (
              <button key={m} type="button" className={`chip ${prefs.models.includes(m) ? 'on' : ''}`} onClick={() => toggle(prefs.models, m, (a) => setPrefs({ ...prefs, models: a }))}>{m}</button>
            ))}
          </div>
        </div>
      )
    default:
      return (
        <div className="glass" style={{ padding: 20, display: 'grid', gap: 10, fontSize: 13.5 }}>
          <div><span className="text-2">Typical cheque:</span> ₹{prefs.min}L – ₹{prefs.max}L</div>
          <div><span className="text-2">Industries:</span> {prefs.industries.join(', ') || 'Any'}</div>
          <div><span className="text-2">Stages:</span> {prefs.stages.join(', ') || 'Any'}</div>
          <div><span className="text-2">Geography:</span> {prefs.geo.join(', ') || 'Anywhere'}</div>
          <div><span className="text-2">Models:</span> {prefs.models.join(', ') || 'Any'}</div>
          <p className="text-2" style={{ fontSize: 12, marginTop: 6 }}>
            You can refine these any time — AI Match updates immediately. Preferences are used for discovery only.
          </p>
        </div>
      )
  }
}
