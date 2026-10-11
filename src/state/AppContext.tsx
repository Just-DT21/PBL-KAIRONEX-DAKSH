import { createContext, useContext, useCallback, useMemo, useState, type ReactNode } from 'react'
import type {
  Role,
  Company,
  Investor,
  Connection,
  Conversation,
  Message,
  Notification,
  InvestorPreferences,
  Report,
  VerificationRequest,
  VerificationLevel,
} from '../data/types'
import {
  COMPANIES,
  INVESTORS,
  CONVERSATIONS,
  CONNECTIONS,
  REPORTS,
  VERIFICATION_QUEUE,
} from '../data/seed'
import { uid } from '../data/format'

export function nowISO(): string {
  return new Date().toISOString()
}

export interface SessionUser {
  id: string
  name: string
  email: string
  role: Role
}

interface AppState {
  user: SessionUser | null
  login: (role: Role, name?: string, email?: string) => void
  logout: () => void

  companies: Company[]
  investors: Investor[]
  getCompany: (id: string) => Company | undefined
  getInvestor: (id: string) => Investor | undefined
  updateCompany: (id: string, patch: Partial<Company>) => void

  savedStartups: string[]
  toggleSaved: (id: string) => void
  savedInvestors: string[]
  toggleSavedInvestor: (id: string) => void

  connections: Connection[]
  requestConnection: (companyId: string, investorId: string, initiator: Role, note?: string) => void
  respondConnection: (id: string, status: 'accepted' | 'declined') => void
  connectionFor: (companyId: string, investorId: string) => Connection | undefined

  conversations: Conversation[]
  sendMessage: (conversationId: string, body: string, opts?: { attachment?: { name: string; kind: string }; meeting?: { when: string } }) => void
  markRead: (conversationId: string) => void
  openConversationFor: (companyId: string, investorId: string) => string | null

  investorPrefs: InvestorPreferences
  setInvestorPrefs: (p: InvestorPreferences) => void

  notifications: Notification[]
  unreadCount: number
  markAllRead: () => void

  reports: Report[]
  addReport: (r: Omit<Report, 'id' | 'createdAt' | 'status'>) => void
  setReportStatus: (id: string, status: Report['status']) => void

  verifications: VerificationRequest[]
  setVerificationStatus: (id: string, status: VerificationRequest['status']) => void
  upgradeCompanyVerification: (id: string, level: VerificationLevel) => void

  demo: true
}

const Ctx = createContext<AppState | null>(null)

const SESSION_KEY = 'nb_demo_session'

function readSession(): SessionUser | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    return raw ? (JSON.parse(raw) as SessionUser) : null
  } catch {
    return null
  }
}

function writeSession(u: SessionUser | null) {
  try {
    if (u) sessionStorage.setItem(SESSION_KEY, JSON.stringify(u))
    else sessionStorage.removeItem(SESSION_KEY)
  } catch {
    /* storage unavailable — session stays in memory */
  }
}

export function AppProviders({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(readSession)
  const [companies, setCompanies] = useState<Company[]>(COMPANIES)
  const [savedStartups, setSavedStartups] = useState<string[]>(['lumen-health', 'tessellate'])
  const [savedInvestors, setSavedInvestors] = useState<string[]>(['apex-ventures'])
  const [connections, setConnections] = useState<Connection[]>(CONNECTIONS)
  const [conversations, setConversations] = useState<Conversation[]>(CONVERSATIONS)
  const [investorPrefs, setInvestorPrefsState] = useState<InvestorPreferences>({
    industries: ['Robotics', 'AI'],
    range: { min: 2000000, max: 5000000 },
    stages: ['Seed', 'MVP'],
    geography: ['India'],
    audience: ['B2B'],
    riskAppetite: 'Balanced',
    rawQuery: 'I want to invest ₹20L–₹50L into early-stage robotics or AI startups in India.',
  })
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: uid('nt'),
      kind: 'connection',
      title: 'New connection request',
      body: 'Orbit Syndicate wants to connect about NOVA Robotics.',
      read: false,
      at: nowISO(),
      link: '/messages',
    },
    {
      id: uid('nt'),
      kind: 'interest',
      title: 'Your profile is trending',
      body: 'NOVA Robotics appeared in 128 investor searches this week.',
      read: false,
      at: nowISO(),
      link: '/dashboard/analytics',
    },
    {
      id: uid('nt'),
      kind: 'message',
      title: 'Apex Ventures replied',
      body: '“Does the ₹5L minimum apply to follow-on pro-rata?”',
      read: true,
      at: nowISO(),
      link: '/messages',
    },
  ])
  const [reports, setReports] = useState<Report[]>(REPORTS)
  const [verifications, setVerifications] = useState<VerificationRequest[]>(VERIFICATION_QUEUE)

  const login = useCallback((role: Role, name?: string, email?: string) => {
    const u: SessionUser = {
      id: uid('u'),
      name: name ?? (role === 'investor' ? 'Nadia Qureshi' : 'Ananya Rao'),
      email: email ?? (role === 'investor' ? 'nadia@lightningrock.com' : 'ananya@novarobotics.in'),
      role,
    }
    setUser(u)
    writeSession(u)
  }, [])
  const logout = useCallback(() => {
    setUser(null)
    writeSession(null)
  }, [])

  const getCompany = useCallback((id: string) => companies.find((c) => c.id === id), [companies])
  const getInvestor = useCallback((id: string) => INVESTORS.find((i) => i.id === id), [])
  const updateCompany = useCallback((id: string, patch: Partial<Company>) => {
    setCompanies((cs) => cs.map((c) => (c.id === id ? { ...c, ...patch } : c)))
  }, [])

  const toggleSaved = useCallback((id: string) => {
    setSavedStartups((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))
  }, [])
  const toggleSavedInvestor = useCallback((id: string) => {
    setSavedInvestors((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))
  }, [])

  const requestConnection = useCallback(
    (companyId: string, investorId: string, initiator: Role, note?: string) => {
      setConnections((cs) => {
        const existing = cs.find((c) => c.companyId === companyId && c.investorId === investorId)
        if (existing) return cs
        return [...cs, { id: uid('cn'), companyId, investorId, initiator, status: 'pending', note, createdAt: nowISO() }]
      })
      setConversations((cvs) => {
        if (cvs.some((cv) => cv.companyId === companyId && cv.investorId === investorId)) return cvs
        const company = COMPANIES.find((c) => c.id === companyId)
        const investor = INVESTORS.find((i) => i.id === investorId)
        if (!company || !investor) return cvs
        const cvId = uid('cv')
        const sys: Message = {
          id: uid('m'),
          conversationId: cvId,
          senderId: 'system',
          senderName: 'KAIRONEXA',
          body:
            initiator === 'entrepreneur'
              ? `${company.name} sent a connection request to ${investor.firm}. Once accepted, you can exchange messages, documents and meeting requests.`
              : `${investor.firm} sent a connection request to ${company.name}. Once accepted, you can exchange messages, documents and meeting requests.`,
          createdAt: nowISO(),
          kind: 'system',
        }
        return [
          {
            id: cvId,
            companyId,
            companyName: company.name,
            investorId,
            investorName: investor.firm,
            messages: [sys],
            unread: initiator === 'entrepreneur' ? 1 : 0,
          },
          ...cvs,
        ]
      })
      setNotifications((ns) => [
        {
          id: uid('nt'),
          kind: 'connection',
          title: 'Connection request sent',
          body: initiator === 'entrepreneur' ? 'The investor has been notified.' : 'The founder has been notified.',
          read: false,
          at: nowISO(),
          link: '/messages',
        },
        ...ns,
      ])
    },
    [],
  )

  const respondConnection = useCallback((id: string, status: 'accepted' | 'declined') => {
    setConnections((cs) => cs.map((c) => (c.id === id ? { ...c, status } : c)))
  }, [])

  const connectionFor = useCallback(
    (companyId: string, investorId: string) => connections.find((c) => c.companyId === companyId && c.investorId === investorId),
    [connections],
  )

  const sendMessage = useCallback(
    (conversationId: string, body: string, opts?: { attachment?: { name: string; kind: string }; meeting?: { when: string } }) => {
      setConversations((cvs) =>
        cvs.map((cv) =>
          cv.id === conversationId
            ? {
                ...cv,
                unread: 0,
                messages: [
                  ...cv.messages,
                  {
                    id: uid('m'),
                    conversationId,
                    senderId: user?.id ?? 'me',
                    senderName: user?.name ?? 'You',
                    body,
                    attachment: opts?.attachment,
                    meeting: opts?.meeting,
                    createdAt: nowISO(),
                    kind: opts?.meeting ? 'meeting' : 'message',
                  },
                ],
              }
            : cv,
        ),
      )
    },
    [user],
  )

  const markRead = useCallback((conversationId: string) => {
    setConversations((cvs) => cvs.map((cv) => (cv.id === conversationId ? { ...cv, unread: 0 } : cv)))
  }, [])

  const openConversationFor = useCallback(
    (companyId: string, investorId: string) => {
      const cv = conversations.find((c) => c.companyId === companyId && c.investorId === investorId)
      return cv?.id ?? null
    },
    [conversations],
  )

  const setInvestorPrefs = useCallback((p: InvestorPreferences) => setInvestorPrefsState(p), [])

  const markAllRead = useCallback(() => setNotifications((ns) => ns.map((n) => ({ ...n, read: true }))), [])

  const addReport = useCallback((r: Omit<Report, 'id' | 'createdAt' | 'status'>) => {
    setReports((rs) => [{ ...r, id: uid('rp'), createdAt: nowISO(), status: 'Open' }, ...rs])
  }, [])

  const setReportStatus = useCallback((id: string, status: Report['status']) => {
    setReports((rs) => rs.map((r) => (r.id === id ? { ...r, status } : r)))
  }, [])

  const setVerificationStatus = useCallback((id: string, status: VerificationRequest['status']) => {
    setVerifications((vs) => vs.map((v) => (v.id === id ? { ...v, status } : v)))
  }, [])

  const upgradeCompanyVerification = useCallback((id: string, level: VerificationLevel) => {
    setCompanies((cs) => cs.map((c) => (c.id === id ? { ...c, verification: level } : c)))
  }, [])

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications])

  const value: AppState = {
    user,
    login,
    logout,
    companies,
    investors: INVESTORS,
    getCompany,
    getInvestor,
    updateCompany,
    savedStartups,
    toggleSaved,
    savedInvestors,
    toggleSavedInvestor,
    connections,
    requestConnection,
    respondConnection,
    connectionFor,
    conversations,
    sendMessage,
    markRead,
    openConversationFor,
    investorPrefs,
    setInvestorPrefs,
    notifications,
    unreadCount,
    markAllRead,
    reports,
    addReport,
    setReportStatus,
    verifications,
    setVerificationStatus,
    upgradeCompanyVerification,
    demo: true,
  }

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useApp(): AppState {
  const v = useContext(Ctx)
  if (!v) throw new Error('useApp must be used inside AppProviders')
  return v
}
