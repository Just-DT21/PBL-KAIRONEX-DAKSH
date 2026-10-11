export type Quality = 'high' | 'mid' | 'low'

/** Device capability tier for the black-hole scene. Kept dependency-free so
 *  the heavy three.js/fiber chunk can stay fully lazy. */
export function detectQuality(): Quality {
  if (typeof window === 'undefined') return 'low'
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return 'low'
  const nav = navigator as Navigator & { deviceMemory?: number; hardwareConcurrency?: number }
  if ((nav.deviceMemory ?? 8) <= 2 || (nav.hardwareConcurrency ?? 8) <= 2) return 'low'
  try {
    const c = document.createElement('canvas')
    if (!(c.getContext('webgl2') ?? c.getContext('webgl'))) return 'low'
  } catch {
    return 'low'
  }
  return window.innerWidth < 900 ? 'mid' : 'high'
}
