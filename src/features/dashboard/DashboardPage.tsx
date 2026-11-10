/**
 * Dashboard Home — 5-ratio gray depth system
 *
 * Ratio 1  #F5F2EC  neutral-50   → app canvas background
 * Ratio 2  #E4DFD6  neutral-200  → card borders, dividers
 * Ratio 3  #8A8D91  neutral-400  → decorative icons, inactive / prev-month dates
 * Ratio 4  #5C5F63  neutral-600  → secondary text, timestamps, subheaders
 * Ratio 5  #2B2F33  neutral-900  → headings, metric numbers, active labels
 * Pure     #FFFFFF             → elevated card bodies (pop off canvas)
 */

import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import {
  Briefcase, CheckSquare, FileText, AlertTriangle, Clock,
  Users, ShieldAlert, FolderOpen, CheckCircle2, Activity,
  Database, ChevronLeft, ChevronRight, MessageSquare, ChevronDown,
} from 'lucide-react'
import {
  format, parseISO, isAfter, differenceInDays,
  startOfMonth, endOfMonth, eachDayOfInterval, isToday, isSameDay,
  addMonths, subMonths, startOfWeek, endOfWeek, addDays, isWithinInterval,
} from 'date-fns'
import { dashboardApi } from '@/shared/api/dashboard'
import { mockComplianceApi } from '@/mock/api'
import { useAuthStore } from '@/shared/hooks/useAuthStore'
import { usePermission } from '@/shared/hooks/usePermission'
import { useTaskPrefill } from '@/shared/hooks/useTaskPrefill'
import { cn } from '@/shared/components/cn'
import { MOCK_THREADS, MOCK_TASKS } from '@/mock/data'
import { DashboardRightPanel } from './DashboardRightPanel'
import { DashboardPersonalCard } from './DashboardPersonalCard'
import { useApprovalStore } from '@/shared/hooks/useApprovalStore'
import { G } from '@/shared/components/GrayKpi'

const MOCK_INBOX = [
  { id: 1, from: 'Sunrise Textiles', snippet: 'Audit documents pending — please upload balance sheet', channel: 'whatsapp', time: '2h', unread: true },
  { id: 2, from: 'Priya Sharma', snippet: 'GSTR-3B for May ready for your review', channel: 'internal', time: '4h', unread: true },
  { id: 3, from: 'BlueSky Tech', snippet: 'TDS challan receipt attached for Q4', channel: 'email', time: '1d', unread: false },
  { id: 4, from: 'Client Portal', snippet: 'New document uploaded: Bank Statement Apr 2026', channel: 'portal', time: '2d', unread: false },
]
const channelDot: Record<string, string> = {
  whatsapp: '#2F6B4F', internal: '#2B2F33', email: '#3B6B8C', portal: '#6E7176',
}

// ─── Card wrapper ──────────────────────────────────────────
function Card({ children, className = '', onClick }: {
  children: React.ReactNode; className?: string; onClick?: () => void
}) {
  return (
    <div
      onClick={onClick}
      className={cn('rounded-2xl border', onClick && 'cursor-pointer', className)}
      style={{ background: G.white, borderColor: G.border, boxShadow: '0 1px 3px 0 rgba(43,47,51,0.06)' }}
    >
      {children}
    </div>
  )
}

// ─── Card section header ───────────────────────────────────
function CardHeader({ icon: Icon, title, action, onAction }: {
  icon: React.ElementType; title: string; action?: string; onAction?: () => void
}) {
  return (
    <div className="flex items-center justify-between pb-3 mb-1" style={{ borderBottom: `1px solid ${G.border}` }}>
      <div className="flex items-center gap-2">
        {/* Ratio 3: decorative icon */}
        <Icon className="h-4 w-4" style={{ color: G.muted }} aria-hidden />
        {/* Ratio 5: section heading */}
        <h2 className="text-sm font-semibold" style={{ color: G.primary }}>{title}</h2>
      </div>
      {action && onAction && (
        <button
          onClick={onAction}
          className="flex items-center gap-1 text-xs font-medium transition-colors"
          style={{ color: G.secondary }}
          onMouseEnter={e => (e.currentTarget.style.color = G.primary)}
          onMouseLeave={e => (e.currentTarget.style.color = G.secondary)}
        >
          {action}
        </button>
      )}
    </div>
  )
}

// ─── Mini Calendar ─────────────────────────────────────────
function MiniCalendar({ events }: { events: any[] }) {
  const navigate = useNavigate()
  const setPrefill = useTaskPrefill(s => s.setPrefill)
  const today = new Date()
  const [open, setOpen] = useState(true)
  const [viewDate, setViewDate] = useState(startOfMonth(today))
  const [selected, setSelected] = useState<Date | null>(null)
  const [tooltip, setTooltip] = useState<{ day: Date; events: any[]; x: number; y: number } | null>(null)

  const monthStart = startOfMonth(viewDate)
  const days = eachDayOfInterval({ start: monthStart, end: endOfMonth(viewDate) })
  const startPad = monthStart.getDay()
  const isCurrentMonth = format(viewDate, 'yyyyMM') === format(today, 'yyyyMM')

  const dotColors: Record<string, string> = {
    gst: '#3B6B8C', tds: '#F59E0B', audit: '#2F6B4F',
    notice: '#EF4444', meeting: '#6E7176',
  }

  const typeLabels: Record<string, string> = {
    gst: 'GST Filing', tds: 'TDS Filing', audit: 'Audit', notice: 'Notice', meeting: 'Meeting',
  }

  const selectedEvents = selected ? events.filter(e => isSameDay(parseISO(e.date), selected)) : []

  return (
    <Card>
      <div className="p-4 flex flex-col">
        <button type="button" className="w-full flex items-center justify-between mb-3" onClick={() => setOpen(v => !v)} aria-expanded={open}>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold" style={{ color: G.primary }}>Calendar</h2>
            <span className="text-[10px]" style={{ color: G.secondary }}>{format(viewDate, 'MMM yyyy')}</span>
          </div>
          <ChevronDown className="h-4 w-4 transition-transform" style={{ color: G.muted, transform: open ? 'rotate(180deg)' : 'none' }} />
        </button>
        <div className="overflow-hidden transition-all" style={{ maxHeight: open ? 720 : 0, opacity: open ? 1 : 0 }}>
        <div className="flex flex-col">
        {/* Header with prev/next */}
        <div className="flex items-center justify-between mb-5">
          <button
            className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors"
            style={{ background: G.canvas, border: `1px solid ${G.border}` }}
            onClick={() => setViewDate(d => subMonths(d, 1))}
            aria-label="Previous month"
          >
            <ChevronLeft className="h-3.5 w-3.5" style={{ color: G.secondary }} />
          </button>

          <div className="text-center">
            <h2 className="text-sm font-semibold" style={{ color: G.primary }}>
              {format(viewDate, 'MMMM yyyy')}
            </h2>
            <p className="text-[10px] mt-0.5" style={{ color: G.secondary }}>
              {days.filter(d => events.some(e => isSameDay(parseISO(e.date), d))).length} events
            </p>
          </div>

          <button
            className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors"
            style={{ background: G.canvas, border: `1px solid ${G.border}` }}
            onClick={() => setViewDate(d => addMonths(d, 1))}
            aria-label="Next month"
          >
            <ChevronRight className="h-3.5 w-3.5" style={{ color: G.secondary }} />
          </button>
        </div>

        {/* Day-of-week headers */}
        <div className="grid grid-cols-7">
          {['Su','Mo','Tu','We','Th','Fr','Sa'].map((d, i) => (
            <div key={i} className="text-center text-[10px] font-bold uppercase py-2" style={{ color: G.muted }}>{d}</div>
          ))}
        </div>

        {/* Day grid */}
        <div className="grid grid-cols-7 relative">
          {Array.from({ length: startPad }).map((_, i) => <div key={`p${i}`} />)}

          {days.map(day => {
            const dayEvents = events.filter(e => isSameDay(parseISO(e.date), day))
            const isCurrentDay = isToday(day)
            const hasEvents = dayEvents.length > 0

            const isSelected = selected && isSameDay(day, selected)
            return (
              <button
                type="button"
                key={day.toISOString()}
                className="relative flex flex-col items-center rounded-md py-2 transition-colors"
                style={isSelected ? { background: '#EEF4F2', border: `1px solid #3D6B5E`, borderRadius: '6px' } : isCurrentDay ? { background: G.primary, borderRadius: '6px' } : {}}
                onClick={() => setSelected(day)}
                aria-label={`${format(day, 'd MMMM')}${hasEvents ? `, ${dayEvents.length} items` : ''}`}
                onMouseEnter={hasEvents ? (e) => {
                  const rect = e.currentTarget.getBoundingClientRect()
                  setTooltip({ day, events: dayEvents, x: rect.left, y: rect.bottom })
                } : undefined}
                onMouseLeave={() => setTooltip(null)}
              >
                <span
                  className="text-xs font-semibold leading-none"
                  style={{ color: isSelected ? '#32574C' : isCurrentDay ? G.white : isCurrentMonth ? G.secondary : G.muted }}
                >
                  {format(day, 'd')}
                </span>
                {hasEvents && (
                  <div className="flex gap-0.5 mt-1">
                    {dayEvents.slice(0, 3).map((ev, i) => (
                      <div key={i} className="h-1 w-1 rounded-full"
                        style={{ background: isSelected ? '#3D6B5E' : isCurrentDay ? 'rgba(255,255,255,0.8)' : (dotColors[ev.type] ?? G.muted) }} />
                    ))}
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 pt-4 flex flex-wrap gap-x-2.5 gap-y-1" style={{ borderTop: `1px solid ${G.border}` }}>
          {Object.entries(dotColors).map(([type, color]) => (
            <div key={type} className="flex items-center gap-1">
              <div className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
              <span className="text-[9px] capitalize" style={{ color: G.muted }}>{type}</span>
            </div>
          ))}
        </div>

        {selected && (
          <div className="mt-3 pt-3 space-y-2" style={{ borderTop: `1px solid ${G.border}` }}>
            <p className="text-[10px] font-bold uppercase" style={{ color: G.muted }}>{format(selected, 'd MMMM yyyy')}</p>
            {selectedEvents.length === 0 ? (
              <p className="text-xs" style={{ color: G.secondary }}>No tasks or activities on this date.</p>
            ) : selectedEvents.map((ev: any, i: number) => (
              <button key={i} type="button" className="w-full text-left rounded-lg px-2 py-1.5"
                style={{ background: G.canvas, border: `1px solid ${G.border}` }}
                onClick={() => navigate('/workcenter')}>
                <p className="text-xs font-semibold" style={{ color: G.primary }}>{ev.title}</p>
                <p className="text-[10px]" style={{ color: G.secondary }}>{typeLabels[ev.type] ?? ev.type}{ev.client_name ? ` · ${ev.client_name}` : ''}</p>
              </button>
            ))}
            <button type="button" className="w-full rounded-xl py-2 text-xs font-bold text-white"
              style={{ background: G.primary }}
              onClick={() => {
                const due = format(selected, 'yyyy-MM-dd')
                setPrefill({ dueDate: due, openCreate: true })
                navigate(`/workcenter?create=1&due=${due}`)
              }}>
              Create Task for this date
            </button>
          </div>
        )}
        </div>
        </div>
      </div>

      {/* Hover tooltip — fixed portal-style */}
      {tooltip && (
        <div
          className="fixed z-50 rounded-xl p-3 shadow-xl min-w-[180px] max-w-[240px]"
          style={{
            background: G.white, border: `1px solid ${G.border}`,
            boxShadow: '0 8px 24px rgba(43,47,51,0.14)',
            top: tooltip.y + 8, left: Math.min(tooltip.x, window.innerWidth - 260),
          }}
        >
          <p className="text-[10px] font-bold uppercase tracking-wide mb-2" style={{ color: G.muted }}>
            {format(tooltip.day, 'd MMMM')}
          </p>
          <div className="space-y-1.5">
            {tooltip.events.map((ev, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="mt-1 h-2 w-2 shrink-0 rounded-full" style={{ background: dotColors[ev.type] ?? G.muted }} />
                <div>
                  <p className="text-xs font-semibold leading-tight" style={{ color: G.primary }}>{ev.title}</p>
                  <p className="text-[10px]" style={{ color: G.secondary }}>{typeLabels[ev.type] ?? ev.type}{ev.client_name ? ` · ${ev.client_name}` : ''}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}

// ─── KPI Metric Card ───────────────────────────────────────
// Pure white, gray scale only — no color pastels
function KpiCard({ label, value, sub, accent, urgent, onClick }: {
  label: string; value: number | string; sub?: string; accent: string; urgent?: boolean; onClick?: () => void
}) {
  return (
    <button
      className="rounded-xl border text-left w-full self-start overflow-hidden"
      style={{
        background: G.white,
        borderColor: G.border,
        boxShadow: '0 1px 2px 0 rgba(43,47,51,0.05)',
        borderTop: `2px solid ${accent}`,
        padding: '12px 14px 12px',
      }}
      onClick={onClick}
    >
      <p className="text-[22px] font-bold leading-none tabular-nums mb-1.5"
        style={{ color: urgent ? '#B42318' : G.primary }}>{value}</p>
      <p className="text-[11px] font-semibold leading-tight" style={{ color: G.primary }}>{label}</p>
      {sub && <p className="text-[10px] mt-0.5" style={{ color: G.muted }}>{sub}</p>}
    </button>
  )
}

// ─── Activity item ─────────────────────────────────────────
function ActivityItem({ action, description, user_name, created_at }: any) {
  // Map action types to icons — all icons use Ratio 3 (muted)
  const iconMap: Record<string, React.ElementType> = {
    filing: FileText, document: FolderOpen, notice: AlertTriangle,
    create: CheckCircle2, assign: Users, update: Activity,
  }
  const Icon = iconMap[action] ?? Activity

  const daysAgo = differenceInDays(new Date(), new Date(created_at))
  const timeLabel = daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo}d ago`

  return (
    <li
      className="flex items-start gap-3 py-2.5"
      style={{ borderBottom: `1px solid ${G.border}` }}
    >
      {/* Ratio 3 icon container */}
      <div
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full mt-0.5"
        style={{ background: G.canvas, border: `1px solid ${G.border}` }}
      >
        <Icon className="h-3.5 w-3.5" style={{ color: G.muted }} aria-hidden />
      </div>

      <div className="min-w-0 flex-1">
        {/* Ratio 5: activity description */}
        <p className="text-sm leading-snug" style={{ color: G.primary }}>{description}</p>
        {/* Ratio 4: user · timestamp */}
        <p className="text-[11px] mt-0.5" style={{ color: G.secondary }}>
          {user_name}
          <span className="mx-1" style={{ color: G.muted }}>·</span>
          {timeLabel}
        </p>
      </div>
    </li>
  )
}

// ─── Alert item ────────────────────────────────────────────
function AlertItem({ alert }: { alert: any }) {
  // Severity dots retain semantic color — they carry functional meaning
  const severityDot: Record<string, string> = {
    danger: '#EF4444', warning: '#F59E0B', info: '#6E7176',
  }
  const dot = severityDot[alert.severity as keyof typeof severityDot] ?? G.muted

  const daysAgo = differenceInDays(new Date(), new Date(alert.created_at))
  const timeLabel = daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo}d ago`

  return (
    <li
      className="flex items-start gap-3 py-2.5"
      style={{ borderBottom: `1px solid ${G.border}` }}
    >
      {/* Semantic severity dot (not decorative — retains color) */}
      <div className="mt-2 h-2 w-2 shrink-0 rounded-full" style={{ background: dot }} />

      <div className="min-w-0 flex-1">
        {/* Ratio 5: alert title */}
        <p className="text-sm font-semibold" style={{ color: G.primary }}>{alert.title}</p>
        {/* Ratio 4: message */}
        <p className="text-[11px] mt-0.5 leading-snug" style={{ color: G.secondary }}>{alert.message}</p>
      </div>

      {/* Ratio 4: timestamp */}
      <span className="shrink-0 text-[10px] whitespace-nowrap mt-0.5" style={{ color: G.muted }}>
        {timeLabel}
      </span>
    </li>
  )
}

// ─── Deadline item ─────────────────────────────────────────
function DeadlineItem({ task, onClick }: { task: any; onClick: () => void }) {
  const due = parseISO(task.deadline)
  const today = new Date()
  const days = differenceInDays(due, today)
  const isOverdue = isAfter(today, due)

  // Ratio 3 type labels — no colored badges
  const typeLabel: Record<string, string> = { gst: 'GST', tds: 'TDS', audit: 'Audit' }

  return (
    <li
      className="flex items-center gap-3 py-2.5 rounded-lg px-1 transition-colors cursor-pointer"
      style={{ borderBottom: `1px solid ${G.border}` }}
      onMouseEnter={e => (e.currentTarget.style.background = G.canvas)}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
      onClick={onClick}
    >
      {/* Date column */}
      <div className="flex flex-col items-center w-9 shrink-0 text-center">
        {/* Ratio 3: month */}
        <span className="text-[9px] font-semibold uppercase" style={{ color: G.muted }}>
          {format(due, 'MMM')}
        </span>
        {/* Ratio 5: day (red if overdue) */}
        <span
          className="text-lg font-bold leading-tight tabular-nums"
          style={{ color: isOverdue ? '#B42318' : G.primary }}
        >
          {format(due, 'd')}
        </span>
      </div>

      {/* Ratio 2 vertical divider */}
      <div className="w-px h-8 shrink-0" style={{ background: G.border }} />

      <div className="min-w-0 flex-1">
        {/* Ratio 5: task title */}
        <p className="text-xs font-medium truncate" style={{ color: G.primary }}>{task.title}</p>

        <div className="flex items-center gap-2 mt-0.5">
          {/* Ratio 3: type label — plain, no color badge */}
          <span className="text-[9px] font-bold uppercase" style={{ color: G.muted }}>
            {typeLabel[task.task_type] ?? task.task_type}
          </span>
          {/* Ratio 4: countdown */}
          <span
            className="text-[10px] font-medium"
            style={{ color: isOverdue ? '#B42318' : days <= 3 ? '#D97706' : G.secondary }}
          >
            {isOverdue ? `${Math.abs(days)}d overdue` : days === 0 ? 'Due today' : `${days}d left`}
          </span>
        </div>
      </div>
    </li>
  )
}

// ─── Empty state ───────────────────────────────────────────
function Empty({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <div className="flex flex-col items-center gap-2 py-8">
      <Icon className="h-8 w-8" style={{ color: G.muted }} />
      <p className="text-sm" style={{ color: G.secondary }}>{text}</p>
    </div>
  )
}

// ─── Main Dashboard ─────────────────────────────────────────
export function DashboardPage() {
  const navigate = useNavigate()
  const user = useAuthStore(s => s.user)
  const { isSuperAdmin } = usePermission()
  const today = new Date()

  const { data: dashData } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardApi.get().then(r => r.data),
  })
  const stats = dashData?.stats

  const pendingApprovals = useApprovalStore(s => s.requests.filter(r => r.status === 'Pending').length)
  const [period, setPeriod] = useState<'upcoming' | 'this_week' | 'month'>('upcoming')
  const [rightOpen, setRightOpen] = useState(() => localStorage.getItem('al-right-panel') !== '0')

  const kpis = [
    { label: 'Overdue', value: stats?.overdue_count ?? 3, sub: 'Past due · not completed', accent: '#B42318', path: '/workcenter?kpi=overdue', urgent: true },
    { label: 'Pending from Client', value: 5, sub: 'Docs & clarifications', accent: '#D97706', path: '/workcenter?kpi=client', urgent: false },
    { label: 'Self Review', value: 2, sub: 'Assignee review', accent: '#3D6B5E', path: '/workcenter?kpi=self', urgent: false },
    { label: 'Final Review', value: 2, sub: 'Senior / final', accent: '#4A4E53', path: '/workcenter?kpi=final', urgent: false },
    { label: 'Approvals', value: Math.max(1, pendingApprovals), sub: 'Sign-off queue', accent: '#4A4E53', path: isSuperAdmin() ? '/users?tab=approvals' : '/workcenter?kpi=review', urgent: false },
  ]

  const now = new Date()
  const range = period === 'this_week'
    ? { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) }
    : period === 'month'
      ? { start: startOfMonth(now), end: endOfMonth(now) }
      : { start: now, end: addDays(now, 7) } as const

  const extraDeadlines = [
    { id: 101, title: 'GSTR-3B — October 2026', deadline: '2026-11-04T00:00:00Z', task_type: 'gst' },
    { id: 102, title: 'Client follow-up — Apex Auto', deadline: '2026-11-05T00:00:00Z', task_type: 'other' },
    { id: 103, title: 'Self review pack — Sunrise', deadline: '2026-11-06T00:00:00Z', task_type: 'gst' },
    { id: 104, title: 'TDS challan follow-up', deadline: '2026-11-07T00:00:00Z', task_type: 'tds' },
  ]
  const allDeadlines = [
    ...(dashData?.upcoming_deadlines ?? []),
    ...MOCK_TASKS.filter(t => t.status !== 'done' && t.deadline).map(t => ({
      id: t.id, title: t.title, deadline: t.deadline!, task_type: t.task_type,
    })),
    ...extraDeadlines,
  ]
  const seen = new Set<string>()
  const periodDeadlines = allDeadlines.filter(t => {
    if (!t.deadline) return false
    const due = parseISO(t.deadline)
    const key = `${t.title}|${t.deadline}`
    if (seen.has(key)) return false
    seen.add(key)
    try {
      return isWithinInterval(due, { start: range.start, end: range.end })
    } catch {
      return false
    }
  }).sort((a, b) => parseISO(a.deadline as string).getTime() - parseISO(b.deadline as string).getTime())

  function setCalendarOpen(open: boolean) {
    setRightOpen(open)
    localStorage.setItem('al-right-panel', open ? '1' : '0')
  }

  const unreadCount = MOCK_THREADS.reduce((n, t) => n + (t.unread_count ?? 0), 0)

  return (
    <div className="p-3 md:p-4 max-w-[1600px] mx-auto relative" style={{ background: G.canvas }}>

      <div className="flex gap-3 items-start">
        <div className="flex-1 min-w-0 flex flex-col gap-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-2 items-start">
            {kpis.map(kpi => (
              <KpiCard
                key={kpi.label}
                label={kpi.label}
                value={kpi.value}
                sub={kpi.sub}
                accent={kpi.accent}
                urgent={kpi.urgent}
                onClick={() => navigate(kpi.path)}
              />
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-stretch">
            <Card>
              <div className="p-4 h-full flex flex-col">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-1" style={{ borderBottom: `1px solid ${G.border}` }}>
                  <div>
                    <h2 className="text-sm font-semibold" style={{ color: G.primary }}>Tasks</h2>
                    <p className="text-[11px]" style={{ color: G.secondary }}>
                      {periodDeadlines.length} deadline{periodDeadlines.length === 1 ? '' : 's'} in this period
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-[10px] font-bold uppercase" htmlFor="task-period" style={{ color: G.muted }}>Period</label>
                    <select id="task-period" value={period} onChange={e => setPeriod(e.target.value as typeof period)}
                      className="rounded-lg px-2 py-1.5 text-xs font-semibold" style={{ background: G.canvas, border: `1px solid ${G.border}` }}>
                      <option value="upcoming">Upcoming week (default)</option>
                      <option value="this_week">This week</option>
                      <option value="month">This month</option>
                    </select>
                    <button type="button" className="text-xs font-semibold" style={{ color: '#3D6B5E' }}
                      onClick={() => navigate('/workcenter')}>View all</button>
                  </div>
                </div>
                {periodDeadlines.length === 0 ? (
                  <Empty icon={CheckCircle2} text="No task deadlines in this period" />
                ) : (
                  <ul className="flex-1">
                    {periodDeadlines.map((task: any) => (
                      <DeadlineItem key={`${task.id}-${task.deadline}`} task={task} onClick={() => navigate('/workcenter')} />
                    ))}
                  </ul>
                )}
              </div>
            </Card>

            <Card>
              <div className="p-4 h-full flex flex-col">
                <div className="flex items-center justify-between pb-3 mb-1" style={{ borderBottom: `1px solid ${G.border}` }}>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" style={{ color: G.muted }} aria-hidden />
                    <h2 className="text-sm font-semibold" style={{ color: G.primary }}>Communication</h2>
                    {unreadCount > 0 && (
                      <span className="rounded-full px-2 py-0.5 text-[9px] font-bold" style={{ background: '#EEF4F2', color: '#3D6B5E' }}>
                        {unreadCount} unread
                      </span>
                    )}
                  </div>
                </div>
                <ul className="mt-3 flex-1">
                  {MOCK_INBOX.map(msg => (
                    <li key={msg.id} className="flex items-start gap-3 py-2.5" style={{ borderBottom: `1px solid ${G.border}` }}>
                      <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ background: channelDot[msg.channel] ?? G.muted }} />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs leading-snug truncate" style={{ color: G.primary, fontWeight: msg.unread ? 600 : 400 }}>{msg.from}</p>
                        <p className="text-[11px] truncate mt-0.5" style={{ color: G.secondary }}>{msg.snippet}</p>
                      </div>
                      <span className="shrink-0 text-[10px] whitespace-nowrap mt-0.5" style={{ color: G.muted }}>{msg.time}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-3">
                  <button
                    type="button"
                    className="w-full rounded-lg py-2 text-xs font-semibold transition-colors"
                    style={{ background: G.canvas, border: `1px solid ${G.border}`, color: G.secondary }}
                    onClick={() => navigate('/communication')}
                  >
                    Open Communication →
                  </button>
                </div>
              </div>
            </Card>
          </div>

          <DashboardPersonalCard />
        </div>

        <aside
          aria-label="Calendar"
          className={cn(
            'shrink-0 overflow-hidden transition-all duration-300 ease-out',
            rightOpen ? 'w-full max-w-[340px] opacity-100' : 'w-0 max-w-0 opacity-0 pointer-events-none'
          )}
        >
          <div className="w-[340px] max-w-full">
            <DashboardRightPanel onClose={() => setCalendarOpen(false)} />
          </div>
        </aside>
      </div>

      {!rightOpen && (
        <button
          type="button"
          onClick={() => setCalendarOpen(true)}
          className="flex fixed right-0 top-1/2 -translate-y-1/2 z-20 h-28 w-8 items-center justify-center rounded-l-xl border bg-white text-[10px] font-bold tracking-wide shadow-sm"
          style={{ borderColor: G.border, color: G.secondary, writingMode: 'vertical-rl' }}
          aria-label="Open calendar"
        >
          Calendar
        </button>
      )}
    </div>
  )
}
