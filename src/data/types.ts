// ============================================================
// KAIRONEXA — Core data models (frontend-first, backend-ready)
// These interfaces mirror the future API/database schema.
// ============================================================

export type Role = 'entrepreneur' | 'investor' | 'admin'

export type VerificationLevel = 'none' | 'identity' | 'company' | 'documents'

export interface User {
  id: string
  name: string
  email: string
  phone?: string
  role: Role
  verification: VerificationLevel
  createdAt: string
}

export interface FounderInfo {
  userId: string
  companyId: string
  title: string
  linkedin?: string
  bio?: string
}

export interface Founder {
  id: string
  name: string
  title: string
  bio?: string
}

export type Stage = 'Idea' | 'Prototype' | 'MVP' | 'Seed' | 'Series A' | 'Series B' | 'Growth'

export interface Company {
  id: string
  name: string
  tagline: string
  description: string
  problem?: string
  solution?: string
  industry: string
  sectorTags: string[]
  stage: Stage
  location: string
  foundedYear: number
  teamSize: number
  businessModel: string
  audience: 'B2B' | 'B2C' | 'B2B2C' | 'D2C'
  technologies: string[]
  website?: string
  logoInitials?: string
  hue: number

  // Financials — all absolute INR
  revenue: number // ARR / annualized
  revenueGrowth: number // % YoY
  valuation: number
  fundingTarget: number
  fundingRaised: number // includes this round commitments
  minInvestment: number
  equityOffered?: number // %
  previousFunding?: { round: string; amount: number; investor?: string }[]
  useOfFunds: { label: string; pct: number }[]
  monthlyBurn?: number
  runwayMonths?: number

  traction: { label: string; value: string }[]
  market?: { tam?: string; sam?: string; som?: string; note?: string }
  team: Founder[]
  productGallery?: { type: 'image' | 'video' | 'demo'; label: string; note?: string }[]
  faqs?: { q: string; a: string }[]
  documents: { name: string; kind: 'Pitch Deck' | 'Financials' | 'Legal' | 'Product' | 'Other' }[]
  verification: VerificationLevel
  views: number
  interestedCount: number
  publishedAt: string
  riskCategory: 'Lower' | 'Moderate' | 'Elevated'
}

export type InvestorType =
  | 'Angel Investor'
  | 'Venture Capital'
  | 'Investment Firm'
  | 'Family Office'
  | 'Corporate Investor'
  | 'Other'

export interface Investor {
  id: string
  firm: string
  person: string
  type: InvestorType
  about: string
  thesis: string
  industries: string[]
  investmentRange: { min: number; max: number }
  geography: string[]
  stages: Stage[]
  businessModels: string[]
  portfolio: { name: string; sector: string; note?: string }[]
  previousInvestments: { name: string; round: string; year: number }[]
  currentInterests: string[]
  founderPreferences: string[]
  verification: VerificationLevel
  dealsClosed: number
  hue: number
}

export interface InvestorPreferences {
  rawQuery?: string
  range?: { min: number; max: number }
  industries: string[]
  stages: Stage[]
  geography: string[]
  audience: ('B2B' | 'B2C' | 'B2B2C' | 'D2C')[]
  riskAppetite: 'Conservative' | 'Balanced' | 'Bold'
}

export interface Opportunity {
  id: string
  companyId: string
  roundName: string
  fundingTarget: number
  raisedSoFar: number
  minTicket: number
  equityOffered?: number
  status: 'Draft' | 'Published' | 'Paused' | 'Closed'
  documents: string[]
  createdAt: string
  closesOn?: string
}

export type ConnectionStatus = 'pending' | 'accepted' | 'declined'

export interface Connection {
  id: string
  companyId: string
  investorId: string
  initiator: Role
  status: ConnectionStatus
  note?: string
  createdAt: string
}

export interface Message {
  id: string
  conversationId: string
  senderId: string
  senderName: string
  body: string
  attachment?: { name: string; kind: string }
  meeting?: { when: string }
  createdAt: string
  kind: 'message' | 'request' | 'system' | 'meeting'
}

export interface Conversation {
  id: string
  companyId: string
  companyName: string
  investorId: string
  investorName: string
  messages: Message[]
  unread: number
}

export interface ShowcasePost {
  id: string
  companyId: string
  productName: string
  headline: string
  description: string
  problemSolved: string
  pricing: string
  audience: string
  stage: Stage
  fundingNeeded: number
  media: { type: 'image' | 'video'; label: string }
  hue: number
  likes: number
  postedAt: string
}

export interface Report {
  id: string
  kind: 'Opportunity' | 'User' | 'Message' | 'Showcase Post'
  target: string
  reason: string
  detail: string
  status: 'Open' | 'Reviewing' | 'Resolved'
  createdAt: string
}

export interface VerificationRequest {
  id: string
  subject: string
  kind: 'Identity' | 'Company' | 'Documents' | 'Investor'
  submittedBy: string
  submittedAt: string
  docs: string[]
  status: 'Pending' | 'Approved' | 'Rejected'
}

export interface PlatformStats {
  startups: number
  capitalSoughtCr: number
  investors: number
  industries: number
  demo: true
}

export interface Notification {
  id: string
  kind: 'connection' | 'message' | 'system' | 'interest'
  title: string
  body: string
  read: boolean
  at: string
  link?: string
}

// ---------- AI structures ----------

export interface MatchFactor {
  label: string
  weightPct: number
  score: number // 0..100
  note: string
}

export interface MatchResult {
  score: number
  factors: MatchFactor[]
  summary: string
}

export interface OpportunityAnalysis {
  businessModel: string | null
  market: string | null
  traction: string | null
  fundingRequest: string | null
  useOfFunds: string | null
  team: string | null
  considerations: string | null
}
