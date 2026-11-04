import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Users, Briefcase, MessageSquare,
  FileText, ReceiptText, Scale, Settings, FolderOpen,
  ChevronLeft, ChevronRight, Cpu,
} from 'lucide-react'
import { cn } from '@/shared/components/cn'
import { usePermission } from '@/shared/hooks/usePermission'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, screen: 'dashboard', group: 'overview' },
  { to: '/workcenter', label: 'Work Center', icon: Cpu, screen: 'workspace', group: 'overview' },
  { to: '/gst', label: 'GST', icon: FileText, screen: 'gst', group: 'compliance' },
  { to: '/tds', label: 'TDS', icon: ReceiptText, screen: 'tds', group: 'compliance' },
  { to: '/audit', label: 'Audit', icon: Scale, screen: 'audit', group: 'compliance' },
  { to: '/clients', label: 'Clients', icon: Briefcase, screen: 'clients', group: 'management' },
  { to: '/documents', label: 'Documents', icon: FolderOpen, screen: 'documents', group: 'management' },
  { to: '/users', label: 'User Management', icon: Users, screen: 'users', group: 'management' },
  { to: '/communication', label: 'Communication', icon: MessageSquare, screen: 'communication', group: 'tools' },
  { to: '/settings', label: 'Settings', icon: Settings, screen: 'subscription', group: 'system' },
]

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { canAccess } = usePermission()
  const visibleItems = NAV_ITEMS.filter(item => canAccess(item.screen))

  const renderItems = () => {
    const elements: React.ReactNode[] = []
    let lastGroup = ''
    visibleItems.forEach((item) => {
      if (item.group !== lastGroup && lastGroup !== '') {
        elements.push(
          <div key={`div-${item.group}`} className="w-full h-px my-1.5" style={{ background: 'rgba(255,255,255,0.08)' }} />
        )
      }
      lastGroup = item.group
      elements.push(
        <li key={item.screen} className="w-full">
          <NavLink
            to={item.to}
            end={item.to === '/'}
            title={collapsed ? item.label : undefined}
            aria-label={item.label}
            className={({ isActive }) =>
              cn(
                'relative flex items-center rounded-xl transition-all duration-150 w-full',
                collapsed ? 'h-10 w-10 justify-center mx-auto' : 'h-10 px-3 gap-3',
                isActive ? 'nav-active' : 'nav-inactive'
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className="h-[18px] w-[18px] shrink-0" aria-hidden />
                {!collapsed && (
                  <span className="text-xs font-medium truncate leading-none">{item.label}</span>
                )}
                {isActive && collapsed && (
                  <span className="absolute -right-3.5 top-1/2 -translate-y-1/2 h-1 w-1 rounded-full bg-white" />
                )}
              </>
            )}
          </NavLink>
        </li>
      )
    })
    return elements
  }

  return (
    <aside
      className="hidden lg:flex flex-col py-4 my-auto h-[88%] rounded-3xl shrink-0 transition-all duration-300"
      style={{
        width: collapsed ? '64px' : '200px',
        background: 'var(--color-sidebar)',
        border: '1px solid rgba(255,255,255,0.06)',
        overflow: 'hidden',
      }}
      aria-label="Main navigation"
    >
      <div className={cn('flex items-center mb-4 shrink-0 px-3', collapsed ? 'justify-between' : 'gap-2.5')}>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border" style={{ background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.10)' }}>
          <span className="text-xs font-semibold tracking-tight" style={{ color: 'var(--color-sidebar-text)' }}>AL</span>
        </div>

        {!collapsed && (
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold leading-none truncate" style={{ color: 'var(--color-sidebar-text)' }}>AuditLens</p>
            <p className="text-[9px] mt-0.5 truncate" style={{ color: 'var(--color-sidebar-muted)' }}>CA Practice Suite</p>
          </div>
        )}

        <button
          onClick={onToggle}
          title={collapsed ? 'Expand' : 'Collapse'}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-all"
          style={{ color: 'var(--color-sidebar-muted)' }}
        >
          {collapsed
            ? <ChevronRight className="h-3.5 w-3.5" />
            : <ChevronLeft className="h-3.5 w-3.5" />
          }
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto overflow-x-hidden hide-scrollbar px-2.5" role="navigation" aria-label="App navigation">
        <ul className={cn('flex flex-col gap-0.5', collapsed ? 'items-center' : 'items-stretch')}>
          {renderItems()}
        </ul>
      </nav>
    </aside>
  )
}
