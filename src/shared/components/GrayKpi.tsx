/**
 * Shared AuditLens visual tokens — charcoal / graphite / warm white / muted emerald
 */
import { cn } from './cn'

export const G = {
  canvas:     'var(--color-bg)',
  white:      'var(--color-surface)',
  border:     'var(--color-border)',
  icon:       'var(--color-text-muted)',
  muted:      'var(--color-text-muted)',
  secondary:  'var(--color-text-secondary)',
  primary:    'var(--color-text-primary)',
  brand:      'var(--color-brand)',
  brandHover: 'var(--color-brand-hover)',
  brandSoft:  'var(--color-brand-soft)',
  graphite:   'var(--color-neutral-700)',
  accent:     'var(--color-brand)',
} as const

/** White KPI metric card — no color tints */
export function GrayKpi({
  label, value, icon: Icon, sub, urgent, onClick,
}: {
  label: string
  value: number | string
  icon: React.ElementType
  sub?: string
  urgent?: boolean
  onClick?: () => void
}) {
  return (
    <button
      className="rounded-2xl text-left w-full p-4 transition-all group"
      style={{ background: G.white, border: `1px solid ${G.border}`, boxShadow: '0 1px 2px 0 rgba(43,47,51,0.04)' }}
      onClick={onClick}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#D5CFC4' }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = G.border }}
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-xl mb-3"
        style={{ background: G.canvas, border: `1px solid ${G.border}` }}>
        <Icon className="h-4 w-4" style={{ color: urgent ? '#B42318' : G.icon }} aria-hidden />
      </div>
      <p className="text-2xl font-bold leading-none mb-1.5 tabular-nums"
        style={{ color: urgent ? '#B42318' : G.primary }}>{value}</p>
      <p className="text-xs font-semibold" style={{ color: G.secondary }}>{label}</p>
      {sub && <p className="text-[10px] mt-0.5" style={{ color: G.icon }}>{sub}</p>}
    </button>
  )
}

/** Page title + sub */
export function PageHeader({ title, sub, children }: { title: string; sub?: string; children?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-xl font-bold" style={{ color: G.primary }}>{title}</h1>
        {sub && <p className="text-sm mt-0.5" style={{ color: G.secondary }}>{sub}</p>}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  )
}

/** Primary CTA button */
export function DarkBtn({ onClick, children, className = '' }: { onClick?: () => void; children: React.ReactNode; className?: string }) {
  return (
    <button
      onClick={onClick}
      className={cn('flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold text-white transition-all active:scale-[0.98]', className)}
      style={{ background: G.brand }}
      onMouseEnter={e => (e.currentTarget.style.background = G.brandHover)}
      onMouseLeave={e => (e.currentTarget.style.background = G.brand)}
    >
      {children}
    </button>
  )
}

/** Secondary outlined button */
export function OutlineBtn({ onClick, children, className = '' }: { onClick?: () => void; children: React.ReactNode; className?: string }) {
  return (
    <button
      onClick={onClick}
      className={cn('flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all', className)}
      style={{ background: G.white, border: `1px solid ${G.border}`, color: G.secondary }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#D5CFC4'; (e.currentTarget as HTMLElement).style.color = G.primary }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = G.border; (e.currentTarget as HTMLElement).style.color = G.secondary }}
    >
      {children}
    </button>
  )
}

/** Tab bar */
export function TabBar<T extends string>({
  tabs, active, onChange,
}: { tabs: T[]; active: T; onChange: (t: T) => void }) {
  return (
    <div className="flex gap-0.5 rounded-xl p-0.5 w-fit mb-5"
      style={{ background: G.canvas, border: `1px solid ${G.border}` }}>
      {tabs.map(t => (
        <button key={t} onClick={() => onChange(t)}
          className="rounded-lg px-4 py-1.5 text-sm font-semibold capitalize transition-all"
          style={active === t
            ? { background: G.brand, color: G.white }
            : { background: 'transparent', color: G.secondary }
          }
          onMouseEnter={e => { if (active !== t) (e.currentTarget as HTMLElement).style.color = G.primary }}
          onMouseLeave={e => { if (active !== t) (e.currentTarget as HTMLElement).style.color = G.secondary }}
        >
          {t}
        </button>
      ))}
    </div>
  )
}

/** Filter pill strip */
export function FilterPills<T extends string>({
  pills, active, onChange,
}: { pills: T[]; active: T; onChange: (t: T) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5 mb-4">
      {pills.map(p => (
        <button key={p} onClick={() => onChange(p)}
          className="rounded-lg px-3 py-1.5 text-xs font-semibold transition-all"
          style={active === p
            ? { background: G.brand, color: G.white }
            : { background: G.canvas, border: `1px solid ${G.border}`, color: G.secondary }
          }
        >
          {p}
        </button>
      ))}
    </div>
  )
}

/** White content card */
export function ContentCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('rounded-2xl', className)}
      style={{ background: G.white, border: `1px solid ${G.border}`, boxShadow: '0 1px 2px 0 rgba(43,47,51,0.04)' }}>
      {children}
    </div>
  )
}

/** Status badge — gray canvas, semantic text */
export function StatusBadge({ status }: { status: string }) {
  const textColors: Record<string, string> = {
    filed: '#166534', done: '#166534', approved: '#166534',
    submitted: '#065F46',
    in_review: '#2F5570', inprogress: '#2F5570',
    pending: '#92400E',
    draft: '#5C5F63', todo: '#5C5F63',
    overdue: '#991B1B', open: '#991B1B',
    resolved: '#166534', closed: '#5C5F63',
  }
  const color = textColors[status.toLowerCase().replace(' ', '_')] ?? '#5C5F63'
  return (
    <span
      className="inline-flex items-center rounded-full text-[9px] font-bold uppercase tracking-tight"
      style={{ background: G.canvas, border: `1px solid ${G.border}`, color, padding: '2px 8px' }}
    >
      {status.replace(/_/g, ' ')}
    </span>
  )
}

/** Section heading inside a card */
export function SectionHead({ icon: Icon, title, right }: { icon?: React.ElementType; title: string; right?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between pb-3 mb-1"
      style={{ borderBottom: `1px solid ${G.border}` }}>
      <div className="flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4" style={{ color: G.icon }} aria-hidden />}
        <h2 className="text-sm font-semibold" style={{ color: G.primary }}>{title}</h2>
      </div>
      {right}
    </div>
  )
}
