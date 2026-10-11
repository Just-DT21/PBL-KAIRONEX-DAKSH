import { useMemo, useState } from 'react'
import { Sparkles, Flame, Clock } from 'lucide-react'
import { ShowcaseCard } from '../components/cards/platform-cards'
import { SHOWCASE_POSTS } from '../data/seed'

type Feed = 'latest' | 'trending'

export default function Showcase() {
  const [feed, setFeed] = useState<Feed>('latest')

  const posts = useMemo(() => {
    const arr = [...SHOWCASE_POSTS]
    return feed === 'trending' ? arr.sort((a, b) => b.likes - a.likes) : arr.sort((a, b) => +new Date(b.postedAt) - +new Date(a.postedAt))
  }, [feed])

  return (
    <div className="page-pad">
      <div className="container" style={{ maxWidth: 760 }}>
        <div className="center section-head" style={{ margin: '0 auto 30px' }}>
          <div className="eyebrow"><Sparkles size={12} /> Showcase</div>
          <h1 className="page-title">The Launch Feed</h1>
          <p className="page-sub">
            Short product posts from companies raising on KAIRONEXA. See what founders are shipping — and what they're
            building toward.
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 28 }}>
          <button className={`chip ${feed === 'latest' ? 'on' : ''}`} onClick={() => setFeed('latest')}><Clock size={13} style={{ verticalAlign: '-2px' }} /> Latest</button>
          <button className={`chip ${feed === 'trending' ? 'on' : ''}`} onClick={() => setFeed('trending')}><Flame size={13} style={{ verticalAlign: '-2px' }} /> Trending</button>
        </div>

        <div style={{ display: 'grid', gap: 22 }}>
          {posts.map((p, i) => (
            <ShowcaseCard key={p.id} post={p} delay={Math.min(i * 0.06, 0.3)} />
          ))}
        </div>

        <p className="demo-tag" style={{ marginTop: 26, display: 'block', textAlign: 'center' }}>
          Sample posts · media shown as generated placeholders in this prototype
        </p>
      </div>
    </div>
  )
}
