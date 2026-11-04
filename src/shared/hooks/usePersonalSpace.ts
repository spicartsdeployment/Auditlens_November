import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type PersonalKind = 'task' | 'reminder' | 'meeting' | 'communication' | 'document' | 'alert'

export interface PersonalItem {
  id: string
  ownerId: number
  kind: PersonalKind
  title: string
  detail: string
  at: string
}

interface PersonalSpaceStore {
  items: PersonalItem[]
  add: (item: Omit<PersonalItem, 'id' | 'at'> & { at?: string }) => void
}

export const usePersonalSpace = create<PersonalSpaceStore>()(
  persist(
    (set) => ({
      items: [
        { id: 'ps1', ownerId: 3, kind: 'task', title: 'Personal: tidy GST working notes', detail: 'Created for myself — not a client assignment', at: '2026-11-03T08:00:00Z' },
        { id: 'ps2', ownerId: 2, kind: 'task', title: 'Review article timesheets', detail: 'Internal personal follow-up', at: '2026-11-03T09:00:00Z' },
        { id: 'ps3', ownerId: 3, kind: 'reminder', title: 'Call client for bank statements', detail: 'WhatsApp reminder (frontend only)', at: '2026-11-04T10:00:00Z' },
        { id: 'ps4', ownerId: 2, kind: 'meeting', title: 'Internal standup', detail: '10:00–10:20', at: '2026-11-04T10:00:00Z' },
        { id: 'ps5', ownerId: 1, kind: 'alert', title: 'Subscription renewal reminder', detail: 'Firm plan renews Mar 2027', at: '2026-11-03T07:00:00Z' },
      ],
      add: (item) => set(s => ({
        items: [{
          id: `ps_${Date.now()}`,
          at: item.at ?? new Date().toISOString(),
          ownerId: item.ownerId,
          kind: item.kind,
          title: item.title,
          detail: item.detail,
        }, ...s.items],
      })),
    }),
    { name: 'auditlens-personal-space' }
  )
)
