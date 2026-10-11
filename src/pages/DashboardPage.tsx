import { Routes, Route, Navigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Building2,
  Send,
  Users,
  Heart,
  MessageSquare,
  BarChart3,
  FileText,
  ShieldCheck,
  Settings,
  Search,
  Sparkles,
  Bookmark,
} from 'lucide-react'
import DashLayout, { type DashItem } from '../components/dashboard/DashLayout'
import EntOverview from '../components/dashboard/EntOverview'
import EntCompany from '../components/dashboard/EntCompany'
import EntOpportunities from '../components/dashboard/EntOpportunities'
import EntInvestors from '../components/dashboard/EntInvestors'
import EntDocuments from '../components/dashboard/EntDocuments'
import EntVerification from '../components/dashboard/EntVerification'
import InvDiscover from '../components/dashboard/InvDiscover'
import InvAIMatch from '../components/dashboard/InvAIMatch'
import InvSaved from '../components/dashboard/InvSaved'
import { useApp } from '../state/AppContext'

const ENT_ITEMS: DashItem[] = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { to: '/dashboard/company', label: 'My Company', short: 'Company', icon: Building2 },
  { to: '/dashboard/opportunities', label: 'My Opportunities', short: 'Raises', icon: Send },
  { to: '/dashboard/investors', label: 'Investors', icon: Users },
  { to: '/dashboard/matches', label: 'Matches', icon: Heart },
  { to: '/messages', label: 'Messages', icon: MessageSquare },
  { to: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/dashboard/documents', label: 'Documents', icon: FileText },
  { to: '/dashboard/verification', label: 'Verification', icon: ShieldCheck },
  { to: '/dashboard/settings', label: 'Settings', icon: Settings },
]

const INV_ITEMS: DashItem[] = [
  { to: '/dashboard/discover', label: 'Discover', icon: Search },
  { to: '/dashboard/ai-match', label: 'AI Match', icon: Sparkles },
  { to: '/dashboard/saved', label: 'Saved', icon: Bookmark },
  { to: '/messages', label: 'Messages', icon: MessageSquare },
  { to: '/dashboard/prefs', label: 'Preferences', icon: Settings },
]

export default function DashboardPage() {
  const { user } = useApp()

  if (!user) {
    return (
      <div className="page-pad">
        <div className="container center" style={{ padding: '80px 0' }}>
          <h2>Log in to view your dashboard</h2>
          <p className="text-2" style={{ margin: '10px 0 24px' }}>Use a demo account — no signup data is stored.</p>
          <a className="btn btn-primary btn-lg" href="/auth">Go to log in</a>
        </div>
      </div>
    )
  }

  if (user.role === 'investor') {
    return (
      <DashLayout items={INV_ITEMS} title="Investor">
        <Routes>
          <Route index element={<Navigate to="discover" replace />} />
          <Route path="discover" element={<InvDiscover />} />
          <Route path="ai-match" element={<InvAIMatch />} />
          <Route path="saved" element={<InvSaved />} />
          <Route path="prefs" element={<InvPrefs />} />
          <Route path="*" element={<Navigate to="discover" replace />} />
        </Routes>
      </DashLayout>
    )
  }

  return (
    <DashLayout items={ENT_ITEMS} title="Entrepreneur">
      <Routes>
        <Route index element={<EntOverview />} />
        <Route path="company" element={<EntCompany />} />
        <Route path="opportunities" element={<EntOpportunities />} />
        <Route path="investors" element={<EntInvestors />} />
        <Route path="matches" element={<EntMatches />} />
        <Route path="analytics" element={<EntAnalytics />} />
        <Route path="documents" element={<EntDocuments />} />
        <Route path="verification" element={<EntVerification />} />
        <Route path="settings" element={<SimpleSettings />} />
        <Route path="*" element={<Navigate to="" replace />} />
      </Routes>
    </DashLayout>
  )
}

function EntMatches() {
  return <EntInvestors matchesOnly />
}

function EntAnalytics() {
  return <EntOverview analytics />
}

function InvPrefs() {
  return <InvAIMatch prefsOnly />
}

function SimpleSettings() {
  return (
    <div className="dash-page">
      <h1 className="dash-title">Settings</h1>
      <div className="glass" style={{ padding: 22, maxWidth: 560 }}>
        <p className="text-1" style={{ fontSize: 14 }}>
          Prototype settings. In production this section manages profile, notifications, security and data-export
          preferences. Nothing you change here persists — this demo stores no data.
        </p>
      </div>
    </div>
  )
}
