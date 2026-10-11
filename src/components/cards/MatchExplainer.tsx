import type { MatchResult } from '../../data/types'
import { Info } from 'lucide-react'

export default function MatchExplainer({ match, compact }: { match: MatchResult; compact?: boolean }) {
  return (
    <div className="glass" style={{ padding: compact ? 16 : 22 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 18,
            display: 'grid',
            placeItems: 'center',
            fontFamily: 'var(--font-mono)',
            fontSize: 20,
            fontWeight: 600,
            background: 'linear-gradient(135deg, rgba(91,140,255,0.18), rgba(124,92,255,0.18))',
            border: '1px solid rgba(91,140,255,0.4)',
            color: '#a7c0ff',
            flex: 'none',
          }}
        >
          {match.score}%
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16 }}>AI Match Score</div>
          <div style={{ fontSize: 12.5, color: 'var(--text-2)' }}>{match.summary}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gap: 10 }}>
        {match.factors.map((f) => (
          <div key={f.label}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 4 }}>
              <span style={{ color: 'var(--text-1)', fontWeight: 600 }}>
                {f.label} <span className="text-2">· weight {f.weightPct}%</span>
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-1)' }}>{f.score}%</span>
            </div>
            <div className="bar" aria-hidden>
              <span style={{ width: `${f.score}%`, background: 'linear-gradient(90deg,#4c7dff,#7c5cff)' }} />
            </div>
            {!compact && <div style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 3 }}>{f.note}</div>}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginTop: 14, fontSize: 11.5, color: 'var(--text-3)' }}>
        <Info size={13} style={{ flex: 'none', marginTop: 1 }} />
        This is a discovery &amp; research score computed from stated preferences and founder-supplied data. It is not
        investment advice and does not predict performance or returns.
      </div>
    </div>
  )
}
