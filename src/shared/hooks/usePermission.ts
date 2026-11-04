import { useAuthStore } from './useAuthStore'
import type { UserRole } from '@/shared/types'
import { useApprovalStore } from './useApprovalStore'

export function usePermission() {
  const user = useAuthStore((s) => s.user)
  const extraScreens = useApprovalStore(s => s.extraScreens)

  const hasRole = (...roles: UserRole[]) => {
    if (!user) return false
    return roles.includes(user.role)
  }

  const isSuperAdmin = () => hasRole('super_admin')
  const isAdmin = () => hasRole('admin', 'super_admin')
  const isArticle = () => hasRole('article')

  const canAccess = (screen: string): boolean => {
    if (!user) return false
    const granted = extraScreens[user.id]
    if (granted?.includes(screen)) return true
    const override = user.permissions?.find((p) => p.screen === screen)
    if (override) return override.can_view

    // Super Admin: firm management only — no GST/TDS/Audit/Tasks operational modules
    const superAdminScreens = [
      'dashboard', 'workspace', 'clients', 'users', 'notices',
      'communication', 'documents', 'calendar', 'reports', 'subscription',
    ]
    const adminScreens = [
      'dashboard', 'workspace', 'clients', 'tasks', 'gst', 'tds', 'audit',
      'users', 'communication', 'documents', 'calendar', 'reports', 'notices',
    ]
    const articleScreens = [
      'dashboard', 'workspace', 'tasks', 'gst', 'tds', 'audit',
      'communication', 'documents', 'calendar', 'notices', 'clients',
    ]

    if (user.role === 'super_admin') return superAdminScreens.includes(screen)
    if (user.role === 'admin') return adminScreens.includes(screen)
    return articleScreens.includes(screen)
  }

  return { user, hasRole, isSuperAdmin, isAdmin, isArticle, canAccess }
}
