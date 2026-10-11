import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { gravity, useCursorGravity } from './gravity'

/**
 * Spaceship cursor — the desktop pointer rendered as a tiny sleek spacecraft.
 *
 * - follows the REAL mouse position precisely (smoothed with GSAP quickTo)
 * - banks toward the direction of travel (rotation follows smoothed velocity)
 * - subtle blue exhaust trail (short, fading, canvas-drawn)
 * - inside the black hole's field the ship drifts visually toward the horizon
 *   (capped, spring-smoothed) and its trail curves — the real pointer is
 *   NEVER moved or captured, clicking is never intercepted
 * - reduced motion: ship still follows the mouse but no trail, no banking
 * - touch devices: nothing renders at all
 *
 * The native OS cursor is hidden via CSS on fine pointers (`cursor: none` on
 * the app shell only while this component is mounted) — but focus outlines,
 * hover states and clicks all remain fully functional.
 */

export default function GravityCursor({ enabled }: { enabled: boolean }) {
  const shipRef = useRef<HTMLDivElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const trailRef = useRef<HTMLCanvasElement>(null)

  useCursorGravity(enabled)

  useEffect(() => {
    if (!enabled) return
    const fine = window.matchMedia('(pointer: fine)').matches
    if (!fine) return

    document.documentElement.classList.add('kx-ship-cursor')

    const ship = shipRef.current!
    const glow = glowRef.current!
    const ring = ringRef.current!
    const canvas = trailRef.current!
    const ctx = canvas.getContext('2d')!

    const sizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    sizeCanvas()
    window.addEventListener('resize', sizeCanvas)

    // ship follows the real pointer tightly; glow lags for a soft halo
    const xTo = gsap.quickTo(ship, 'x', { duration: 0.08, ease: 'power2.out' })
    const yTo = gsap.quickTo(ship, 'y', { duration: 0.08, ease: 'power2.out' })
    const gxTo = gsap.quickTo(glow, 'x', { duration: 0.3, ease: 'power2.out' })
    const gyTo = gsap.quickTo(glow, 'y', { duration: 0.3, ease: 'power2.out' })

    // dust motes drift off the ship toward the hole when gravity rises
    const motes = Array.from({ length: 6 }, () => ({
      el: document.createElement('div'),
      a: Math.random() * Math.PI * 2,
      s: 0.8 + Math.random() * 1.2,
      r: 10 + Math.random() * 14,
    }))
    motes.forEach((m) => {
      m.el.className = 'kx-ship-mote'
      document.body.appendChild(m.el)
    })

    const trail: { x: number; y: number; a: number }[] = []
    let lastHeading = -90 // degrees; ship nose default = up-right

    const tick = () => {
      const { cur, vel, tier, pull, reduced, active } = gravity

      xTo(cur.x)
      yTo(cur.y)
      gxTo(cur.x)
      gyTo(cur.y)

      // heading from smoothed velocity (falls back to last heading when idle)
      const speed = Math.hypot(vel.x, vel.y)
      if (!reduced && speed > 24) {
        const target = (Math.atan2(vel.y, vel.x) * 180) / Math.PI + 90
        let delta = target - lastHeading
        while (delta > 180) delta -= 360
        while (delta < -180) delta += 360
        lastHeading += delta * 0.14
      }
      const bank = reduced ? 0 : Math.max(-24, Math.min(24, vel.x * 0.02))

      gsap.set(ship, {
        rotation: lastHeading + bank * 0.6,
        scale: active ? 1 : 0.82,
        opacity: 1,
      })
      gsap.set(glow, {
        scale: 0.9 + pull * 1.3,
        opacity: active ? 0.35 + pull * 0.45 : 0,
      })
      // thin orbital ring appears only near the horizon
      gsap.set(ring, {
        x: cur.x,
        y: cur.y,
        scale: 0.55 + pull * 0.85,
        opacity: tier >= 3 ? 0.6 : 0,
        rotation: '+=2',
      })

      // motes trail behind the ship, curving toward the hole in the field
      const dirX = -gravity.norm.x
      const dirY = -gravity.norm.y
      for (let i = 0; i < motes.length; i++) {
        const m = motes[i]
        m.a += 0.02 * m.s
        const behind = lastHeading + 150 + Math.sin(m.a) * 26
        const rad = (behind * Math.PI) / 180
        const dist = (8 + i * 3.2) * (1 - pull * 0.35)
        gsap.set(m.el, {
          x: cur.x + Math.cos(rad) * dist + dirX * pull * 6 * (i / motes.length),
          y: cur.y + Math.sin(rad) * dist + dirY * pull * 6 * (i / motes.length),
          opacity: active ? (tier > 0 ? 0.4 : 0.18) + pull * 0.35 : 0,
          scale: 0.5 + pull * 0.5,
        })
      }

      // exhaust trail — short, blue, fading
      if (!reduced) {
        trail.push({ x: cur.x, y: cur.y, a: 1 })
        while (trail.length > 16) trail.shift()
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.lineCap = 'round'
        for (let i = 1; i < trail.length; i++) {
          const p0 = trail[i - 1]
          const p1 = trail[i]
          const f = i / trail.length
          ctx.strokeStyle = `rgba(125, 165, 255, ${f * (0.04 + pull * 0.22)})`
          ctx.lineWidth = f * (1 + pull * 1.6)
          ctx.beginPath()
          ctx.moveTo(p0.x, p0.y)
          ctx.lineTo(p1.x, p1.y)
          ctx.stroke()
        }
      }
    }
    gsap.ticker.add(tick)

    return () => {
      gsap.ticker.remove(tick)
      window.removeEventListener('resize', sizeCanvas)
      document.documentElement.classList.remove('kx-ship-cursor')
      motes.forEach((m) => m.el.remove())
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
  }, [enabled])

  if (!enabled) return null

  return (
    <>
      <canvas ref={trailRef} className="kx-ship-trail" aria-hidden />
      <div ref={glowRef} className="kx-ship-glow" aria-hidden />
      <div ref={ringRef} className="kx-ship-ring" aria-hidden />
      <div ref={shipRef} className="kx-ship" aria-hidden>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
          <defs>
            <linearGradient id="ship-hull" x1="12" y1="2" x2="12" y2="22" gradientUnits="userSpaceOnUse">
              <stop stopColor="#ffffff" />
              <stop offset="0.55" stopColor="#c9d8ff" />
              <stop offset="1" stopColor="#8fb0ff" />
            </linearGradient>
          </defs>
          {/* nose + fuselage */}
          <path
            d="M12 1.6 C 13.2 4.4, 13.9 8.2, 13.9 12 C 13.9 15.8, 13.2 19.6, 12 22.4 C 10.8 19.6, 10.1 15.8, 10.1 12 C 10.1 8.2, 10.8 4.4, 12 1.6 Z"
            fill="url(#ship-hull)"
          />
          {/* swept wings */}
          <path d="M12 9.4 L 20.6 16.8 L 12 14.6 Z" fill="#dfe9ff" opacity="0.95" />
          <path d="M12 9.4 L 3.4 16.8 L 12 14.6 Z" fill="#b9ccff" opacity="0.9" />
          {/* cockpit */}
          <ellipse cx="12" cy="9.8" rx="1.15" ry="2.1" fill="#3b62d8" opacity="0.95" />
          {/* engine glow */}
          <path d="M10.6 19.6 L 12 23.2 L 13.4 19.6 Z" fill="#7da5ff" opacity="0.9" />
        </svg>
      </div>
    </>
  )
}
