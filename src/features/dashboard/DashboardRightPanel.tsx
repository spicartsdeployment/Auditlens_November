import { useMemo, useState } from 'react'
import {
  format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isSameDay,
  addMonths, subMonths,
} from 'date-fns'
import { ChevronLeft, ChevronRight, Plus, Pencil, Trash2, CheckCircle2, X } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/shared/hooks/useAuthStore'
import {
  REMINDER_TYPES, useCalendarStore, visibleEvents, type CalendarEvent, type ReminderType,
} from '@/shared/hooks/useCalendarStore'

const G = {
  canvas: '#F5F2EC', white: '#FFFFFF', border: '#E4DFD6', muted: '#8A8D91',
  secondary: '#5C5F63', primary: '#2B2F33',
} as const

const emptyForm = {
  title: '', description: '', date: format(new Date(), 'yyyy-MM-dd'),
  startTime: '09:00', endTime: '09:30', type: 'Internal Reminders' as ReminderType,
  remindMinutes: 30,
}

export function DashboardRightPanel({ onClose }: { onClose: () => void }) {
  const user = useAuthStore(s => s.user)
  const events = useCalendarStore(s => s.events)
  const upsert = useCalendarStore(s => s.upsert)
  const remove = useCalendarStore(s => s.remove)
  const toggleComplete = useCalendarStore(s => s.toggleComplete)
  const mine = useMemo(() => visibleEvents(events, user?.id), [events, user?.id])

  const [viewDate, setViewDate] = useState(startOfMonth(new Date()))
  const [selected, setSelected] = useState<Date | null>(new Date())
  const [editing, setEditing] = useState<Partial<CalendarEvent> | null>(null)

  const days = eachDayOfInterval({ start: startOfMonth(viewDate), end: endOfMonth(viewDate) })
  const startPad = startOfMonth(viewDate).getDay()
  const dayItems = (d: Date) => mine.filter(e => isSameDay(parseISO(e.date), d))
  const selectedItems = selected ? dayItems(selected) : []

  function save() {
    if (!editing?.title?.trim() || !editing.date || !user) {
      toast.error('Title and date are required')
      return
    }
    upsert({
      id: editing.id ?? `ce_${Date.now()}`,
      title: editing.title.trim(),
      description: editing.description ?? '',
      date: editing.date,
      startTime: editing.startTime || '09:00',
      endTime: editing.endTime || '09:30',
      type: (editing.type as ReminderType) || 'Custom Alerts',
      remindMinutes: editing.remindMinutes ?? 30,
      ownerId: editing.ownerId ?? user.id,
      ownerName: editing.ownerName ?? user.full_name,
      sharedWith: editing.sharedWith ?? [],
      completed: editing.completed ?? false,
    })
    toast.success(editing.id ? 'Event updated' : 'Event created — private to you unless shared')
    setEditing(null)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-2xl border bg-white p-4" style={{ borderColor: G.border }}>
        <div className="flex items-center justify-end mb-2">
          <button type="button" onClick={onClose} aria-label="Close calendar"
            className="h-7 w-7 rounded-lg border flex items-center justify-center ml-auto"
            style={{ borderColor: G.border, color: G.secondary }}>
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="flex items-center justify-between mb-3">
          <button type="button" className="h-7 w-7 rounded-lg border flex items-center justify-center" style={{ borderColor: G.border }}
            onClick={() => setViewDate(d => subMonths(d, 1))} aria-label="Previous month"><ChevronLeft className="h-3.5 w-3.5" /></button>
          <p className="text-sm font-semibold" style={{ color: G.primary }}>{format(viewDate, 'MMMM yyyy')}</p>
          <button type="button" className="h-7 w-7 rounded-lg border flex items-center justify-center" style={{ borderColor: G.border }}
            onClick={() => setViewDate(d => addMonths(d, 1))} aria-label="Next month"><ChevronRight className="h-3.5 w-3.5" /></button>
        </div>
        <div className="grid grid-cols-7">
          {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
            <div key={d} className="text-center text-[10px] font-bold py-1" style={{ color: G.muted }}>{d}</div>
          ))}
          {Array.from({ length: startPad }).map((_, i) => <div key={`p${i}`} />)}
          {days.map(day => {
            const items = dayItems(day)
            const sel = selected && isSameDay(day, selected)
            const today = isToday(day)
            return (
              <button key={day.toISOString()} type="button"
                className="flex flex-col items-center py-1.5 rounded-md"
                style={sel ? { background: '#EEF4F2', border: '1px solid #3D6B5E' } : today ? { background: G.primary } : {}}
                onClick={() => { setSelected(day); setEditing(e => e ? { ...e, date: format(day, 'yyyy-MM-dd') } : e) }}
                aria-label={format(day, 'd MMMM')}>
                <span className="text-xs font-semibold" style={{ color: sel ? '#32574C' : today ? '#fff' : G.secondary }}>{format(day, 'd')}</span>
                {items.length > 0 && <span className="h-1 w-1 rounded-full mt-0.5" style={{ background: today && !sel ? '#fff' : '#3D6B5E' }} />}
              </button>
            )
          })}
        </div>
        <button type="button" className="mt-3 w-full rounded-xl py-2 text-xs font-bold text-white flex items-center justify-center gap-1"
          style={{ background: G.primary }}
          onClick={() => setEditing({ ...emptyForm, date: selected ? format(selected, 'yyyy-MM-dd') : emptyForm.date })}>
          <Plus className="h-3.5 w-3.5" /> New event / reminder
        </button>

        {selected && (
          <div className="mt-3 pt-3 space-y-2" style={{ borderTop: `1px solid ${G.border}` }}>
            <p className="text-[10px] font-bold uppercase" style={{ color: G.muted }}>{format(selected, 'd MMMM yyyy')}</p>
            {selectedItems.length === 0 && <p className="text-xs" style={{ color: G.secondary }}>No events. Create one for this date.</p>}
            {selectedItems.map(ev => (
              <div key={ev.id} className="rounded-lg px-2 py-2" style={{ background: G.canvas, border: `1px solid ${G.border}` }}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold" style={{ textDecoration: ev.completed ? 'line-through' : 'none', color: G.primary }}>{ev.title}</p>
                    <p className="text-[10px]" style={{ color: G.secondary }}>{ev.type} · {ev.startTime}–{ev.endTime} · remind {ev.remindMinutes}m before</p>
                    {ev.description && <p className="text-[10px] mt-0.5" style={{ color: G.muted }}>{ev.description}</p>}
                    <p className="text-[9px]" style={{ color: G.muted }}>{ev.ownerId === user?.id ? 'Private (yours)' : `From ${ev.ownerName}`}{ev.sharedWith.length ? ' · shared' : ''}</p>
                  </div>
                  <div className="flex gap-1">
                    <button type="button" aria-label="Mark complete" onClick={() => toggleComplete(ev.id)}><CheckCircle2 className="h-3.5 w-3.5" style={{ color: ev.completed ? '#2F6B4F' : G.muted }} /></button>
                    {ev.ownerId === user?.id && (
                      <>
                        <button type="button" aria-label="Edit" onClick={() => setEditing(ev)}><Pencil className="h-3.5 w-3.5" style={{ color: G.secondary }} /></button>
                        <button type="button" aria-label="Delete" onClick={() => { if (confirm('Delete this event?')) { remove(ev.id); toast.success('Event deleted') } }}><Trash2 className="h-3.5 w-3.5" style={{ color: '#B42318' }} /></button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {editing && (
        <div className="rounded-2xl border bg-white p-4 space-y-2" style={{ borderColor: G.border }}>
          <p className="text-sm font-bold" style={{ color: G.primary }}>{editing.id ? 'Edit event' : 'Create event'}</p>
          <input className="w-full rounded-lg px-2 py-1.5 text-xs border" placeholder="Title" value={editing.title ?? ''}
            onChange={e => setEditing({ ...editing, title: e.target.value })} />
          <textarea className="w-full rounded-lg px-2 py-1.5 text-xs border" rows={2} placeholder="Description"
            value={editing.description ?? ''} onChange={e => setEditing({ ...editing, description: e.target.value })} />
          <input type="date" className="w-full rounded-lg px-2 py-1.5 text-xs border" value={editing.date ?? ''}
            onChange={e => setEditing({ ...editing, date: e.target.value })} />
          <div className="grid grid-cols-2 gap-2">
            <input type="time" aria-label="Start time" className="rounded-lg px-2 py-1.5 text-xs border" value={editing.startTime ?? ''}
              onChange={e => setEditing({ ...editing, startTime: e.target.value })} />
            <input type="time" aria-label="End time" className="rounded-lg px-2 py-1.5 text-xs border" value={editing.endTime ?? ''}
              onChange={e => setEditing({ ...editing, endTime: e.target.value })} />
          </div>
          <select className="w-full rounded-lg px-2 py-1.5 text-xs border" value={editing.type}
            onChange={e => setEditing({ ...editing, type: e.target.value as ReminderType })}>
            {REMINDER_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
          <select className="w-full rounded-lg px-2 py-1.5 text-xs border" value={String(editing.remindMinutes ?? 30)}
            onChange={e => setEditing({ ...editing, remindMinutes: Number(e.target.value) })}>
            <option value="0">No notification</option>
            <option value="15">15 minutes before</option>
            <option value="30">30 minutes before</option>
            <option value="60">1 hour before</option>
            <option value="1440">1 day before</option>
          </select>
          <p className="text-[10px]" style={{ color: G.muted }}>
            Frontend reminders only. Private to you by default. Notifications appear in the bell menu when due.
          </p>
          <div className="flex gap-2">
            <button type="button" className="flex-1 rounded-xl py-2 text-xs font-bold border" onClick={() => setEditing(null)}>Cancel</button>
            <button type="button" className="flex-1 rounded-xl py-2 text-xs font-bold text-white" style={{ background: G.primary }} onClick={save}>Save</button>
          </div>
        </div>
      )}

    </div>
  )
}
