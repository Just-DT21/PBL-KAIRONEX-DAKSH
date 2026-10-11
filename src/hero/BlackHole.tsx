import { useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { gravity, holeOffset } from './gravity'
import type { Quality } from './quality'

/**
 * KAIRONEXA black-hole hero — realistic, cinematic, GPU-driven.
 *
 * Scene layers (back → front):
 *   1. Nebula       — deep indigo cloud sprites drifting behind everything
 *   2. Stars        — far starfield, gravitationally lensed near the shadow
 *   3. HaloArcs     — lensed light band arcing over/under the shadow (screen plane)
 *   4. Debris       — dark silhouetted rocks on eccentric inclined orbits
 *   5. AccretionDisk— thin near-edge-on disk of coherent streamlets; Keplerian
 *                     differential rotation, Doppler beaming, white-hot rim →
 *                     gold → violet → dim blue. This is the visual centerpiece.
 *   6. Infall       — dust spiralling in and flattening into the disk plane
 *   7. PhotonRing   — thin bright ring hugging the shadow
 *   8. Horizon      — pure black; occludes everything behind it. Never glows.
 *
 * Cursor gravity: shaders receive the (smoothed) ship position in hole-local
 * space and bend nearby particles toward it. The real pointer is never moved.
 */

const COUNTS: Record<Quality, { disk: number; infall: number; debris: number; stars: number; dust: number }> = {
  high: { disk: 5200, infall: 520, debris: 22, stars: 1100, dust: 260 },
  mid: { disk: 2800, infall: 300, debris: 14, stars: 650, dust: 160 },
  low: { disk: 1400, infall: 160, debris: 8, stars: 380, dust: 90 },
}

const MAX_POINT = 7.5 // hard cap on gl_PointSize (px) — prevents blob artifacts

/* ------------------------------------------------------------------ */
/* Shaders                                                             */
/* ------------------------------------------------------------------ */

/**
 * Accretion disk — particles are grouped into short coherent "streamlets"
 * (shared radius + arc center, small along-arc offset) so their orbital motion
 * smears visually into long curved trails.
 */
const diskVert = /* glsl */ `
  attribute float aRadius;
  attribute float aTheta;
  attribute float aArc;     // along-arc offset inside the streamlet
  attribute float aSeed;
  uniform float uTime;
  uniform vec2 uShip;       // ship position in hole-local world units (xz plane)
  uniform float uShipOn;
  varying float vHeat;
  varying float vDoppler;
  varying float vSpark;

  // radius → color-band heat: 0 outer/dim … 1 inner/white-hot
  float heatOf(float r) {
    float inner = 1.0 - smoothstep(1.18, 1.65, r);   // white-hot rim
    float mid   = (1.0 - smoothstep(1.6, 2.6, r));   // gold
    float outer = (1.0 - smoothstep(2.4, 4.6, r));   // violet→blue fade
    return clamp(inner * 1.0 + mid * 0.62 + outer * 0.3, 0.0, 1.0);
  }

  void main() {
    // Keplerian differential rotation: inner streamlets sweep faster
    float omega = 0.9 / pow(max(aRadius, 0.5), 1.5);
    float ang = aTheta + aArc + uTime * omega;
    float r = aRadius + 0.015 * aRadius * sin(uTime * 0.7 + aSeed * 6.2831);

    // disk is razor thin near the hole, slightly flared outward
    float thick = 0.028 * r * r / (1.0 + r * 0.4);
    vec3 p = vec3(cos(ang) * r, (aSeed - 0.5) * 2.0 * thick, sin(ang) * r);

    // ship gravity: local bend toward the cursor
    if (uShipOn > 0.5) {
      float d = length(uShip - p.xz);
      float pull = smoothstep(2.2, 0.0, d) * 0.5;
      p.xz += normalize(uShip - p.xz + 1e-4) * pull * (0.35 + 0.65 * fract(aSeed * 3.7));
      p.y  += pull * 0.1 * sin(aSeed * 12.9 + uTime * 2.0);
    }

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;

    vHeat = heatOf(r);
    // Doppler beaming: the side sweeping toward the camera is brighter
    vDoppler = 0.55 + 0.45 * sin(ang);
    vSpark = step(0.965, fract(aSeed * 11.7)); // sparse warm sparks
    float size = (0.75 + 1.05 * vHeat + 0.6 * vSpark) * (105.0 / max(-mv.z, 1.0));
    gl_PointSize = min(size, ${MAX_POINT.toFixed(1)});
  }
`

const diskFrag = /* glsl */ `
  precision mediump float;
  uniform vec3 uWhite; uniform vec3 uGold; uniform vec3 uViolet; uniform vec3 uBlue; uniform vec3 uDim;
  varying float vHeat; varying float vDoppler; varying float vSpark;
  void main() {
    float a = smoothstep(0.5, 0.12, length(gl_PointCoord - 0.5));
    vec3 col = mix(uDim, uBlue, smoothstep(0.0, 0.25, vHeat));
    col = mix(col, uViolet, smoothstep(0.25, 0.5, vHeat));
    col = mix(col, uGold, smoothstep(0.5, 0.78, vHeat));
    col = mix(col, uWhite, smoothstep(0.8, 1.0, vHeat));
    // sparse warm sparks
    col = mix(col, vec3(1.0, 0.72, 0.42), vSpark * 0.85);
    float alpha = a * (0.10 + 0.55 * vHeat) * (0.45 + 0.55 * vDoppler);
    gl_FragColor = vec4(col, alpha);
  }
`

/** Infall dust — spawns far out, spirals in, flattens into the disk plane. */
const infallVert = /* glsl */ `
  attribute float aProg; attribute float aSeed; attribute float aDir;
  uniform float uTime; uniform float uReduced; uniform vec2 uShip; uniform float uShipOn;
  varying float vFade; varying float vWarm;
  void main() {
    float speed = mix(0.05, 0.13, fract(aSeed * 2.13));
    float t = fract(aProg + uTime * speed * mix(1.0, 0.3, uReduced));
    float r = mix(7.0, 1.05, pow(t, 1.7));
    float spin = (t * 4.6 + aSeed * 6.2831) * aDir;
    // flatten toward the disk plane as it falls in
    float y = sin(t * 3.1 + aSeed * 5.0) * 1.1 * pow(1.0 - t, 2.2);
    vec3 p = vec3(cos(spin) * r, y, sin(spin) * r);
    if (uShipOn > 0.5) {
      float d = length(uShip - p.xz);
      float pull = smoothstep(2.6, 0.0, d) * 0.7 * (1.0 - t * 0.4);
      p.xz += normalize(uShip - p.xz + 1e-4) * pull;
    }
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    vFade = smoothstep(0.0, 0.1, t) * (0.35 + 1.25 * smoothstep(0.72, 1.0, t));
    vWarm = smoothstep(0.75, 1.0, t);
    gl_PointSize = min(mix(0.7, 1.9, t) * (125.0 / max(-mv.z, 1.0)), ${MAX_POINT.toFixed(1)});
  }
`

const infallFrag = /* glsl */ `
  precision mediump float;
  uniform vec3 uBlue; uniform vec3 uGold; varying float vFade; varying float vWarm;
  void main() {
    float a = smoothstep(0.5, 0.1, length(gl_PointCoord - 0.5));
    gl_FragColor = vec4(mix(uBlue, uGold, vWarm * 0.55), a * vFade * 0.7);
  }
`

/** Ambient cosmic dust — slow drift, gently attracted to the ship. */
const dustVert = /* glsl */ `
  attribute float aSeed;
  uniform float uTime; uniform vec2 uShip; uniform float uShipOn; uniform float uReduced;
  varying float vA;
  void main() {
    vec3 p = position;
    float drift = mix(1.0, 0.25, uReduced);
    p.x += sin(uTime * 0.05 * drift + aSeed * 20.0) * 0.6;
    p.y += cos(uTime * 0.04 * drift + aSeed * 14.0) * 0.4;
    if (uShipOn > 0.5) {
      float d = length(uShip - p.xz);
      float pull = smoothstep(2.0, 0.0, d) * 0.45;
      p.xz += normalize(uShip - p.xz + 1e-4) * pull;
      p.y  += pull * 0.3 * sin(aSeed * 9.0 + uTime);
    }
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    vA = 0.25 + 0.4 * fract(aSeed * 5.3);
    gl_PointSize = min((0.5 + 0.9 * fract(aSeed * 8.1)) * (110.0 / max(-mv.z, 1.0)), 3.0);
  }
`

const dustFrag = /* glsl */ `
  precision mediump float;
  uniform vec3 uCol; varying float vA;
  void main() {
    float a = smoothstep(0.5, 0.15, length(gl_PointCoord - 0.5));
    gl_FragColor = vec4(uCol, a * vA * 0.4);
  }
`

/** Stars — lensed around the shadow in NDC space; slow twinkle. */
const starVert = /* glsl */ `
  attribute float aSize; attribute float aSeed;
  uniform float uTime; uniform vec2 uBhNdc;
  varying float vTw; varying float vWarm;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vec4 clip = projectionMatrix * mv;
    vec2 ndc = clip.xy / max(clip.w, 0.001);
    vec2 toBh = uBhNdc - ndc;
    float dist = length(toBh);
    float bend = smoothstep(0.55, 0.03, dist) * 0.15;
    ndc += normalize(toBh + 1e-5) * bend;
    gl_Position = vec4(ndc * clip.w, clip.z, clip.w);
    vTw = 0.5 + 0.5 * sin(uTime * (0.5 + fract(aSeed * 3.1)) + aSeed * 20.0);
    vWarm = step(0.88, fract(aSeed * 7.7));
    gl_PointSize = min(aSize, 3.0);
  }
`

const starFrag = /* glsl */ `
  precision mediump float;
  varying float vTw; varying float vWarm;
  void main() {
    float a = smoothstep(0.5, 0.12, length(gl_PointCoord - 0.5));
    vec3 col = mix(vec3(0.78, 0.84, 1.0), vec3(1.0, 0.86, 0.7), vWarm);
    gl_FragColor = vec4(col, a * (0.35 + 0.45 * vTw));
  }
`

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function usePalette() {
  return useMemo(
    () => ({
      white: new THREE.Color('#fff7ea'),
      gold: new THREE.Color('#f5b46a'),
      violet: new THREE.Color('#8f7bff'),
      blue: new THREE.Color('#4f7dff'),
      dim: new THREE.Color('#1e2f66'),
      cyan: new THREE.Color('#3ee6d8'),
      dustCol: new THREE.Color('#33427a'),
    }),
    [],
  )
}

interface Shared {
  uTime: { value: number }
  uShip: { value: THREE.Vector2 }
  uShipOn: { value: number }
  uReduced: { value: number }
}

function Points({
  geometry,
  vert,
  frag,
  uniforms,
  extra,
}: {
  geometry: THREE.BufferGeometry
  vert: string
  frag: string
  uniforms: Record<string, THREE.IUniform>
  extra?: Record<string, unknown>
}) {
  return (
    <points geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        vertexShader={vert}
        fragmentShader={frag}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={uniforms}
        {...extra}
      />
    </points>
  )
}

/** Single driver: ship/time uniforms shared by every point system. */
function UniformDriver({ shared, pos }: { shared: Shared; pos: { x: number; y: number } }) {
  useFrame(({ clock }) => {
    shared.uTime.value = clock.elapsedTime
    ;(shared.uShip.value as THREE.Vector2).set(
      gravity.smooth.x * 4.4 - pos.x,
      gravity.smooth.y * 2.6 - pos.y,
    )
    shared.uShipOn.value = gravity.active && !gravity.reduced ? 1 : 0
  })
  return null
}

/* ------------------------------------------------------------------ */
/* Scene pieces                                                        */
/* ------------------------------------------------------------------ */

/** Thin near-edge-on accretion disk built from coherent streamlets. */
function AccretionDisk({ q, shared }: { q: Quality; shared: Shared }) {
  const pal = usePalette()
  const geo = useMemo(() => {
    const c = COUNTS[q].disk
    const g = new THREE.BufferGeometry()
    const radius = new Float32Array(c)
    const theta = new Float32Array(c)
    const arc = new Float32Array(c)
    const seed = new Float32Array(c)
    // generate streamlets: each anchors N particles on a shared arc
    const per = 14
    const streamlets = Math.ceil(c / per)
    let i = 0
    for (let s = 0; s < streamlets && i < c; s++) {
      const r0 = 1.16 + Math.pow(Math.random(), 1.35) * 3.4
      const th0 = Math.random() * Math.PI * 2
      const len = 0.18 + Math.random() * 0.5
      for (let k = 0; k < per && i < c; k++, i++) {
        radius[i] = r0 * (1 + (Math.random() - 0.5) * 0.012)
        theta[i] = th0
        arc[i] = (k / per) * len + (Math.random() - 0.5) * 0.015
        seed[i] = Math.random()
      }
    }
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(c * 3), 3))
    g.setAttribute('aRadius', new THREE.BufferAttribute(radius, 1))
    g.setAttribute('aTheta', new THREE.BufferAttribute(theta, 1))
    g.setAttribute('aArc', new THREE.BufferAttribute(arc, 1))
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1))
    return g
  }, [q])

  const uniforms = useMemo<Record<string, THREE.IUniform>>(
    () => ({
      ...shared,
      uWhite: { value: pal.white },
      uGold: { value: pal.gold },
      uViolet: { value: pal.violet },
      uBlue: { value: pal.blue },
      uDim: { value: pal.dim },
    }),
    [shared, pal],
  )

  // near-edge-on: the disk reads as a horizontal band across the right side
  return (
    <group rotation={[0.24, 0, -0.06]}>
      <Points geometry={geo} vert={diskVert} frag={diskFrag} uniforms={uniforms} />
    </group>
  )
}

/** Dust spiralling inward, flattening into the disk plane. */
function Infall({ q, shared }: { q: Quality; shared: Shared }) {
  const pal = usePalette()
  const geo = useMemo(() => {
    const c = COUNTS[q].infall
    const g = new THREE.BufferGeometry()
    const prog = new Float32Array(c)
    const seed = new Float32Array(c)
    const dir = new Float32Array(c)
    for (let i = 0; i < c; i++) {
      prog[i] = Math.random()
      seed[i] = Math.random()
      dir[i] = Math.random() > 0.25 ? 1 : -1
    }
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(c * 3), 3))
    g.setAttribute('aProg', new THREE.BufferAttribute(prog, 1))
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1))
    g.setAttribute('aDir', new THREE.BufferAttribute(dir, 1))
    return g
  }, [q])

  const uniforms = useMemo<Record<string, THREE.IUniform>>(
    () => ({ ...shared, uBlue: { value: pal.blue }, uGold: { value: pal.gold } }),
    [shared, pal],
  )

  return (
    <group rotation={[0.24, 0, -0.06]}>
      <Points geometry={geo} vert={infallVert} frag={infallFrag} uniforms={uniforms} />
    </group>
  )
}

/** Ambient drifting dust field around the whole scene. */
function Dust({ q, shared }: { q: Quality; shared: Shared }) {
  const pal = usePalette()
  const geo = useMemo(() => {
    const c = COUNTS[q].dust
    const g = new THREE.BufferGeometry()
    const pos = new Float32Array(c * 3)
    const seed = new Float32Array(c)
    for (let i = 0; i < c; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 17
      pos[i * 3 + 1] = (Math.random() - 0.5) * 9
      pos[i * 3 + 2] = -3 - Math.random() * 8
      seed[i] = Math.random()
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1))
    return g
  }, [q])

  const uniforms = useMemo<Record<string, THREE.IUniform>>(
    () => ({ ...shared, uCol: { value: pal.dustCol } }),
    [shared, pal],
  )

  return <Points geometry={geo} vert={dustVert} frag={dustFrag} uniforms={uniforms} />
}

/** Lensed starfield with slow drift (parallax comes from the camera rig). */
function Stars({ q, bhNdc }: { q: Quality; bhNdc: THREE.Vector2 }) {
  const geo = useMemo(() => {
    const c = COUNTS[q].stars
    const g = new THREE.BufferGeometry()
    const pos = new Float32Array(c * 3)
    const size = new Float32Array(c)
    const seed = new Float32Array(c)
    for (let i = 0; i < c; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 24
      pos[i * 3 + 1] = (Math.random() - 0.5) * 13
      pos[i * 3 + 2] = -7 - Math.random() * 14
      size[i] = 0.6 + Math.pow(Math.random(), 2.2) * 2.4
      seed[i] = Math.random()
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('aSize', new THREE.BufferAttribute(size, 1))
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1))
    return g
  }, [q])

  const uniforms = useMemo<Record<string, THREE.IUniform>>(
    () => ({ uTime: { value: 0 }, uBhNdc: { value: bhNdc } }),
    [bhNdc],
  )

  const ref = useRef<THREE.ShaderMaterial>(null)
  useFrame(({ clock }) => {
    if (ref.current) ref.current.uniforms.uTime.value = clock.elapsedTime
  })

  return (
    <points geometry={geo} frustumCulled={false}>
      <shaderMaterial
        ref={ref}
        vertexShader={starVert}
        fragmentShader={starFrag}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={uniforms}
      />
    </points>
  )
}

/**
 * Lensed light band: the classic arcs that appear to bend OVER and UNDER the
 * shadow (screen-plane half-rings behind the hole), plus a faint photon ring
 * hugging the shadow edge.
 */
function HaloArcs() {
  const group = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    if (group.current) group.current.rotation.z = Math.sin(clock.elapsedTime * 0.05) * 0.04
  })
  return (
    <group ref={group}>
      {/* photon ring — thin, bright, circular, hugging the horizon */}
      <mesh position={[0, 0, -0.42]}>
        <torusGeometry args={[1.14, 0.018, 8, 128]} />
        <meshBasicMaterial color="#cfe0ff" transparent opacity={0.5} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      {/* lensed band arcing over the shadow */}
      <mesh position={[0, 0, -0.6]} rotation={[0, 0, 0.1]}>
        <torusGeometry args={[1.75, 0.05, 8, 96, Math.PI * 1.05]} />
        <meshBasicMaterial color="#7d95ff" transparent opacity={0.2} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      {/* mirrored band under the shadow */}
      <mesh position={[0, 0, -0.6]} rotation={[0, 0, Math.PI + 0.16]}>
        <torusGeometry args={[1.9, 0.04, 8, 96, Math.PI * 0.95]} />
        <meshBasicMaterial color="#8f7bff" transparent opacity={0.14} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      {/* warm inner glow where the disk light wraps the shadow */}
      <mesh position={[0, 0, -0.55]} rotation={[0, 0, Math.PI]}>
        <torusGeometry args={[1.38, 0.03, 8, 96, Math.PI * 0.8]} />
        <meshBasicMaterial color="#f5b46a" transparent opacity={0.12} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  )
}

/** Dark silhouetted rocks — larger, near-black, rim-picked by scene light. */
function Debris({ q }: { q: Quality }) {
  const ref = useRef<THREE.InstancedMesh>(null)
  const data = useMemo(() => {
    const n = COUNTS[q].debris
    return Array.from({ length: n }, () => ({
      r: 2.2 + Math.random() * 4.6,
      speed: (0.05 + Math.random() * 0.1) * (Math.random() > 0.2 ? 1 : -1),
      phase: Math.random() * Math.PI * 2,
      tilt: 0.15 + Math.random() * 0.5,
      scale: 0.05 + Math.random() * 0.13,
      tumble: Math.random() * Math.PI * 2,
      y0: (Math.random() - 0.5) * 1.4,
    }))
  }, [q])
  const dummy = useMemo(() => new THREE.Object3D(), [])

  useFrame(({ clock }) => {
    const m = ref.current
    if (!m) return
    const t = clock.elapsedTime
    for (let i = 0; i < data.length; i++) {
      const d = data[i]
      const ang = d.phase + t * d.speed
      dummy.position.set(
        Math.cos(ang) * d.r,
        d.y0 + Math.sin(ang) * d.r * d.tilt * 0.5,
        Math.sin(ang) * d.r * 0.6,
      )
      dummy.rotation.set(t * 0.3 + d.tumble, t * 0.22 + d.tumble, d.tumble)
      dummy.scale.setScalar(d.scale)
      dummy.updateMatrix()
      m.setMatrixAt(i, dummy.matrix)
    }
    m.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, data.length]} frustumCulled={false}>
      <dodecahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color="#07070c" roughness={0.95} metalness={0.1} />
    </instancedMesh>
  )
}

/** Deep-space nebula clouds — procedural soft blotch sprites, very low alpha. */
function Nebula() {
  const refs = useRef<(THREE.Sprite | null)[]>([])
  const textures = useMemo(() => {
    const make = (tint: string, blotches: number) => {
      const s = 256
      const cv = document.createElement('canvas')
      cv.width = s
      cv.height = s
      const ctx = cv.getContext('2d')!
      // base soft cloud
      const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2)
      g.addColorStop(0, tint)
      g.addColorStop(0.55, tint.replace(/[\d.]+\)$/, '0.25)'))
      g.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, s, s)
      // irregular blotches so it reads as cloud, not a ball
      ctx.globalCompositeOperation = 'destination-out'
      for (let i = 0; i < blotches; i++) {
        const bx = Math.random() * s
        const by = Math.random() * s
        const br = s * (0.08 + Math.random() * 0.22)
        const bg = ctx.createRadialGradient(bx, by, 0, bx, by, br)
        bg.addColorStop(0, 'rgba(0,0,0,0.5)')
        bg.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = bg
        ctx.fillRect(0, 0, s, s)
      }
      const t = new THREE.CanvasTexture(cv)
      t.needsUpdate = true
      return t
    }
    return [
      make('rgba(64,72,150,0.32)', 9),
      make('rgba(96,64,160,0.26)', 11),
      make('rgba(38,96,140,0.22)', 8),
    ]
  }, [])

  const clouds = useMemo(
    () => [
      { p: [-4.5, 2.4, -7], s: 11, o: 0.55, d: 0.006 },
      { p: [6.5, -2.6, -9], s: 13, o: 0.45, d: -0.005 },
      { p: [1.5, 3.8, -11], s: 15, o: 0.35, d: 0.004 },
    ],
    [],
  )

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    clouds.forEach((c, i) => {
      const sp = refs.current[i]
      if (!sp) return
      sp.position.x = c.p[0] + Math.sin(t * c.d * 8) * 0.4
      sp.position.y = c.p[1] + Math.cos(t * c.d * 6) * 0.3
    })
  })

  return (
    <>
      {clouds.map((c, i) => (
        <sprite
          key={i}
          ref={(el) => {
            refs.current[i] = el
          }}
          position={c.p as [number, number, number]}
        >
          <spriteMaterial
            map={textures[i]}
            transparent
            opacity={c.o}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </sprite>
      ))}
    </>
  )
}

/** Faint ambient glow hugging the disk plane (behind the horizon disc). */
function DiskGlow({ narrow }: { narrow: boolean }) {
  const sprite = useRef<THREE.Sprite>(null)
  const tex = useMemo(() => {
    const s = 256
    const cv = document.createElement('canvas')
    cv.width = s * 2
    cv.height = s
    const ctx = cv.getContext('2d')!
    // wide elliptical gradient — hugs the disk plane
    ctx.save()
    ctx.translate(s, s / 2)
    ctx.scale(2, 0.55)
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, s * 0.8)
    g.addColorStop(0, 'rgba(160,150,255,0.30)')
    g.addColorStop(0.4, 'rgba(110,110,220,0.14)')
    g.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = g
    ctx.fillRect(-s, -s / 2, s * 2, s)
    ctx.restore()
    const t = new THREE.CanvasTexture(cv)
    t.needsUpdate = true
    return t
  }, [])

  useFrame(({ clock }) => {
    if (sprite.current) {
      const base = narrow ? 5.5 : 7.2
      const s2 = base + 0.3 * Math.sin(clock.elapsedTime * 0.4)
      sprite.current.scale.set(s2 * 2, s2, 1)
    }
  })

  return (
    <sprite ref={sprite} position={[0, 0, -0.8]}>
      <spriteMaterial map={tex} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
    </sprite>
  )
}

function Rig({ reduced, pos }: { reduced: boolean; pos: { x: number; y: number } }) {
  useFrame(({ camera, clock, pointer }) => {
    const drift = reduced ? 0 : 1
    camera.position.x += (pointer.x * 0.3 * drift - camera.position.x) * 0.02
    camera.position.y += (0.4 + pointer.y * 0.18 * drift - camera.position.y) * 0.02
    camera.position.z = 11.5 + Math.sin(clock.elapsedTime * 0.08) * 0.2 * drift
    camera.lookAt(pos.x * 0.45, pos.y * 0.5, 0)
  })
  return null
}

/* ------------------------------------------------------------------ */
/* Canvas + scene                                                      */
/* ------------------------------------------------------------------ */

export function BlackHoleCanvas({ quality, reduced }: { quality: Quality; reduced: boolean }) {
  return (
    <Canvas
      gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
      dpr={quality === 'high' ? Math.min(window.devicePixelRatio, 1.75) : 1}
      camera={{ position: [0, 0.4, 11.5], fov: 48 }}
      style={{ position: 'absolute', inset: 0 }}
      aria-hidden
      onCreated={({ gl }) => {
        // self-heal after driver/HMR context loss
        gl.domElement.addEventListener('webglcontextlost', (e) => e.preventDefault())
      }}
    >
      <Scene quality={quality} reduced={reduced} />
    </Canvas>
  )
}

function Scene({ quality, reduced }: { quality: Quality; reduced: boolean }) {
  const { viewport } = useThree()
  const narrow = viewport.width < 9.5
  // hole placement: right/center-right; tucked up on narrow viewports
  const pos = useMemo(() => {
    return {
      x: narrow ? holeOffset.x * 0.3 : holeOffset.x,
      y: narrow ? holeOffset.y + 1.5 : holeOffset.y,
    }
  }, [narrow])
  // hole position in NDC for star lensing (camera z≈11.5, fov 48)
  const bhNdc = useMemo(() => {
    const h = 2 * 11.5 * Math.tan((48 * Math.PI) / 360)
    const w = (h * viewport.width) / viewport.height
    return new THREE.Vector2((pos.x / (w / 2)) * 0.5, (pos.y / (h / 2)) * 0.5)
  }, [pos, viewport.width, viewport.height])
  const shared: Shared = useMemo(
    () => ({
      uTime: { value: 0 },
      uShip: { value: new THREE.Vector2() },
      uShipOn: { value: 0 },
      uReduced: { value: reduced ? 1 : 0 },
    }),
    [reduced],
  )
  return (
    <>
      <UniformDriver shared={shared} pos={pos} />
      <Nebula />
      <Stars q={quality} bhNdc={bhNdc} />
      <Dust q={quality} shared={shared} />
      <group position={[pos.x, pos.y, 0]}>
        <HaloArcs />
        <DiskGlow narrow={narrow} />
        <Debris q={quality} />
        <AccretionDisk q={quality} shared={shared} />
        <Infall q={quality} shared={shared} />
        {/* event horizon — pure black, depth-tested: occludes glow + arcs
            behind it while disk particles passing in front draw over it */}
        <mesh position={[0, 0, -0.25]}>
          <circleGeometry args={[1.06, 96]} />
          <meshBasicMaterial color="#000000" />
        </mesh>
      </group>
      <ambientLight intensity={0.35} />
      <directionalLight position={[6, 4, 6]} intensity={2.2} color="#8fa8ff" />
      <Rig reduced={reduced} pos={pos} />
    </>
  )
}
