import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CheckSquare, Bell, Calendar, MessageSquare, FileText, AlertTriangle, Plus, User,
  type LucideIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/shared/hooks/useAuthStore'
import { useTaskPrefill } from '@/shared/hooks/useTaskPrefill'
import { useCalendarStore, visibleEvents } from '@/shared/hooks/useCalendarStore'
import { usePersonalSpace, type PersonalKind } from '@/shared/hooks/usePersonalSpace'
import { MOCK_TASKS, MOCK_ALERTS, MOCK_THREADS } from '@/mock/data'
import { MOCK_RECEIVED_DOCS } from '@/mock/uxEnhancements'
import { G } from '@/shared/components/GrayKpi'

const KINDS: { id: PersonalKind | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'task', label: 'My tasks' },
  { id: 'reminder', label: 'Reminders' },
  { id: 'meeting', label: 'Meetings' },
  { id: 'communication', label: 'Comms' },
  { id: 'document', label: 'Documents' },
  { id: 'alert', label: 'Alerts' },
]

const KIND_META: Record<PersonalKind, { label: string; icon: LucideIcon; color: string }> = {
  task: { label: 'Task', icon: CheckSquare, color: '#3D6B5E' },
  reminder: { label: 'Reminder', icon: Bell, color: '#D97706' },
  meeting: { label: 'Meeting', icon: Calendar, color: '#5C5F63' },
  communication: { label: 'Message', icon: MessageSquare, color: '#3B6B8C' },
  document: { label: 'Document', icon: FileText, color: '#3D6B5E' },
  alert: { label: 'Alert', icon: AlertTriangle, color: '#B42318' },
}

export function DashboardPersonalCard() {
  const navigate = useNavigate()
  const user = useAuthStore(s => s.user)
  const setPrefill = useTaskPrefill(s => s.setPrefill)
  const events = useCalendarStore(s => s.events)
  const upsertEvent = useCalendarStore(s => s.upsert)
  const created = usePersonalSpace(s => s.items)
  const addPersonal = usePersonalSpace(s => s.add)
  const [filter, setFilter] = useState<PersonalKind | 'all'>('all')
  const [creating, setCreating] = useState<PersonalKind | null>(null)
  const [title, setTitle] = useState('')
  const [detail, setDetail] = useState('')

  const mine = useMemo(() => {
    if (!user) return [] as { id: string; kind: PersonalKind; title: string; detail: string; at: string }[]
    const rows: { id: string; kind: PersonalKind; title: string; detail: string; at: string }[] = []

    MOCK_TASKS.filter(t => t.status !== 'done' && (t.assigned_to_id === user.id || t.assigned_by_id === user.id)).forEach(t => {
      rows.push({
        id: `task-${t.id}`, kind: 'task', title: t.title,
        detail: t.assigned_to_id === user.id && t.assigned_by_id === user.id
          ? 'Created for myself'
          : t.assigned_to_id === user.id ? 'Assigned to me' : 'Created by me',
        at: t.updated_at,
      })
    })

    visibleEvents(events, user.id).filter(e => !e.id.startsWith('ce_p_')).forEach(e => {
      const kind: PersonalKind = e.type === 'Meetings' ? 'meeting' : 'reminder'
      rows.push({
        id: e.id, kind, title: e.title,
        detail: `${e.type} · ${e.date} ${e.startTime}–${e.endTime}`,
        at: `${e.date}T${e.startTime}`,
      })
    })

    MOCK_THREADS.filter(t => (t.unread_count ?? 0) > 0 || (user.id && t.participants?.includes(user.id))).slice(0, 4).forEach(t => {
      rows.push({
        id: `th-${t.id}`, kind: 'communication', title: t.title ?? t.client_name ?? 'Message',
        detail: t.last_message ?? `${t.unread_count ?? 0} unread`,
        at: t.last_message_at ?? t.created_at ?? '',
      })
    })

    MOCK_RECEIVED_DOCS.slice(0, 2).forEach(d => {
      rows.push({
        id: `doc-${d.id}`, kind: 'document', title: d.name,
        detail: `${d.client} · ${d.verification}`, at: d.uploaded_at,
      })
    })

    MOCK_ALERTS.filter(a => !a.is_read).slice(0, 2).forEach(a => {
      rows.push({
        id: `al-${a.id}`, kind: 'alert', title: a.title, detail: a.message, at: a.created_at,
      })
    })

    created.filter(i => i.ownerId === user.id).forEach(i => {
      rows.push({ id: i.id, kind: i.kind, title: i.title, detail: i.detail, at: i.at })
    })

    const seen = new Set<string>()
    return rows.filter(r => {
      if (seen.has(r.id)) return false
      seen.add(r.id)
      return true
    }).sort((a, b) => b.at.localeCompare(a.at))
  }, [user, events, created])

  const shown = filter === 'all' ? mine : mine.filter(i => i.kind === filter)

  function saveCreate() {
    if (!user || !creating || !title.trim()) {
      toast.error('Enter a title')
      return
    }
    addPersonal({ ownerId: user.id, kind: creating, title: title.trim(), detail: detail.trim() || `Personal ${creating}` })
    if (creating === 'meeting' || creating === 'reminder') {
      const today = new Date().toISOString().slice(0, 10)
      upsertEvent({
        id: `ce_p_${Date.now()}`,
        title: title.trim(),
        description: detail.trim(),
        date: today,
        startTime: '09:00',
        endTime: '09:30',
        type: creating === 'meeting' ? 'Meetings' : 'Internal Reminders',
        remindMinutes: 30,
        ownerId: user.id,
        ownerName: user.full_name,
        sharedWith: [],
        completed: false,
      })
    }
    toast.success(`Added to your personal ${creating} list`)
    setTitle(''); setDetail(''); setCreating(null)
  }

  const firstName = user?.full_name.split(' ')[0] ?? 'you'

  return (
    <div className="rounded-2xl border bg-white" style={{ borderColor: G.border, boxShadow: '0 1px 3px rgba(43,47,51,0.06)' }}>
      <div className="p-4" style={{ borderBottom: `1px solid ${G.border}` }}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl flex items-center justify-center text-white text-sm font-bold" style={{ background: G.primary }}>
              {user ? user.full_name.split(' ').map(n => n[0]).join('').slice(0, 2) : <User className="h-4 w-4" />}
            </div>
            <div>
              <h2 className="text-sm font-bold" style={{ color: G.primary }}>{`${firstName}'s personal space`}</h2>
              <p className="text-[11px]" style={{ color: G.secondary }}>
                Your own tasks, reminders, meetings, messages, documents and alerts — separate from firm-wide work.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {([
              { kind: 'task' as const, label: 'Create task' },
              { kind: 'reminder' as const, label: 'Create reminder' },
              { kind: 'meeting' as const, label: 'Create meeting' },
              { kind: 'communication' as const, label: 'New message' },
              { kind: 'document' as const, label: 'Add document note' },
            ]).map(b => (
              <button key={b.kind} type="button"
                className="rounded-lg px-2.5 py-1.5 text-[11px] font-bold inline-flex items-center gap-1"
                style={{ background: creating === b.kind ? G.brand : G.canvas, color: creating === b.kind ? '#fff' : G.secondary, border: `1px solid ${G.border}` }}
                onClick={() => { setCreating(c => c === b.kind ? null : b.kind); setTitle(''); setDetail('') }}>
                <Plus className="h-3 w-3" />{b.label}
              </button>
            ))}
          </div>
        </div>

        {creating && (
          <div className="mt-3 rounded-xl p-3 space-y-2" style={{ background: G.canvas, border: `1px solid ${G.border}` }}>
            <p className="text-[10px] font-bold uppercase" style={{ color: G.muted }}>New {KIND_META[creating].label.toLowerCase()}</p>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title"
              className="w-full rounded-lg px-2 py-1.5 text-xs outline-none" style={{ background: '#fff', border: `1px solid ${G.border}` }} />
            <input value={detail} onChange={e => setDetail(e.target.value)} placeholder="Note (optional)"
              className="w-full rounded-lg px-2 py-1.5 text-xs outline-none" style={{ background: '#fff', border: `1px solid ${G.border}` }} />
            <div className="flex flex-wrap gap-2">
              <button type="button" className="rounded-lg px-3 py-1.5 text-xs font-bold text-white" style={{ background: G.brand }} onClick={saveCreate}>Save to my space</button>
              {creating === 'task' && (
                <button type="button" className="rounded-lg px-3 py-1.5 text-xs font-semibold border"
                  onClick={() => { setPrefill({ openCreate: true }); navigate('/workcenter?create=1') }}>
                  Open full task form
                </button>
              )}
              {creating === 'communication' && (
                <button type="button" className="rounded-lg px-3 py-1.5 text-xs font-semibold border"
                  onClick={() => navigate('/communication')}>Open Communication</button>
              )}
              {creating === 'document' && (
                <button type="button" className="rounded-lg px-3 py-1.5 text-xs font-semibold border"
                  onClick={() => navigate('/documents')}>Open Documents</button>
              )}
              <button type="button" className="text-xs font-semibold" style={{ color: G.secondary }} onClick={() => setCreating(null)}>Cancel</button>
            </div>
          </div>
        )}
      </div>

      <div className="px-4 pt-3 flex gap-1 flex-wrap">
        {KINDS.map(k => (
          <button key={k.id} type="button" onClick={() => setFilter(k.id)}
            className="rounded-full px-2.5 py-1 text-[10px] font-bold"
            style={filter === k.id ? { background: G.brand, color: '#fff' } : { background: G.canvas, color: G.secondary, border: `1px solid ${G.border}` }}>
            {k.label}
          </button>
        ))}
      </div>

      <div className="p-4 pt-2 max-h-80 overflow-y-auto">
        {shown.length === 0 ? (
          <p className="text-xs py-6 text-center" style={{ color: G.secondary }}>Nothing in this view yet. Use the create buttons above.</p>
        ) : shown.map(item => {
          const meta = KIND_META[item.kind]
          const Icon = meta.icon
          return (
            <div key={item.id} className="flex items-start gap-3 py-2.5" style={{ borderBottom: `1px solid ${G.border}` }}>
              <div className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: G.canvas, border: `1px solid ${G.border}` }}>
                <Icon className="h-3.5 w-3.5" style={{ color: meta.color }} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-bold uppercase" style={{ color: meta.color }}>{meta.label}</span>
                  <span className="text-[10px]" style={{ color: G.muted }}>{item.at.slice(0, 10)}</span>
                </div>
                <p className="text-xs font-semibold truncate" style={{ color: G.primary }}>{item.title}</p>
                <p className="text-[11px] truncate" style={{ color: G.secondary }}>{item.detail}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
