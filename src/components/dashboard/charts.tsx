import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'

export function AreaChart({ data, height = 140, label }: { data: number[]; height?: number; label?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true })
  const w = 520
  const max = Math.max(...data, 1)
  const min = Math.min(...data, 0)
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w
    const y = height - ((v - min) / (max - min || 1)) * (height - 18) - 9
    return [x, y] as const
  })
  const path = pts.map(([x, y], i) => (i === 0 ? `M${x},${y}` : `L${x},${y}`)).join(' ')
  const area = `${path} L${w},${height} L0,${height} Z`

  return (
    <div ref={ref}>
      <svg viewBox={`0 0 ${w} ${height}`} style={{ width: '100%', height: 'auto' }} aria-label={label} role="img">
        <defs>
          <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#5b8cff" stopOpacity="0.35" />
            <stop offset="1" stopColor="#5b8cff" stopOpacity="0" />
          </linearGradient>
        </defs>
        {inView && (
          <motion.path d={area} fill="url(#ag)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} />
        )}
        {inView && (
          <motion.path
            d={path}
            fill="none"
            stroke="#6a93ff"
            strokeWidth="2.2"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.4, ease: 'easeOut' }}
          />
        )}
      </svg>
    </div>
  )
}

export function BarChart({ data, labels, height = 150 }: { data: number[]; labels: string[]; height?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true })
  const max = Math.max(...data, 1)
  return (
    <div ref={ref} style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height }}>
      {data.map((v, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end' }}>
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: inView ? `${(v / max) * 100}%` : 0 }}
            transition={{ duration: 0.9, delay: i * 0.06, ease: [0.22, 0.7, 0.25, 1] }}
            style={{
              width: '100%',
              maxWidth: 38,
              borderRadius: '8px 8px 3px 3px',
              background: 'linear-gradient(180deg, #6a93ff, #4c5fd7)',
              boxShadow: '0 0 14px rgba(91,140,255,0.25)',
            }}
          />
          <span style={{ fontSize: 10.5, color: 'var(--text-3)' }}>{labels[i]}</span>
        </div>
      ))}
    </div>
  )
}

export function Donut({ data, size = 150 }: { data: { label: string; value: number; color: string }[]; size?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true })
  const total = data.reduce((a, d) => a + d.value, 0) || 1
  const r = size / 2 - 12
  const circ = 2 * Math.PI * r
  let offset = 0

  return (
    <div ref={ref} style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
      <svg width={size} height={size} role="img" aria-label="Allocation chart">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="14" />
        {inView &&
          data.map((d, i) => {
            const frac = d.value / total
            const dash = `${frac * circ} ${circ}`
            const el = (
              <motion.circle
                key={i}
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={d.color}
                strokeWidth="14"
                strokeLinecap="butt"
                strokeDasharray={dash}
                initial={{ strokeDashoffset: circ }}
                animate={{ strokeDashoffset: -offset }}
                transition={{ duration: 1, delay: i * 0.12 }}
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
              />
            )
            offset += frac * circ
            return el
          })}
      </svg>
      <div style={{ display: 'grid', gap: 8 }}>
        {data.map((d) => (
          <div key={d.label} style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 12.5 }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: d.color, flex: 'none' }} />
            <span className="text-1">{d.label}</span>
            <b style={{ fontFamily: 'var(--font-mono)' }}>{Math.round((d.value / total) * 100)}%</b>
          </div>
        ))}
      </div>
    </div>
  )
}
