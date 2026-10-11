import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="page-pad">
      <div className="container center" style={{ padding: '90px 0' }}>
        <div className="eyebrow" style={{ justifyContent: 'center' }}>Lost signal</div>
        <h1 style={{ fontSize: 'clamp(60px, 10vw, 120px)', fontFamily: 'var(--font-display)' }}>404</h1>
        <p className="text-1" style={{ maxWidth: 420, margin: '12px auto 28px' }}>
          This page doesn't exist — or it hasn't been published yet. The opportunities are still out there.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/" className="btn btn-primary">Back to home</Link>
          <Link to="/explore" className="btn btn-ghost"><Compass size={15} /> Explore startups</Link>
        </div>
      </div>
    </div>
  )
}
