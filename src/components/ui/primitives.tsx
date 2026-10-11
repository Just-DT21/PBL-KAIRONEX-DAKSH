import { useEffect, useRef, useState, type ReactNode } from 'react'
import { motion, useInView } from 'framer-motion'
import { BadgeCheck, ShieldCheck, FileCheck2, UserCheck } from 'lucide-react'
import type { VerificationLevel } from '../../data/types'

// ---------- Verification badges ----------
export function VerificationBadge({ level, size = 'sm' }: { level: VerificationLevel; size?: 'sm' | 'xs' }) {
  const cls = size === 'xs' ? 'badge badge-cyan' : 'badge badge-cyan'
  if (level === 'documents')
    return (
      <span className={cls}>
        <FileCheck2 size={11} /> Documents Verified
      </span>
    )
  if (level === 'company')
    return (
      <span className={cls}>
        <ShieldCheck size={11} /> Company Verified
      </span>
    )
  if (level === 'identity')
    return (
      <span className={cls}>
        <UserCheck size={11} /> Identity Verified
      </span>
    )
  return (
    <span className="badge" style={{ opacity: 0.7 }}>
      Unverified
    </span>
  )
}

// ---------- Founder-supplied tag ----------
export function FounderProvided({ children }: { children: ReactNode }) {
  return (
    <span className="badge" title="Information supplied by the founder; not independently verified by KAIRONEXA.">
      Founder-provided · {children}
    </span>
  )
}

// ---------- Scroll reveal ----------
export function Reveal({
  children,
  delay = 0,
  y = 26,
  className,
}: {
  children: ReactNode
  delay?: number
  y?: number
  className?: string
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, delay, ease: [0.22, 0.7, 0.25, 1] }}
    >
      {children}
    </motion.div>
  )
}

// ---------- Animated counter ----------
export function CountUp({
  to,
  duration = 1.6,
  format,
  className,
}: {
  to: number
  duration?: number
  format?: (n: number) => string
  className?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.2 })
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!inView) return
    let raf = 0
    const start = performance.now()
    const step = (now: number) => {
      const p = Math.min((now - start) / (duration * 1000), 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setVal(to * eased)
      if (p < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [inView, to, duration])
  return (
    <span ref={ref} className={className}>
      {format ? format(val) : Math.round(val).toLocaleString('en-IN')}
    </span>
  )
}

// ---------- Progress bar ----------
export function Progress({
  value,
  height = 10,
  showGlow = true,
}: {
  value: number
  height?: number
  showGlow?: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.2 })
  return (
    <div
      ref={ref}
      style={{
        height,
        borderRadius: 99,
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.07)',
        overflow: 'hidden',
        position: 'relative',
      }}
      role="progressbar"
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: inView ? `${Math.min(value, 100)}%` : 0 }}
        transition={{ duration: 1.4, ease: [0.22, 0.7, 0.25, 1] }}
        style={{
          height: '100%',
          borderRadius: 99,
          background: 'linear-gradient(90deg, #4c7dff, #7c5cff 60%, #3ee6d8)',
          boxShadow: showGlow ? '0 0 18px rgba(91,140,255,0.55)' : undefined,
        }}
      />
    </div>
  )
}

// ---------- Stat tile ----------
export function StatTile({
  label,
  value,
  sub,
  icon,
  accent = 'blue',
}: {
  label: string
  value: ReactNode
  sub?: ReactNode
  icon?: ReactNode
  accent?: 'blue' | 'violet' | 'cyan' | 'green' | 'amber'
}) {
  const accents: Record<string, string> = {
    blue: 'rgba(91,140,255,0.14)',
    violet: 'rgba(124,92,255,0.14)',
    cyan: 'rgba(62,230,216,0.12)',
    green: 'rgba(52,211,153,0.12)',
    amber: 'rgba(251,191,36,0.12)',
  }
  return (
    <div className="glass card-hover" style={{ padding: 20, display: 'flex', gap: 16, alignItems: 'flex-start' }}>
      {icon && (
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            display: 'grid',
            placeItems: 'center',
            background: accents[accent],
            color: 'var(--text-hi)',
            flex: 'none',
          }}
        >
          {icon}
        </div>
      )}
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 12, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>
          {label}
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, marginTop: 4, lineHeight: 1.15 }}>{value}</div>
        {sub && <div style={{ fontSize: 12.5, color: 'var(--text-2)', marginTop: 4 }}>{sub}</div>}
      </div>
    </div>
  )
}

// ---------- Match pill with score ----------
export function MatchPill({ score }: { score: number }) {
  return (
    <span className="match-pill" title="Discovery/research score based on stated preferences — not a prediction of performance.">
      <Sparkle /> {score}% Match
    </span>
  )
}

function Sparkle() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2l1.9 6.1L20 10l-6.1 1.9L12 18l-1.9-6.1L4 10l6.1-1.9L12 2z" />
    </svg>
  )
}

// ---------- Verified icon inline ----------
export function VerifiedIcon({ level }: { level: VerificationLevel }) {
  if (level === 'none') return null
  return <BadgeCheck size={15} color="var(--cyan)" style={{ display: 'inline', marginLeft: 5, verticalAlign: '-2px' }} aria-label="Verified" />
}

// ---------- Company logo avatar ----------
export function LogoAvatar({ name, hue, size = 46 }: { name: string; hue: number; size?: number }) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
  return (
    <div
      aria-hidden
      style={{
        width: size,
        height: size,
        borderRadius: Math.max(10, size * 0.26),
        flex: 'none',
        display: 'grid',
        placeItems: 'center',
        fontFamily: 'var(--font-display)',
        fontWeight: 700,
        fontSize: size * 0.34,
        color: '#eef2ff',
        background: `linear-gradient(135deg, hsl(${hue} 62% 26%), hsl(${(hue + 60) % 360} 58% 18%))`,
        border: `1px solid hsl(${hue} 70% 55% / 0.35)`,
        boxShadow: `0 4px 22px hsl(${hue} 80% 50% / 0.18)`,
      }}
    >
      {initials}
    </div>
  )
}
