import { Bookmark } from 'lucide-react'
import { useApp } from '../../state/AppContext'
import StartupCard from '../cards/StartupCard'

export default function InvSaved() {
  const { savedStartups, companies } = useApp()
  const saved = companies.filter((c) => savedStartups.includes(c.id))

  return (
    <div className="dash-page">
      <h1 className="dash-title">Saved</h1>
      <p className="text-2" style={{ fontSize: 13.5 }}>Opportunities you've bookmarked to review later.</p>

      {saved.length === 0 ? (
        <div className="empty-state glass" style={{ marginTop: 20 }}>
          <Bookmark size={30} />
          <h3>Nothing saved yet</h3>
          <p>Save opportunities from discovery to build your private shortlist.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 16, marginTop: 20 }}>
          {saved.map((c, i) => (
            <StartupCard key={c.id} company={c} delay={i * 0.05} showMatch />
          ))}
        </div>
      )}
    </div>
  )
}
