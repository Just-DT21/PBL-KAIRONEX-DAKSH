// Currency & number formatting — all amounts are absolute INR (rupees)

export function trimNum(s: string): string {
  return s.replace(/\.0+$/, '').replace(/(\.\d*[1-9])0+$/, '$1')
}

export function inr(n: number, opts: { compact?: boolean } = {}): string {
  const compact = opts.compact !== false
  const abs = Math.abs(n)
  if (compact) {
    if (abs >= 1e7) return `₹${trimNum((n / 1e7).toFixed(abs >= 1e8 ? 0 : 1))} Cr`
    if (abs >= 1e5) return `₹${trimNum((n / 1e5).toFixed(abs >= 1e6 ? 0 : 1))} L`
    if (abs >= 1000) return `₹${trimNum((n / 1e3).toFixed(0))}K`
  }
  return '₹' + n.toLocaleString('en-IN')
}

export function inrRange(min: number, max: number): string {
  if (min === max) return inr(min)
  return `${inr(min)} – ${inr(max)}`
}

export function pct(n: number): string {
  return `${Math.round(n)}%`
}

export function compactNumber(n: number): string {
  if (n >= 1e6) return trimNum((n / 1e6).toFixed(1)) + 'M'
  if (n >= 1e3) return trimNum((n / 1e3).toFixed(1)) + 'K'
  return String(n)
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function clockTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
}

export function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('')
}

export function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n))
}

export function uid(prefix = 'id'): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`
}

export function daysFromNow(d: number): string {
  return new Date(Date.now() + d * 86400000).toISOString()
}

export function hoursAgo(h: number): string {
  return new Date(Date.now() - h * 3600000).toISOString()
}

export function daysAgo(d: number): string {
  return new Date(Date.now() - d * 86400000).toISOString()
}
