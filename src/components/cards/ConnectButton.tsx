import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Handshake, MessageSquare, Pencil } from 'lucide-react'
import { useApp } from '../../state/AppContext'

export default function ConnectButton({
  companyId,
  investorId,
  compact,
}: {
  companyId: string
  investorId?: string
  compact?: boolean
}) {
  const { user, requestConnection, connectionFor } = useApp()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [note, setNote] = useState('')

  const resolvedInvestor = investorId ?? 'apex-ventures'
  const size = compact ? 'btn-sm' : ''
  const conn = user ? connectionFor(companyId, resolvedInvestor) : undefined

  // Founders viewing their own company get an edit CTA, not a connect CTA.
  if (user?.role === 'entrepreneur' && companyId === 'nova-robotics') {
    return (
      <button className={`btn btn-primary ${size}`} onClick={() => navigate('/dashboard/company')}>
        <Pencil size={13} /> Edit profile
      </button>
    )
  }

  if (!user) {
    return (
      <button className={`btn btn-ghost ${size}`} onClick={() => navigate('/auth')}>
        <Handshake size={13} /> Connect
      </button>
    )
  }

  if (conn?.status === 'accepted') {
    return (
      <button className={`btn btn-ghost ${size}`} onClick={() => navigate('/messages')}>
        <MessageSquare size={13} /> Open chat
      </button>
    )
  }
  if (conn?.status === 'pending') {
    return (
      <button className={`btn btn-ghost ${size}`} disabled>
        {conn.initiator === user.role ? 'Request sent' : 'Respond in messages'}
      </button>
    )
  }

  if (open) {
    return (
      <span style={{ display: 'inline-flex', gap: 6 }}>
        <input
          placeholder="Short note (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          style={{ fontSize: 12.5, padding: '6px 10px', width: 170 }}
        />
        <button
          className={`btn btn-primary ${size}`}
          onClick={() => {
            requestConnection(companyId, resolvedInvestor, user.role, note)
            setOpen(false)
          }}
        >
          Send
        </button>
      </span>
    )
  }

  return (
    <button
      className={`btn btn-ghost ${size}`}
      onClick={() => {
        if (conn?.status === 'declined') requestConnection(companyId, resolvedInvestor, user.role)
        else setOpen(true)
      }}
    >
      <Handshake size={13} /> {conn?.status === 'declined' ? 'Reconnect' : 'Connect'}
    </button>
  )
}
