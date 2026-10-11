import { useEffect } from 'react'
import gsap from 'gsap'

/**
 * Cursor-gravity bridge — plain mutable state read by the R3F render loop and
 * the DOM spaceship cursor. Zero React state, zero per-frame allocations.
 *
 * Coordinate contract (shared with BlackHole.tsx):
 *  - `px.x/y`    pointer in host-canvas pixels, origin top-left, y down
 *  - `norm.x/y`  pointer relative to host center, y-UP, in roughly [-1, 1]
 *                (this is what all shaders receive)
 *  - the black hole sits at world `holeOffset`; shader bending happens in the
 *    hole's local space (the UniformDriver subtracts the hole position).
 *
 * Tiers: 0 none · 1 far · 2 medium · 3 close (strong, capped pull).
 * The REAL pointer is never moved or captured — only the rendered ship drifts.
 */

export type GravityTier = 0 | 1 | 2 | 3

/** World-space position of the black hole at z=0 (right/center-right on
 *  desktop; nudged up-right on narrow screens so it never sits on the copy). */
export const holeOffset = { x: 2.9, y: 0.15 }

export interface GravityState {
  px: { x: number; y: number }
  norm: { x: number; y: number }
  /** smoothed normalized attractor for shaders */
  smooth: { x: number; y: number }
  /** smoothed DOM ship position (for the custom cursor element) */
  cur: { x: number; y: number }
  /** smoothed pointer velocity, px per second (drives ship heading) */
  vel: { x: number; y: number }
  /** 0..1 how deep in the field, smoothed */
  pull: number
  tier: GravityTier
  active: boolean
  /** true only while the black-hole canvas host exists on the page */
  hasHole: boolean
  reduced: boolean
  touch: boolean
}

export const gravity: GravityState = {
  px: { x: 0, y: 0 },
  norm: { x: 0, y: 0 },
  smooth: { x: 0, y: 0 },
  cur: { x: -200, y: -200 },
  vel: { x: 0, y: 0 },
  pull: 0,
  tier: 0,
  active: false,
  hasHole: false,
  reduced: false,
  touch: true,
}

export function useCursorGravity(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return

    gravity.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    gravity.touch = window.matchMedia('(pointer: coarse)').matches
    const fine = window.matchMedia('(pointer: fine)').matches
    if (!fine) return

    // re-queried on demand: the canvas host mounts lazily
    let host = document.querySelector('.bh-canvas-host') as HTMLElement | null

    const onMove = (e: PointerEvent) => {
      if (!host || !host.isConnected) {
        host = document.querySelector('.bh-canvas-host') as HTMLElement | null
        gravity.hasHole = !!host
      }
      noteDocPointer(e)
      const r = (host ?? document.body).getBoundingClientRect()
      const x = e.clientX - r.left
      const y = e.clientY - r.top
      gravity.px.x = x
      gravity.px.y = y
      gravity.norm.x = (x / r.width) * 2 - 1
      gravity.norm.y = -((y / r.height) * 2 - 1)
      gravity.cur.x = e.clientX
      gravity.cur.y = e.clientY
      gravity.active = host ? x >= 0 && y >= 0 && x <= r.width && y <= r.height : false
    }
    const onLeave = () => {
      gravity.active = false
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)

    const prevDoc = { x: doc.x, y: doc.y }
    const tick = (_t: number, dtMs: number) => {
      const dt = Math.min(dtMs / 1000, 0.05)
      if (dt <= 0) return

      gravity.smooth.x += (gravity.norm.x - gravity.smooth.x) * Math.min(1, dt * 10)
      gravity.smooth.y += (gravity.norm.y - gravity.smooth.y) * Math.min(1, dt * 10)
      gravity.cur.x += (doc.x - gravity.cur.x) * Math.min(1, dt * 30)
      gravity.cur.y += (doc.y - gravity.cur.y) * Math.min(1, dt * 30)

      // smoothed pointer velocity (px/s) for the ship heading
      const ivx = (doc.x - prevDoc.x) / dt
      const ivy = (doc.y - prevDoc.y) / dt
      prevDoc.x = doc.x
      prevDoc.y = doc.y
      const k = Math.min(1, dt * 10)
      gravity.vel.x += (ivx - gravity.vel.x) * k
      gravity.vel.y += (ivy - gravity.vel.y) * k

      const d = Math.hypot(gravity.norm.x, gravity.norm.y)
      let tier: GravityTier = 0
      if (gravity.active && gravity.hasHole) {
        if (d < 0.92) tier = 1
        if (d < 0.52) tier = 2
        if (d < 0.26) tier = 3
      }
      gravity.tier = tier

      const target = tier === 0 ? 0 : tier === 1 ? 0.22 : tier === 2 ? 0.55 : 1
      gravity.pull += (target - gravity.pull) * Math.min(1, dt * 4)

      // subtle, capped VISUAL pull of the ship toward the hole. The real
      // pointer keeps full control — this only offsets the rendered ship.
      if (tier >= 2 && !gravity.reduced && gravity.hasHole) {
        const nx = -gravity.norm.x / Math.max(d, 0.001)
        const ny = -gravity.norm.y / Math.max(d, 0.001)
        const maxPx = tier === 3 ? 26 : 11
        gravity.cur.x += nx * maxPx * gravity.pull * dt * 8
        gravity.cur.y += ny * maxPx * gravity.pull * dt * 8
      }
    }
    gsap.ticker.add(tick)

    return () => {
      gsap.ticker.remove(tick)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onMove)
      document.documentElement.removeEventListener('pointerleave', onLeave)
      gravity.hasHole = false
      gravity.active = false
      gravity.pull = 0
      gravity.tier = 0
    }
  }, [enabled])
}

// last raw document-space pointer (kept out of the state object for clarity)
const doc = { x: -200, y: -200 }
export function noteDocPointer(e: PointerEvent) {
  doc.x = e.clientX
  doc.y = e.clientY
}
