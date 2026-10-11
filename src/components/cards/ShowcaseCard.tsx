import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Save, Heart, PlayCircle } from 'lucide-react'
import { useState } from 'react'
import type { ShowcasePost } from '../../data/types'
import { inr, timeAgo } from '../../data/format'
import { useApp } from '../../state/AppContext'
import { LogoAvatar } from '../ui/primitives'
import ConnectButton from './ConnectButton'

export default function ShowcaseCard({ post, delay = 0 }: { post: ShowcasePost; delay?: number }) {
  const { getCompany, savedStartups, toggleSaved } = useApp()
  const [liked, setLiked] = useState(false)
  const company = getCompany(post.companyId)
  const saved = savedStartups.includes(post.companyId)

  return (
    <motion.article
      initial={{ opacity: 0, y: 26 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 0.7, 0.25, 1] }}
      className="glass card-hover showcase-card"
      style={{ overflow: 'hidden' }}
    >
      <div
        aria-hidden
        style={{
          position: 'relative',
          height: 200,
          background: `
            radial-gradient(90% 120% at 18% 12%, hsl(${post.hue} 80% 60% / 0.28), transparent 60%),
            radial-gradient(80% 100% at 85% 90%, hsl(${(post.hue + 70) % 360} 75% 55% / 0.22), transparent 65%),
            linear-gradient(160deg, hsl(${post.hue} 45% 12%), hsl(${(post.hue + 40) % 360} 40% 8%))`,
          display: 'grid',
          placeItems: 'center',
        }}
      >
        <div style={{ display: 'grid', placeItems: 'center', gap: 8, opacity: 0.92 }}>
          <LogoAvatar name={post.productName} hue={post.hue} size={64} />
          {post.media.type === 'video' && (
            <span style={{ color: 'var(--text-2)', fontSize: 11, display: 'inline-flex', gap: 5, alignItems: 'center' }}>
              <PlayCircle size={13} /> video walkthrough available
            </span>
          )}
        </div>
        <span className="badge badge-violet" style={{ position: 'absolute', top: 12, right: 12 }}>
          {post.stage}
        </span>
        <span className="demo-tag" style={{ position: 'absolute', bottom: 10, left: 12 }}>
          Sample media
        </span>
      </div>

      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <LogoAvatar name={post.productName} hue={post.hue} size={38} />
          <div style={{ minWidth: 0 }}>
            <h3 style={{ fontSize: 17 }}>{post.productName}</h3>
            <div style={{ fontSize: 12, color: 'var(--text-2)' }}>
              by{' '}
              {company ? (
                <Link to={`/startups/${company.id}`} style={{ color: 'var(--blue)', fontWeight: 600 }}>
                  {company.name}
                </Link>
              ) : (
                '—'
              )}{' '}
              · {timeAgo(post.postedAt)}
            </div>
          </div>
        </div>

        <p style={{ fontWeight: 600, fontSize: 14.5, color: 'var(--text-hi)' }}>{post.headline}</p>
        <p style={{ fontSize: 13.5, color: 'var(--text-1)' }}>{post.description}</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 12.5 }}>
          <div className="sc-fact">
            <span className="sc-fact-label">Problem solved</span>
            <span className="sc-fact-value">{post.problemSolved}</span>
          </div>
          <div className="sc-fact">
            <span className="sc-fact-label">Pricing</span>
            <span className="sc-fact-value">{post.pricing}</span>
          </div>
          <div className="sc-fact">
            <span className="sc-fact-label">Target audience</span>
            <span className="sc-fact-value">{post.audience}</span>
          </div>
          <div className="sc-fact">
            <span className="sc-fact-label">Funding needed</span>
            <span className="sc-fact-value strong">{inr(post.fundingNeeded)}</span>
          </div>
        </div>

        <div className="sc-actions" style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
          <Link to={`/startups/${post.companyId}`} className="btn btn-primary btn-sm">
            Explore
          </Link>
          <button className="btn btn-ghost btn-sm" onClick={() => toggleSaved(post.companyId)} aria-pressed={saved}>
            <Save size={13} /> {saved ? 'Saved' : 'Save'}
          </button>
          <ConnectButton companyId={post.companyId} compact />
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setLiked(!liked)}
            aria-pressed={liked}
            style={{ marginLeft: 'auto', color: liked ? '#f472b6' : undefined }}
          >
            <Heart size={13} fill={liked ? 'currentColor' : 'none'} /> {post.likes + (liked ? 1 : 0)}
          </button>
        </div>
      </div>
    </motion.article>
  )
}
