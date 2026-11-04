import {
  Bell, Menu, Search, Sun, Moon, Plus,
  FileText, CheckSquare, Users, Briefcase, FolderOpen,
  ShieldAlert, BarChart3, ReceiptText, Scale, Upload,
  ChevronDown, LogOut, Settings,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { format } from 'date-fns'
import { useAuthStore } from '@/shared/hooks/useAuthStore'
import { useTaskPrefill } from '@/shared/hooks/useTaskPrefill'
import { useThemeStore } from '@/shared/hooks/useThemeStore'
import { usePermission } from '@/shared/hooks/usePermission'
import { useMobileMenuStore } from './MobileNav'
import { authApi } from '@/shared/api/auth'
import { toast } from 'sonner'
import { cn } from '@/shared/components/cn'
import { useCalendarStore, visibleEvents } from '@/shared/hooks/useCalendarStore'
import { useApprovalStore } from '@/shared/hooks/useApprovalStore'

interface TopBarProps { alertCount?: number }

const CREATE_ACTIONS = [
  { label: 'Create Client', icon: Briefcase,   path: '/clients/new', desc: 'Open the existing client onboarding flow' },
  { label: 'Create Task',   icon: CheckSquare, path: '/workcenter?create=1', desc: 'Open Work Center task creation' },
]
const SA_ACTIONS = [
  ...CREATE_ACTIONS,
  { label: 'Add User',         icon: Users,        path: '/users',     desc: 'Invite team member' },
  { label: 'Add Notice',       icon: ShieldAlert,  path: '/workcenter', desc: 'Log a compliance notice' },
  { label: 'View Reports',     icon: BarChart3,    path: '/',           desc: 'Firm analytics on dashboard' },
  { label: 'Upload Document',  icon: Upload,       path: '/documents', desc: 'Upload to repository' },
]
const ADMIN_ACTIONS = [
  ...CREATE_ACTIONS,
  { label: 'New GST Filing',   icon: FileText,     path: '/gst',       desc: 'Start a GST return' },
  { label: 'New TDS Filing',   icon: ReceiptText,  path: '/tds',       desc: 'Start a TDS return' },
  { label: 'Create Audit',     icon: Scale,        path: '/audit',     desc: 'New audit engagement' },
  { label: 'Upload Document',  icon: Upload,       path: '/documents', desc: 'Upload client document' },
]
const ARTICLE_ACTIONS = [
  ...CREATE_ACTIONS,
  { label: 'Upload Document',  icon: Upload,       path: '/documents', desc: 'Upload client document' },
  { label: 'My Tasks',         icon: CheckSquare,  path: '/workcenter', desc: 'Your assigned work items' },
]

export function TopBar({ alertCount = 0 }: TopBarProps) {
  const user = useAuthStore(s => s.user)
  const clearAuth = useAuthStore(s => s.clearAuth)
  const toggleMenu = useMobileMenuStore(s => s.toggle)
  const { theme, toggle: toggleTheme } = useThemeStore()
  const { isSuperAdmin, isAdmin } = usePermission()
  const navigate = useNavigate()
  const [quickOpen, setQuickOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const calEvents = useCalendarStore(s => s.events)
  const pendingReq = useApprovalStore(s => s.requests.filter(r => r.status === 'Pending'))
  const dueReminders = useMemo(() => {
    const mine = visibleEvents(calEvents, user?.id)
    const today = format(new Date(), 'yyyy-MM-dd')
    return mine.filter(e => !e.completed && e.date <= today)
  }, [calEvents, user?.id])
  const notifCount = dueReminders.length + (isSuperAdmin() ? pendingReq.length : 0) + alertCount

  const actions = isSuperAdmin() ? SA_ACTIONS : isAdmin() ? ADMIN_ACTIONS : ARTICLE_ACTIONS
  const roleName = user?.role === 'super_admin' ? 'Super Admin' : user?.role === 'admin' ? 'Admin CA' : 'Article'

  const now = new Date()
  const hour = now.getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const greetEmoji = hour < 12 ? '☀️' : hour < 17 ? '🌤️' : '🌙'

  const handleLogout = async () => {
    setProfileOpen(false)
    try { await authApi.logout() } finally {
      clearAuth(); navigate('/login'); toast.success('Logged out')
    }
  }

  return (
    <header
      className="flex h-12 shrink-0 items-center justify-between rounded-2xl border px-4 shadow-sm gap-3"
      style={{ background: '#FFFFFF', borderColor: 'var(--color-border)' }}
      role="banner"
    >
      {/* ── Left: mobile menu + greeting card ───────────── */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile menu button */}
        <button
          className="lg:hidden flex items-center justify-center h-8 w-8 rounded-lg text-neutral-500 hover:bg-neutral-100 transition-colors shrink-0"
          onClick={toggleMenu} aria-label="Open menu"
        >
          <Menu className="h-4 w-4" />
        </button>

        {/* Mobile logo */}
        <span className="lg:hidden text-sm font-black text-neutral-900 tracking-tight shrink-0">AuditLens</span>

        {/* Greeting card — desktop only */}
        {user && (
          <div className="hidden lg:flex items-center gap-2 min-w-0">
            <span className="text-base leading-none">{greetEmoji}</span>
            <div className="min-w-0">
              <p className="text-sm font-semibold leading-tight truncate" style={{ color: 'var(--color-text-primary)' }}>
                {greeting}, {user.full_name.split(' ')[0]}
              </p>
              <p className="text-[10px] leading-tight" style={{ color: 'var(--color-text-muted)' }}>
                {format(now, 'EEE, d MMM yyyy')}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── Right: search + quick actions + theme + bell + user ── */}
      <div className="flex items-center gap-1.5 shrink-0">

        {/* Search — desktop, moved to right */}
        <button
          className="hidden lg:flex items-center gap-2 h-8 w-48 rounded-xl border border-neutral-200 bg-neutral-50 px-3 text-xs text-neutral-400 hover:border-neutral-300 hover:bg-white transition-all"
          onClick={() => toast.info('Search coming soon')}
        >
          <Search className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
          <span>Search…</span>
          <kbd className="ml-auto text-[10px] border border-neutral-200 rounded px-1 text-neutral-300">⌘K</kbd>
        </button>

        {/* Quick Actions dropdown */}
        <div className="relative hidden sm:block">
          <button
            onClick={() => setQuickOpen(o => !o)}
            className="flex items-center gap-1.5 h-8 rounded-xl border border-neutral-200 bg-white px-3 text-xs font-semibold text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50 hover:text-neutral-900 shadow-sm transition-all"
          >
            <Plus className="h-3.5 w-3.5" />
            Quick Actions
            <ChevronDown className={cn('h-3 w-3 transition-transform', quickOpen && 'rotate-180')} />
          </button>

          {quickOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setQuickOpen(false)} />
              <div className="absolute right-0 top-full mt-2 z-50 w-64 rounded-2xl border border-neutral-200 bg-white shadow-dropdown overflow-hidden">
                <div className="px-4 py-3 border-b border-neutral-100">
                  <p className="text-xs font-bold text-neutral-800">Quick Actions</p>
                  <p className="text-[10px] text-neutral-400 mt-0.5">{roleName} workspace</p>
                </div>
                <div className="py-1">
                  {actions.map(item => (
                    <button key={item.label}
                      className="flex w-full items-center gap-3 px-4 py-2.5 hover:bg-neutral-50 transition-colors"
                      onClick={() => {
                        if (item.path.startsWith('/workcenter?create=1')) useTaskPrefill.getState().setPrefill({ openCreate: true })
                        navigate(item.path)
                        setQuickOpen(false)
                      }}
                    >
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-neutral-100">
                        <item.icon className="h-3.5 w-3.5 text-neutral-500" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-semibold text-neutral-800">{item.label}</p>
                        <p className="text-[10px] text-neutral-400">{item.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Theme toggle */}
        <button
          className="flex h-8 w-8 items-center justify-center rounded-xl text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 transition-colors"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? <Moon style={{ width: 15, height: 15 }} /> : <Sun style={{ width: 15, height: 15 }} />}
        </button>

        {/* Notifications */}
        <div className="relative">
        <button
          className="relative flex h-8 w-8 items-center justify-center rounded-xl text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 transition-colors"
          onClick={() => setNotifOpen(o => !o)}
          aria-label={`Notifications${notifCount > 0 ? ` — ${notifCount} unread` : ''}`}
        >
          <Bell style={{ width: 15, height: 15 }} aria-hidden />
          {notifCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-black text-white">
              {notifCount > 9 ? '9+' : notifCount}
            </span>
          )}
        </button>
        {notifOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
            <div className="absolute right-0 top-full mt-2 z-50 w-72 rounded-2xl border border-neutral-200 bg-white shadow-dropdown p-3">
              <p className="text-xs font-bold text-neutral-800 mb-2">Notifications</p>
              {dueReminders.length === 0 && !(isSuperAdmin() && pendingReq.length) && (
                <p className="text-xs text-neutral-500">No due reminders</p>
              )}
              {dueReminders.map(e => (
                <button key={e.id} type="button" className="w-full text-left py-2 border-b border-neutral-100"
                  onClick={() => { setNotifOpen(false); navigate('/') }}>
                  <p className="text-xs font-semibold">{e.completed ? 'Completed' : 'Upcoming'} · {e.title}</p>
                  <p className="text-[10px] text-neutral-500">{e.type} · {e.date} {e.startTime}</p>
                </button>
              ))}
              {isSuperAdmin() && pendingReq.map(r => (
                <button key={r.id} type="button" className="w-full text-left py-2"
                  onClick={() => { setNotifOpen(false); navigate('/users?tab=approvals') }}>
                  <p className="text-xs font-semibold">Approval · {r.targetName}</p>
                  <p className="text-[10px] text-neutral-500">{r.type} from {r.requestedBy}</p>
                </button>
              ))}
            </div>
          </>
        )}
        </div>

        {/* Divider */}
        <div className="h-5 w-px bg-neutral-200 mx-0.5" aria-hidden />

        {/* User pill + dropdown with logout */}
        {user && (
          <div className="relative">
            <button
              className="flex items-center gap-2 rounded-xl px-2 py-1 hover:bg-neutral-50 transition-colors"
              onClick={() => setProfileOpen(o => !o)}
              aria-label="User menu"
            >
              <div
                className="flex h-7 w-7 items-center justify-center rounded-lg text-white text-[10px] font-black shadow-sm"
                style={{ background: 'var(--color-sidebar)' }}
              >
                {user.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div className="hidden sm:block leading-none text-left">
                <p className="text-xs font-semibold text-neutral-800 leading-tight">{user.full_name.split(' ')[0]}</p>
                <p className="text-[9px] text-neutral-400 leading-tight">{roleName}</p>
              </div>
              <ChevronDown className={cn('h-3 w-3 text-neutral-400 transition-transform hidden sm:block', profileOpen && 'rotate-180')} />
            </button>

            {profileOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                <div className="absolute right-0 top-full mt-2 z-50 w-52 rounded-2xl border border-neutral-200 bg-white shadow-dropdown overflow-hidden">
                  {/* Profile header */}
                  <div className="px-4 py-3 border-b border-neutral-100">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white text-xs font-black"
                        style={{ background: 'var(--color-sidebar)' }}>
                        {user.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-neutral-900 truncate">{user.full_name}</p>
                        <p className="text-[10px] text-neutral-400 truncate">{user.email}</p>
                      </div>
                    </div>
                    <span className="mt-2 inline-block rounded-full text-[10px] font-semibold px-2 py-0.5"
                      style={{ background: 'var(--color-surface-2)', color: 'var(--color-text-secondary)' }}>{roleName}</span>
                  </div>

                  {/* Menu items */}
                  <div className="py-1">
                    {(isSuperAdmin() || isAdmin()) && (
                    <button
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-neutral-600 hover:bg-neutral-50 transition-colors"
                      onClick={() => { navigate('/settings'); setProfileOpen(false) }}
                    >
                      <Settings className="h-4 w-4 text-neutral-400" />
                      Settings
                    </button>
                    )}
                    <button
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-neutral-600 hover:bg-neutral-50 transition-colors"
                      onClick={() => { navigate('/settings?tab=font'); setProfileOpen(false) }}
                    >
                      <Settings className="h-4 w-4 text-neutral-400" />
                      Font preference
                    </button>
                    <div className="my-1 h-px bg-neutral-100" />
                    <button
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4" />
                      Log out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
