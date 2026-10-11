import { lazy, Suspense, useMemo } from 'react'
import { detectQuality } from './quality'

const BlackHoleCanvas = lazy(() =>
  import('./BlackHole').then((m) => ({ default: m.BlackHoleCanvas })),
)

/**
 * Lazy-loads the R3F black hole so the three.js + fiber chunk only downloads
 * on the landing page, after first paint. Falls back to a pure-CSS nebula
 * gradient when WebGL is unavailable / device is low-end.
 */
export default function BlackHoleLazy() {
  const { quality, reduced, fallback } = useMemo(() => {
    let reduced = false
    try {
      reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    } catch {
      /* noop */
    }
    let fallback = false
    try {
      const c = document.createElement('canvas')
      fallback = !(c.getContext('webgl2') ?? c.getContext('webgl'))
    } catch {
      fallback = true
    }
    const quality = fallback ? 'low' : detectQuality()
    return { quality, reduced, fallback: fallback || quality === 'low' }
  }, [])

  if (fallback) {
    return (
      <div className="bh-canvas-host bh-fallback" aria-hidden>
        <div className="bh-fallback-inner" />
      </div>
    )
  }

  return (
    <div className="bh-canvas-host" aria-hidden>
      <Suspense fallback={<div className="bh-fallback-inner" />}>
        <BlackHoleCanvas quality={quality} reduced={reduced} />
      </Suspense>
    </div>
  )
}
