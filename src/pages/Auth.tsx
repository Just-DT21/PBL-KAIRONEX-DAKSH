import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Rocket, Telescope, Mail, Lock, User, Phone, Building2, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react'
import { useApp } from '../state/AppContext'
import { Logo } from '../brand/Logo'
import type { Role } from '../data/types'

export default function Auth() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { login } = useApp()
  const [role, setRole] = useState<Role>((params.get('role') as Role) === 'investor' ? 'investor' : 'entrepreneur')
  const [mode, setMode] = useState<'login' | 'signup'>((params.get('mode') ?? 'login') as 'login' | 'signup')
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', company: '', reg: '' })
  const [error, setError] = useState('')

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value })

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.email.includes('@') || form.password.length < 6) {
      setError('Enter a valid email and a password of at least 6 characters.')
      return
    }
    login(role, mode === 'signup' ? form.name || undefined : undefined, form.email)
    navigate(role === 'investor' ? '/onboarding?type=investor' : '/onboarding?type=entrepreneur')
  }

  const demo = (r: Role) => {
    login(r)
    navigate(r === 'investor' ? '/dashboard/discover' : '/dashboard')
  }

  return (
    <div className="auth-wrap">
      {/* Left: brand value panel */}
      <div className="auth-side">
        <div className="auth-side-glow" aria-hidden />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Link to="/" className="logo" aria-label="KAIRONEXA home">
            <Logo size={32} stackedTagline />
          </Link>
          <h2 style={{ fontSize: 'clamp(26px, 3.4vw, 38px)', margin: '40px 0 14px' }}>
            {role === 'entrepreneur' ? (
              <>Present your company.<br /><span className="grad-text">Get discovered on merit.</span></>
            ) : (
              <>Discover opportunities.<br /><span className="grad-text">Built around your thesis.</span></>
            )}
          </h2>
          <p style={{ color: 'var(--text-1)', maxWidth: 380, fontSize: 15 }}>
            {role === 'entrepreneur'
              ? 'Publish your legally established business, add verified documents, and connect directly with investors — no brokers.'
              : 'Explore founder-published opportunities with AI-assisted discovery, transparent match factors and secure connections.'}
          </p>
          <div style={{ display: 'grid', gap: 12, marginTop: 34 }}>
            {(role === 'entrepreneur'
              ? ['Structured company profiles', 'Verification badges that mean something', 'Direct connections — no middlemen']
              : ['AI Match with transparent factor breakdowns', 'Founder-supplied vs verified labelling', 'Secure messaging with founders']
            ).map((t) => (
              <div key={t} style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 13.5, color: 'var(--text-1)' }}>
                <ShieldCheck size={15} color="var(--cyan)" /> {t}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: form */}
      <div className="auth-main">
        <div className="auth-card glass">
          <div className="role-toggle" role="tablist" aria-label="Account type">
            <button role="tab" aria-selected={role === 'entrepreneur'} className={role === 'entrepreneur' ? 'on' : ''} onClick={() => setRole('entrepreneur')}>
              <Rocket size={14} /> I'm an Entrepreneur
            </button>
            <button role="tab" aria-selected={role === 'investor'} className={role === 'investor' ? 'on' : ''} onClick={() => setRole('investor')}>
              <Telescope size={14} /> I'm an Investor
            </button>
          </div>

          <h1 style={{ fontSize: 26, marginBottom: 4 }}>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h1>
          <p className="text-2" style={{ fontSize: 13.5, marginBottom: 22 }}>
            {mode === 'login' ? 'Log in to continue to your dashboard.' : 'Two minutes to set up. Building your profile comes next.'}
          </p>

          <form onSubmit={submit} className="auth-form">
            {mode === 'signup' && (
              <label className="field">
                <span>Full name</span>
                <span className="input-icon"><User size={14} /><input required value={form.name} onChange={set('name')} placeholder={role === 'entrepreneur' ? 'Ananya Rao' : 'Nadia Qureshi'} /></span>
              </label>
            )}
            <label className="field">
              <span>Email</span>
              <span className="input-icon"><Mail size={14} /><input required type="email" value={form.email} onChange={set('email')} placeholder="you@company.com" /></span>
            </label>
            <div className="field-row">
              {mode === 'signup' && (
                <label className="field">
                  <span>Phone</span>
                  <span className="input-icon"><Phone size={14} /><input value={form.phone} onChange={set('phone')} placeholder="+91 98XXX XXXXX" /></span>
                </label>
              )}
              <label className="field" style={{ flex: 1 }}>
                <span>Password</span>
                <span className="input-icon"><Lock size={14} /><input required type="password" value={form.password} onChange={set('password')} placeholder="••••••••" minLength={6} /></span>
              </label>
            </div>
            {mode === 'signup' && role === 'entrepreneur' && (
              <div className="field-row">
                <label className="field" style={{ flex: 1 }}>
                  <span>Company</span>
                  <span className="input-icon"><Building2 size={14} /><input value={form.company} onChange={set('company')} placeholder="NOVA Robotics" /></span>
                </label>
                <label className="field" style={{ flex: 1 }}>
                  <span>Company registration no. (CIN)</span>
                  <input value={form.reg} onChange={set('reg')} placeholder="U29299KA2023PTC000000" />
                </label>
              </div>
            )}
            {mode === 'signup' && role === 'investor' && (
              <label className="field">
                <span>Investor type</span>
                <select defaultValue="Angel Investor">
                  <option>Angel Investor</option>
                  <option>Venture Capital</option>
                  <option>Investment Firm</option>
                  <option>Family Office</option>
                  <option>Corporate Investor</option>
                  <option>Other</option>
                </select>
              </label>
            )}

            {error && <div className="form-error" role="alert">{error}</div>}

            <button className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 6 }}>
              {mode === 'login' ? 'Log In' : 'Create Account'} <ArrowRight size={15} />
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '18px 0' }}>
            <span style={{ height: 1, background: 'var(--border)', flex: 1 }} />
            <span style={{ fontSize: 11.5, color: 'var(--text-3)' }}>PROTOTYPE</span>
            <span style={{ height: 1, background: 'var(--border)', flex: 1 }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <button className="btn btn-ghost" onClick={() => demo('entrepreneur')}>
              <Sparkles size={14} /> Demo: Founder
            </button>
            <button className="btn btn-ghost" onClick={() => demo('investor')}>
              <Sparkles size={14} /> Demo: Investor
            </button>
          </div>

          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-2)', marginTop: 18 }}>
            {mode === 'login' ? (
              <>New to KAIRONEXA?{' '}<button className="linklike" onClick={() => setMode('signup')}>Create an account</button></>
            ) : (
              <>Already have an account?{' '}<button className="linklike" onClick={() => setMode('login')}>Log in</button></>
            )}
          </p>
          <p style={{ textAlign: 'center', fontSize: 11.5, color: 'var(--text-3)', marginTop: 14 }}>
            By continuing you agree to the prototype <Link to="/legal/terms" className="linklike">Terms</Link> and acknowledge the{' '}
            <Link to="/legal/risk-disclosure" className="linklike">Risk Disclosure</Link>. Demo environment — no real data is stored.
          </p>
        </div>
      </div>
    </div>
  )
}
