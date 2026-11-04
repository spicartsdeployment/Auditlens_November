import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserRole } from '@/shared/types'

export const MODULE_SCREENS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'gst', label: 'GST' },
  { id: 'tds', label: 'TDS' },
  { id: 'clients', label: 'Clients' },
  { id: 'workspace', label: 'Work Center' },
  { id: 'audit', label: 'Audit' },
  { id: 'documents', label: 'Documents' },
  { id: 'communication', label: 'Communication' },
  { id: 'users', label: 'User Management' },
  { id: 'calendar', label: 'Calendar' },
  { id: 'reports', label: 'Reports' },
  { id: 'subscription', label: 'Settings' },
] as const

export type ApprovalType = 'user_create' | 'role_change' | 'permission_change' | 'permission_mod'

export interface ApprovalRequest {
  id: string
  type: ApprovalType
  requestedBy: string
  requestedById: number
  targetName: string
  targetEmail: string
  targetRole: UserRole
  permissions: string[]
  date: string
  status: 'Pending' | 'Approved' | 'Rejected'
  rejectReason?: string
  extra?: Record<string, string>
}

export interface LocalUser {
  id: number
  full_name: string
  email: string
  role: UserRole
  phone?: string
  is_active: boolean
  permissions: string[]
}

interface ApprovalStore {
  requests: ApprovalRequest[]
  localUsers: LocalUser[]
  extraScreens: Record<number, string[]>
  submit: (r: Omit<ApprovalRequest, 'id' | 'date' | 'status'>) => void
  decide: (id: string, status: 'Approved' | 'Rejected', reason?: string) => void
  grantScreens: (userId: number, screens: string[]) => void
}

export const useApprovalStore = create<ApprovalStore>()(
  persist(
    (set, get) => ({
      requests: [
        {
          id: 'ar1',
          type: 'user_create',
          requestedBy: 'Priya Sharma',
          requestedById: 2,
          targetName: 'Kavya Nair',
          targetEmail: 'kavya@auditlens.demo',
          targetRole: 'article',
          permissions: ['dashboard', 'gst', 'tds', 'workspace'],
          date: '2026-11-02',
          status: 'Pending',
        },
      ],
      localUsers: [],
      extraScreens: {},
      submit: (r) => set(s => ({
        requests: [{ ...r, id: `ar_${Date.now()}`, date: new Date().toISOString().slice(0, 10), status: 'Pending' }, ...s.requests],
      })),
      decide: (id, status, reason) => {
        const req = get().requests.find(x => x.id === id)
        if (!req) return
        set(s => ({
          requests: s.requests.map(x => x.id === id ? { ...x, status, rejectReason: reason } : x),
        }))
        if (status === 'Approved' && req.type === 'user_create') {
          const nid = Date.now()
          set(s => ({
            localUsers: [...s.localUsers, {
              id: nid,
              full_name: req.targetName,
              email: req.targetEmail,
              role: req.targetRole,
              is_active: true,
              permissions: req.permissions,
            }],
            extraScreens: { ...s.extraScreens, [nid]: req.permissions },
          }))
        }
        if (status === 'Approved' && (req.type === 'permission_change' || req.type === 'permission_mod' || req.type === 'role_change')) {
          const uid = Number(req.extra?.userId || 0)
          if (uid) get().grantScreens(uid, req.permissions)
        }
      },
      grantScreens: (userId, screens) => set(s => ({
        extraScreens: { ...s.extraScreens, [userId]: Array.from(new Set([...(s.extraScreens[userId] ?? []), ...screens])) },
      })),
    }),
    { name: 'auditlens-approvals' }
  )
)
