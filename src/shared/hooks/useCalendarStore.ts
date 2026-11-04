import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const REMINDER_TYPES = [
  'Meetings',
  'Self Reviews',
  'Task Reminders',
  'Client Follow-ups',
  'Internal Reminders',
  'Important Deadlines',
  'Custom Alerts',
] as const

export type ReminderType = typeof REMINDER_TYPES[number]

export interface CalendarEvent {
  id: string
  title: string
  description: string
  date: string
  startTime: string
  endTime: string
  type: ReminderType
  remindMinutes: number
  ownerId: number
  ownerName: string
  sharedWith: number[]
  completed: boolean
}

interface CalendarStore {
  events: CalendarEvent[]
  upsert: (e: CalendarEvent) => void
  remove: (id: string) => void
  toggleComplete: (id: string) => void
}

const seed: CalendarEvent[] = [
  {
    id: 'ce1', title: 'GST filing huddle', description: 'Review GSTR-3B pack for Sunrise',
    date: '2026-11-04', startTime: '10:00', endTime: '10:30', type: 'Meetings',
    remindMinutes: 30, ownerId: 2, ownerName: 'Priya Sharma', sharedWith: [], completed: false,
  },
  {
    id: 'ce2', title: 'Self review — GSTR-1', description: 'Complete self review before senior review',
    date: '2026-11-05', startTime: '16:00', endTime: '17:00', type: 'Self Reviews',
    remindMinutes: 60, ownerId: 3, ownerName: 'Rohan Verma', sharedWith: [], completed: false,
  },
  {
    id: 'ce3', title: 'Client follow-up — bank statements', description: 'Call Apex Auto Parts',
    date: '2026-11-06', startTime: '11:00', endTime: '11:15', type: 'Client Follow-ups',
    remindMinutes: 15, ownerId: 2, ownerName: 'Priya Sharma', sharedWith: [3], completed: false,
  },
]

export const useCalendarStore = create<CalendarStore>()(
  persist(
    (set) => ({
      events: seed,
      upsert: (e) => set(s => ({ events: s.events.some(x => x.id === e.id) ? s.events.map(x => x.id === e.id ? e : x) : [e, ...s.events] })),
      remove: (id) => set(s => ({ events: s.events.filter(e => e.id !== id) })),
      toggleComplete: (id) => set(s => ({ events: s.events.map(e => e.id === id ? { ...e, completed: !e.completed } : e) })),
    }),
    { name: 'auditlens-calendar' }
  )
)

export function visibleEvents(all: CalendarEvent[], userId?: number) {
  if (!userId) return []
  return all.filter(e => e.ownerId === userId || e.sharedWith.includes(userId))
}
