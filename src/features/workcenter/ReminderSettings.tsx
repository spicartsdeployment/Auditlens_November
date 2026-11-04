export type ReminderPrefs = { d2: boolean; d1: boolean; h12: boolean; h2: boolean }

const ROWS: { key: keyof ReminderPrefs; label: string }[] = [
  { key: 'd2', label: '2 days before deadline' },
  { key: 'd1', label: '1 day before deadline' },
  { key: 'h12', label: '12 hours before deadline' },
  { key: 'h2', label: '2 hours before deadline' },
]

export function ReminderSettings({
  value, onChange, dueDate,
}: {
  value: ReminderPrefs
  onChange: (next: ReminderPrefs) => void
  dueDate?: string
}) {
  return (
    <div className="rounded-xl p-3 space-y-2" style={{ background: '#F5F2EC', border: '1px solid #E4DFD6' }}>
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#8A8D91' }}>WhatsApp reminders</p>
        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: '#ECFDF5', color: '#047857', border: '1px solid #A7F3D0' }}>
          Channel: WhatsApp
        </span>
      </div>
      <p className="text-[10px]" style={{ color: '#6E7176' }}>
        Frontend configuration only — no messages are sent. Schedule is relative to the task deadline{dueDate ? ` (${dueDate})` : ''}.
      </p>
      {ROWS.map(r => (
        <label key={r.key} className="flex items-center justify-between rounded-lg px-2 py-1.5 text-xs" style={{ background: '#fff', border: '1px solid #E4DFD6' }}>
          <span style={{ color: '#2B2F33' }}>{r.label}</span>
          <input type="checkbox" checked={value[r.key]}
            onChange={e => onChange({ ...value, [r.key]: e.target.checked })}
            aria-label={r.label} />
        </label>
      ))}
    </div>
  )
}
