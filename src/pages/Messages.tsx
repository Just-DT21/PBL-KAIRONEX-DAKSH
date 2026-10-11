import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowLeft,
  Paperclip,
  CalendarClock,
  Send,
  Check,
  CheckCheck,
  Handshake,
  MoreHorizontal,
} from 'lucide-react'
import { useApp } from '../state/AppContext'
import { clockTime, timeAgo } from '../data/format'
import { LogoAvatar } from '../components/ui/primitives'

export function Messages() {
  const { conversations, connections, investors, companies, user, sendMessage, markRead, respondConnection } = useApp()
  const [activeId, setActiveId] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const [showAttach, setShowAttach] = useState(false)
  const [meeting, setMeeting] = useState('')
  const listRef = useRef<HTMLDivElement>(null)
  const isFounder = user?.role === 'entrepreneur'

  useEffect(() => {
    if (!activeId && conversations.length) setActiveId(conversations[0].id)
  }, [conversations, activeId])

  useEffect(() => {
    if (activeId) markRead(activeId)
  }, [activeId, markRead])

  const active = useMemo(() => conversations.find((c) => c.id === activeId) ?? null, [conversations, activeId])

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [active?.messages.length, activeId])

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!draft.trim() || !active) return
    sendMessage(active.id, draft.trim())
    setDraft('')
  }

  const pendingForMe = connections.filter(
    (c) => c.status === 'pending' && ((isFounder && c.initiator === 'investor') || (!isFounder && c.initiator === 'entrepreneur')),
  )

  return (
    <div className="page-pad" style={{ paddingBottom: 20 }}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
          <div>
            <h1 className="page-title" style={{ fontSize: 'clamp(24px, 3vw, 32px)' }}>Messages</h1>
            <p className="text-2" style={{ fontSize: 13.5 }}>
              Secure conversations with {isFounder ? 'investors' : 'founders'}. Connections unlock messaging.
            </p>
          </div>
          {pendingForMe.length > 0 && (
            <span className="badge badge-amber">{pendingForMe.length} connection request{pendingForMe.length > 1 ? 's' : ''} awaiting response</span>
          )}
        </div>

        <div className="msg-layout glass">
          {/* Conversation list */}
          <aside className={`msg-list ${active ? 'mobile-hidden' : ''}`}>
            {connections.filter((c) => c.status === 'pending').map((cn) => {
              const inv = investors.find((i) => i.id === cn.investorId)
              const comp = companies.find((c) => c.id === cn.companyId)
              const label = isFounder ? inv?.firm : comp?.name
              const hue = isFounder ? inv?.hue : comp?.hue
              return (
                <div key={cn.id} className="msg-req glass" style={{ margin: 10, padding: 12 }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <LogoAvatar name={label ?? '?'} hue={hue ?? 220} size={34} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <b style={{ fontSize: 13 }}>{label}</b>
                      <div className="text-2" style={{ fontSize: 11.5 }}>
                        {cn.initiator === (isFounder ? 'investor' : 'entrepreneur') ? 'Wants to connect' : 'Request sent'} · {timeAgo(cn.createdAt)}
                      </div>
                    </div>
                  </div>
                  {cn.note && <p style={{ fontSize: 12, color: 'var(--text-1)', margin: '8px 0' }}>“{cn.note}”</p>}
                  {cn.initiator === (isFounder ? 'investor' : 'entrepreneur') && (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={() => respondConnection(cn.id, 'accepted')}><Check size={13} /> Accept</button>
                      <button className="btn btn-danger btn-sm" onClick={() => respondConnection(cn.id, 'declined')}><Handshake size={13} /></button>
                    </div>
                  )}
                </div>
              )
            })}

            {conversations.map((cv) => {
              const hue = isFounder ? investors.find((i) => i.id === cv.investorId)?.hue ?? 220 : companies.find((c) => c.id === cv.companyId)?.hue ?? 220
              const last = cv.messages[cv.messages.length - 1]
              return (
                <button
                  key={cv.id}
                  className={`msg-item ${activeId === cv.id ? 'on' : ''}`}
                  onClick={() => setActiveId(cv.id)}
                >
                  <LogoAvatar name={isFounder ? cv.investorName : cv.companyName} hue={hue} size={40} />
                  <span style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                    <span style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                      <b style={{ fontSize: 13.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {isFounder ? cv.investorName : cv.companyName}
                      </b>
                      <span className="text-2" style={{ fontSize: 11, flex: 'none' }}>{last ? timeAgo(last.createdAt) : ''}</span>
                    </span>
                    <span className="text-2" style={{ display: 'block', fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {last?.attachment ? `📎 ${last.attachment.name}` : last?.body || 'No messages yet'}
                    </span>
                  </span>
                  {cv.unread > 0 && <span className="unread-dot" aria-label={`${cv.unread} unread`} />}
                </button>
              )
            })}
            {conversations.length === 0 && (
              <div className="empty-state" style={{ padding: 40 }}>
                <p>No conversations yet. Connect to start one.</p>
              </div>
            )}
          </aside>

          {/* Chat pane */}
          <section className={`msg-chat ${!active ? 'mobile-hidden' : ''}`}>
            {active ? (
              <>
                <header className="msg-head">
                  <button className="msg-back" onClick={() => setActiveId(null)} aria-label="Back to conversations"><ArrowLeft size={17} /></button>
                  <LogoAvatar name={isFounder ? active.investorName : active.companyName} hue={isFounder ? investors.find((i) => i.id === active.investorId)?.hue ?? 220 : companies.find((c) => c.id === active.companyId)?.hue ?? 220} size={38} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <b style={{ fontSize: 14.5 }}>{isFounder ? active.investorName : active.companyName}</b>
                    <div className="text-2" style={{ fontSize: 11.5 }}>{active.messages.length} messages · encrypted in production</div>
                  </div>
                  <button className="icon-btn" aria-label="More options"><MoreHorizontal size={17} /></button>
                </header>

                <div className="msg-body" ref={listRef}>
                  {active.messages.map((m) => {
                    const mine = m.senderId === user?.id || m.senderId === 'me'
                    if (m.kind === 'system')
                      return (
                        <div key={m.id} className="msg-system">{m.body}</div>
                      )
                    return (
                      <div key={m.id} className={`msg-row ${mine ? 'mine' : ''}`}>
                        <div className={`msg-bubble ${mine ? 'mine' : ''}`}>
                          {m.kind === 'meeting' && m.meeting && (
                            <div className="msg-meeting"><CalendarClock size={14} /> Meeting · {m.meeting.when}</div>
                          )}
                          {m.attachment && (
                            <div className="msg-attach"><Paperclip size={13} /> {m.attachment.name}</div>
                          )}
                          {m.body && <p>{m.body}</p>}
                          <span className="msg-meta">
                            {clockTime(m.createdAt)} {mine && (m.kind === 'meeting' ? <Check size={11} /> : <CheckCheck size={11} />)}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {showAttach && (
                  <div className="msg-compose-extra">
                    <button className="btn btn-ghost btn-sm" onClick={() => { sendMessage(active.id, 'Sharing our latest deck.', { attachment: { name: 'NOVA_Robotics_Pitch_Deck_v4.pdf', kind: 'Pitch Deck' } }); setShowAttach(false) }}>
                      📄 Attach pitch deck
                    </button>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input value={meeting} onChange={(e) => setMeeting(e.target.value)} placeholder="Propose a time — e.g. Friday 3pm IST" style={{ flex: 1, fontSize: 12.5, padding: '7px 10px' }} />
                      <button className="btn btn-ghost btn-sm" onClick={() => { if (meeting.trim()) { sendMessage(active.id, `Meeting proposed: ${meeting.trim()}`, { meeting: { when: meeting.trim() } }); setMeeting('') } }}>
                        <CalendarClock size={13} /> Propose
                      </button>
                    </div>
                  </div>
                )}

                <form className="msg-compose" onSubmit={submit}>
                  <button type="button" className="icon-btn" onClick={() => setShowAttach(!showAttach)} aria-label="Attach or propose meeting"><Paperclip size={17} /></button>
                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Write a message…"
                    aria-label="Message"
                  />
                  <button className="btn btn-primary" style={{ padding: '10px 16px' }} aria-label="Send message"><Send size={15} /></button>
                </form>
              </>
            ) : (
              <div className="empty-state" style={{ margin: 'auto' }}>
                <p>Select a conversation to begin.</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}

export default Messages
