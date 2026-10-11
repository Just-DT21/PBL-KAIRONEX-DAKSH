import type { Company, Investor, InvestorPreferences, MatchResult, MatchFactor, Stage } from './types'
import { inr, clamp } from './format'

const STAGE_ORDER: Stage[] = ['Idea', 'Prototype', 'MVP', 'Seed', 'Series A', 'Series B', 'Growth']

function sectorOverlap(a: string[], b: string[]): number {
  if (!a.length || !b.length) return 50
  const na = a.map((s) => s.toLowerCase())
  const nb = b.map((s) => s.toLowerCase())
  let hits = 0
  for (const x of na) {
    for (const y of nb) {
      if (x === y || x.includes(y) || y.includes(x)) {
        hits++
        break
      }
    }
  }
  if (hits >= 2) return 100
  if (hits === 1) return 74
  return 18
}

function rangeScore(value: number, min: number, max: number): number {
  if (value >= min && value <= max) return 100
  const mid = (min + max) / 2
  const dist = Math.abs(value - mid) / Math.max(mid, 1)
  return clamp(100 - dist * 160, 8, 100)
}

function geoScore(geo: string[], location: string): number {
  if (!geo.length) return 70
  const loc = location.toLowerCase()
  if (geo.some((g) => loc.includes(g.toLowerCase()) || g.toLowerCase().includes(loc))) return 100
  if (geo.some((g) => g.toLowerCase() === 'india')) return 72
  return 30
}

function stageScore(stages: Stage[], stage: Stage): number {
  if (!stages.length) return 70
  if (stages.includes(stage)) return 100
  const ci = STAGE_ORDER.indexOf(stage)
  const near = stages.some((s) => Math.abs(STAGE_ORDER.indexOf(s) - ci) === 1)
  return near ? 55 : 20
}

function audienceScore(prefs: InvestorPreferences, audience: Company['audience']): number {
  if (!prefs.audience.length) return 70
  if (prefs.audience.includes(audience)) return 100
  return 28
}

function riskScore(appetite: InvestorPreferences['riskAppetite'], risk: Company['riskCategory']): number {
  if (appetite === 'Bold') return risk === 'Elevated' ? 100 : risk === 'Moderate' ? 78 : 55
  if (appetite === 'Conservative') return risk === 'Lower' ? 100 : risk === 'Moderate' ? 62 : 30
  return risk === 'Moderate' ? 100 : risk === 'Lower' ? 84 : 70
}

function factor(label: string, weightPct: number, score: number, note: string): MatchFactor {
  return { label, weightPct, score: Math.round(score), note }
}

export function computeMatch(company: Company, inv: Investor, prefs?: InvestorPreferences): MatchResult {
  const range = prefs?.range ?? inv.investmentRange
  const ticket = Math.max(company.minInvestment, company.fundingTarget * 0.05)
  const industries = prefs?.industries.length ? prefs.industries : inv.industries
  const stages = prefs?.stages.length ? prefs.stages : inv.stages
  const geo = prefs?.geography.length ? prefs.geography : inv.geography

  const factors: MatchFactor[] = [
    factor(
      'Sector alignment',
      30,
      sectorOverlap(industries, [company.industry, ...company.sectorTags]),
      industries.length ? 'Based on your selected industries.' : `Based on ${inv.firm}'s stated focus.`,
    ),
    factor(
      'Investment size alignment',
      25,
      rangeScore(ticket, range.min, range.max),
      `Minimum ticket ${inr(ticket)} vs your typical range ${inr(range.min)}–${inr(range.max)}.`,
    ),
    factor(
      'Stage alignment',
      20,
      stageScore(stages, company.stage),
      stages.length ? `Company is at ${company.stage} stage.` : 'No stage preference set.',
    ),
    factor(
      'Geographic alignment',
      15,
      geoScore(geo, company.location),
      geo.length ? `Company operates from ${company.location}.` : 'No geography preference set.',
    ),
    factor(
      'Business model alignment',
      10,
      prefs ? audienceScore(prefs, company.audience) : 70,
      `Company is ${company.audience}.`,
    ),
  ]

  // Risk appetite is a light modifier, not a scored factor
  if (prefs?.riskAppetite) {
    const rs = riskScore(prefs.riskAppetite, company.riskCategory)
    factors.push(factor('Risk profile', 0, rs, `Founder-declared risk category: ${company.riskCategory}.`))
  }

  let score = factors.reduce((acc, f) => acc + f.score * (f.weightPct / 100), 0)
  score = clamp(Math.round(score), 15, 97)

  return {
    score,
    factors,
    summary:
      score >= 85
        ? 'Strong overlap with the stated preferences across most dimensions.'
        : score >= 70
          ? 'Meaningful overlap with several stated preferences.'
          : 'Limited overlap — review the factor breakdown below.',
  }
}
