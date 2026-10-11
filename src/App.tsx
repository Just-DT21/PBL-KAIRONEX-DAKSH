import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { AppProviders } from './state/AppContext'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import FloatingAssistant from './components/assistant/FloatingAssistant'
import GlobalSearch from './components/search/GlobalSearch'
import Landing from './pages/Landing'
import Auth from './pages/Auth'
import Onboarding from './pages/Onboarding'
import Discovery from './pages/Discovery'
import StartupProfile from './pages/StartupProfile'
import InvestorsPage from './pages/InvestorsPage'
import InvestorProfilePage from './pages/InvestorProfilePage'
import Showcase from './pages/Showcase'
import AIMatchPage from './pages/AIMatchPage'
import Messages from './pages/Messages'
import DashboardPage from './pages/DashboardPage'
import TrustSafety from './pages/TrustSafety'
import LegalPage from './pages/LegalPage'
import Admin from './pages/Admin'
import NotFound from './pages/NotFound'

function ScrollToTopOnRoute() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) {
      // let the new page mount, then jump to the anchor (instant — smooth
      // scrolling stalls when the tab/webview is hidden or rAF is throttled)
      const t = setTimeout(() => {
        document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'instant', block: 'start' })
      }, 80)
      return () => clearTimeout(t)
    }
    window.scrollTo(0, 0)
  }, [pathname, hash])
  return null
}

/** /entrepreneur/* → the entrepreneur dashboard (same app, friendlier URL). */
function EntShim() {
  return <DashboardRedirect role="entrepreneur" />
}

/** /investor/* → the investor dashboard (same app, friendlier URL). */
function InvShim() {
  return <DashboardRedirect role="investor" />
}

function DashboardRedirect({ role }: { role: 'entrepreneur' | 'investor' }) {
  return <Navigate to={role === 'investor' ? '/dashboard/discover' : '/dashboard'} replace />
}

export default function App() {
  const location = useLocation()
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    const onOpenSearch = () => setSearchOpen(true)
    window.addEventListener('keydown', onKey)
    window.addEventListener('nb:open-search', onOpenSearch)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('nb:open-search', onOpenSearch)
    }
  }, [])

  return (
    <AppProviders>
      <ScrollToTopOnRoute />
      <div className="app-shell">
        <Navbar />
        <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname.split('/').slice(0, 2).join('/')}>
            <Route path="/" element={<Landing />} />

            {/* ------- Friendly aliases: real pages live at the canonical paths,
                    these keep older/deep links and expected URLs working ------- */}
            <Route path="/login" element={<Navigate to="/auth?mode=login" replace />} />
            <Route path="/signup" element={<Navigate to="/auth?mode=signup" replace />} />
            <Route path="/register" element={<Navigate to="/auth?mode=signup" replace />} />
            <Route path="/how-it-works" element={<Landing anchor="how-it-works" />} />
            <Route path="/startups" element={<Navigate to="/explore" replace />} />
            <Route path="/settings" element={<Navigate to="/dashboard/settings" replace />} />
            <Route path="/profile" element={<Navigate to="/dashboard/settings" replace />} />
            <Route path="/entrepreneur/*" element={<EntShim />} />
            <Route path="/investor/*" element={<InvShim />} />

            <Route path="/auth" element={<Auth />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/explore" element={<Discovery />} />
            <Route path="/startups/:id" element={<StartupProfile />} />
            <Route path="/investors" element={<InvestorsPage />} />
            <Route path="/investors/:id" element={<InvestorProfilePage />} />
            <Route path="/showcase" element={<Showcase />} />
            <Route path="/ai-match" element={<AIMatchPage />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/dashboard/*" element={<DashboardPage />} />
            <Route path="/admin/*" element={<Admin />} />
            <Route path="/trust-safety" element={<TrustSafety />} />
            <Route path="/legal/:slug" element={<LegalPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AnimatePresence>
        <FloatingAssistant />
        <Footer />
      </div>
    </AppProviders>
  )
}
