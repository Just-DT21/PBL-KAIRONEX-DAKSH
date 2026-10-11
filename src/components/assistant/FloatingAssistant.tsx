import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Bot, Send, X, Sparkles, Maximize2, Minimize2 } from 'lucide-react'
import { useApp } from '../../state/AppContext'
import { inr } from '../../data/format'

interface ChatMsg {
  id: number
  from: 'nexa' | 'user'
  text: string
}

let mid = 0

export default function FloatingAssistant() {
  const { user, companies, investorPrefs } = useApp()
  const [open, setOpen] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [input, setInput] = useState('')
  const [msgs, setMsgs] = useState<ChatMsg[]>([])
  const listRef = useRef<HTMLDivElement>(null)

  const isInvestor = user?.role === 'investor'
  const myCompany = companies[0]

  const suggestions = useMemo(() => {
    if (isInvestor) {
      return [
        'Summarize NOVA Robotics for me',
        'Compare Quantifly vs Tessellate metrics',
        `Find startups matching: ${investorPrefs.rawQuery ?? 'my preferences'}`,
        'Which startups are pre-revenue?',
      ]
    }
    return [
      'How complete is my company profile?',
      'Improve my company description',
      'What should I prepare for investor questions?',
      'Explain how my funding requirement reads to investors',
    ]
  }, [isInvestor, investorPrefs.rawQuery])

  useEffect(() => {
    if (open && msgs.length === 0) {
      setMsgs([
        {
          id: ++mid,
          from: 'nexa',
          text: `Hi${user ? ' ' + user.name.split(' ')[0] : ''}! I'm NEXA, your KAIRONEXA research assistant. How can I help you discover the right opportunity? ${
            isInvestor
              ? 'I can summarize startup profiles, compare the metrics founders have provided, and surface opportunities that fit your stated preferences.'
              : 'I can help you structure your company profile, review completeness, and prepare for investor questions.'
          } I only work with the information on-platform — I never invent financial data.`,
        },
      ])
    }
  }, [open, user, isInvestor, msgs.length])

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [msgs, open])

  function answer(qRaw: string): string {
    const q = qRaw.toLowerCase()

    // Investor: summarize a startup by name
    const company = companies.find((c) => q.includes(c.name.toLowerCase()) || q.includes(c.name.toLowerCase().split(' ')[0]))
    if (isInvestor && company && (q.includes('summar') || q.includes('about') || q.includes('overview'))) {
      const facts = company.traction.slice(0, 3).map((t) => `${t.label}: ${t.value}`).join('; ')
      return [
        `${company.name} — ${company.tagline} (${company.stage}, ${company.location}).`,
        company.description,
        facts ? `Founder-reported traction — ${facts}.` : '',
        `Funding: seeking ${inr(company.fundingTarget)}, ${inr(company.fundingRaised)} committed so far, minimum ticket ${inr(company.minInvestment)}.`,
        `Verification: ${company.verification === 'documents' ? 'documents verified' : company.verification === 'company' ? 'company verified' : company.verification === 'identity' ? 'identity verified' : 'unverified'}. All figures are founder-supplied.`,
        `Open their profile to review the AI Opportunity Summary, documents and team. I can also compare two startups side by side if you name them.`,
      ].filter(Boolean).join('\n\n')
    }

    // Investor: compare two startups
    const mentioned = companies.filter((c) => q.includes(c.name.toLowerCase()))
    if (isInvestor && mentioned.length >= 2 && (q.includes('compare') || q.includes(' vs '))) {
      const [a, b] = mentioned
      const row = (label: string, av: string, bv: string) => `${label}: ${a.name} — ${av} · ${b.name} — ${bv}`
      return [
        `Founder-supplied comparison, ${a.name} vs ${b.name}:`,
        row('Stage', a.stage, b.stage),
        row('Funding target', inr(a.fundingTarget), inr(b.fundingTarget)),
        row('Raised', inr(a.fundingRaised), inr(b.fundingRaised)),
        row('Revenue', a.revenue ? `${inr(a.revenue)} ARR` : 'Pre-revenue', b.revenue ? `${inr(b.revenue)} ARR` : 'Pre-revenue'),
        row('Min ticket', inr(a.minInvestment), inr(b.minInvestment)),
        `This is an informational comparison of founder-reported data only — not an assessment of which is the better investment.`,
      ].join('\n')
    }

    // Investor: match preferences
    if (isInvestor && (q.includes('match') || q.includes('find') || q.includes('looking for'))) {
      const range = investorPrefs.range
      const fits = companies
        .filter((c) => (!range || (c.minInvestment >= range.min * 0.5 && c.minInvestment <= range.max)) &&
          (investorPrefs.industries.length === 0 || investorPrefs.industries.some((i) => c.industry.toLowerCase().includes(i.toLowerCase()) || c.sectorTags.some((t) => t.toLowerCase().includes(i.toLowerCase())))))
        .slice(0, 4)
        .map((c) => `${c.name} (${c.stage}, seeking ${inr(c.fundingTarget)})`)
      return fits.length
        ? `Based on your saved preferences — ${investorPrefs.rawQuery ?? 'your filters'} — these founder-published opportunities overlap: ${fits.join(', ')}. Open AI Match to see the factor-by-factor breakdown. Remember: this is discovery assistance, not investment advice.`
        : `No published opportunities currently overlap your saved preferences. Try widening the range or industries in AI Match.`
    }

    if (isInvestor && q.includes('pre-revenue')) {
      const pre = companies.filter((c) => !c.revenue)
      return pre.length
        ? `Founder-published opportunities currently showing pre-revenue: ${pre.map((c) => `${c.name} (${c.stage})`).join(', ')}. Their traction sections describe what they've validated instead.`
        : `Every currently published opportunity reports some revenue. Filter by stage to find earlier companies.`
    }

    // Entrepreneur: profile completeness
    if (!isInvestor && (q.includes('complete') || q.includes('profile'))) {
      return `Your ${myCompany?.name ?? 'company'} profile is 87% complete — strong overall. Missing items the platform recommends: audited financials (Documents), a 60-second founder video (Pitch), and two reference customers under Traction. Completing these historically improves investor visibility. Open Dashboard → Verification to see document status.`
    }

    // Entrepreneur: improve description
    if (!isInvestor && (q.includes('improve') || q.includes('description'))) {
      return `Your current opener — “${myCompany?.tagline}” — is clear. To sharpen it: lead with the outcome customers buy (“run 24/7 without expanding headcount”), quantify the wedge (12 warehouses, 38 robots), and end with the ask (₹2 Cr to scale fleet manufacturing). I've kept every fact from your profile; nothing added.`
    }

    // Entrepreneur: investor questions prep
    if (!isInvestor && (q.includes('investor questions') || q.includes('prepare'))) {
      return `Based on your profile, expect questions on: (1) fleet capex recovery per robot, (2) the 26-pilot pipeline — conversion assumptions, (3) WMS integration depth vs. competitors, (4) manufacturing scaling risk, (5) how the ₹2 Cr maps to the 40/30/20/10 use-of-funds split. I pulled each from your published information — anticipate and pre-answer them in your FAQ.`
    }

    // Entrepreneur: funding requirement readability
    if (!isInvestor && q.includes('funding')) {
      return `Your ask reads clearly: seeking ${inr(myCompany?.fundingTarget ?? 0)} at ${inr(myCompany?.valuation ?? 0)} valuation, minimum ticket ${inr(myCompany?.minInvestment ?? 0)}. Investors see the use-of-funds split as the credibility signal — yours is specific (product 40%, fleet 30%, GTM 20%, compliance 10%). Consider adding a quarterly milestone view so investors can track deployment.`
    }

    if (q.includes('hello') || q.includes('hi')) {
      return `Hello! Ask me to summarize a startup, compare metrics founders have provided, or review your profile completeness. I use only on-platform information.`
    }

    return `I can help with that using information published on KAIRONEXA. Try asking me to:\n• Summarize a startup profile (investors)\n• Compare two startups' founder-reported metrics\n• Surface opportunities overlapping your preferences\n• Review your company profile completeness (founders)\n\nI don't provide investment advice, and I never invent financial data — if something isn't on the platform, I'll say so.`
  }

  function send(text?: string) {
    const q = (text ?? input).trim()
    if (!q) return
    const um: ChatMsg = { id: ++mid, from: 'user', text: q }
    setMsgs((m) => [...m, um])
    setInput('')
    setTimeout(() => {
      setMsgs((m) => [...m, { id: ++mid, from: 'nexa', text: answer(q) }])
    }, 420)
  }

  return (
    <>
      <motion.button
        className="nexa-fab"
        onClick={() => setOpen(!open)}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        aria-label="Open NEXA AI assistant"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X size={21} />
            </motion.span>
          ) : (
            <motion.span key="bot" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <Bot size={21} />
            </motion.span>
          )}
        </AnimatePresence>
        <span className="nexa-fab-ring" aria-hidden />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.22, ease: [0.22, 0.7, 0.25, 1] }}
            className={`glass nexa-panel ${expanded ? 'expanded' : ''}`}
            role="dialog"
            aria-label="NEXA AI assistant"
          >
            <div className="nexa-head">
              <span className="nexa-avatar"><Sparkles size={16} /></span>
              <div style={{ flex: 1 }}>
                <b style={{ fontFamily: 'var(--font-display)', fontSize: 14.5, letterSpacing: '0.06em' }}>NEXA AI</b>
                <div style={{ fontSize: 11, color: 'var(--text-2)' }}>
                  {isInvestor ? 'KAIRONEXA investment research assistant' : 'KAIRONEXA founder assistant'} · prototype, canned demo responses
                </div>
              </div>
              <button className="icon-btn" onClick={() => setExpanded(!expanded)} aria-label={expanded ? 'Collapse panel' : 'Expand panel'}>
                {expanded ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
              </button>
            </div>

            <div className="nexa-msgs" ref={listRef}>
              {msgs.map((m) => (
                <div key={m.id} className={`nexa-msg ${m.from}`}>
                  {m.text.split('\n').map((line, i) => (
                    <p key={i} style={{ margin: i ? '6px 0 0' : 0 }}>{line}</p>
                  ))}
                </div>
              ))}
              <div className="nexa-chips">
                {suggestions.slice(0, 3).map((s) => (
                  <button key={s} className="nexa-chip" onClick={() => send(s)}>{s}</button>
                ))}
              </div>
            </div>

            <form
              className="nexa-input"
              onSubmit={(e) => { e.preventDefault(); send() }}
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isInvestor ? 'Ask about any startup or metric…' : 'Ask about your profile or pitch…'}
                aria-label="Message NEXA"
              />
              <button className="btn btn-primary" style={{ padding: '9px 14px' }} aria-label="Send">
                <Send size={15} />
              </button>
            </form>
            <div className="nexa-foot">
              Informational only — not investment advice. NEXA only reports information published on the platform.
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
