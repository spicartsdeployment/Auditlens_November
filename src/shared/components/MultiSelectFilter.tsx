import { useEffect, useRef, useState } from 'react'
import { ChevronDown, X } from 'lucide-react'

export function MultiSelectFilter({
  label, options, selected, onChange, searchable,
}: {
  label: string
  options: { value: string; label: string }[]
  selected: string[]
  onChange: (next: string[]) => void
  searchable?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  const filtered = options.filter(o => o.label.toLowerCase().includes(q.toLowerCase()))
  const count = selected.length

  function toggle(v: string) {
    onChange(selected.includes(v) ? selected.filter(x => x !== v) : [...selected, v])
  }

  return (
    <div className="relative shrink-0" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="appearance-none pl-3 pr-7 py-[7px] rounded-xl text-xs font-semibold outline-none cursor-pointer min-w-[120px] text-left"
        style={{ background: '#F5F2EC', border: '1px solid #E4DFD6', color: '#5C5F63' }}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {count ? `${label} (${count})` : label}
      </button>
      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3" style={{ color: '#8A8D91' }} />
      {open && (
        <div className="absolute z-40 mt-1 w-56 rounded-xl border bg-white shadow-lg p-2" style={{ borderColor: '#E4DFD6' }}>
          {searchable && (
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Search…"
              className="w-full mb-2 rounded-lg px-2 py-1.5 text-xs outline-none"
              style={{ background: '#F5F2EC', border: '1px solid #E4DFD6' }}
            />
          )}
          <div className="max-h-48 overflow-y-auto space-y-0.5">
            {filtered.map(o => (
              <label key={o.value} className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs cursor-pointer hover:bg-neutral-50">
                <input type="checkbox" checked={selected.includes(o.value)} onChange={() => toggle(o.value)} />
                <span style={{ color: '#2B2F33' }}>{o.label}</span>
              </label>
            ))}
            {filtered.length === 0 && <p className="text-[11px] px-2 py-2" style={{ color: '#8A8D91' }}>No matches</p>}
          </div>
          {count > 0 && (
            <button type="button" className="mt-1 text-[10px] font-semibold px-2 py-1" style={{ color: '#3D6B5E' }}
              onClick={() => onChange([])}>Clear</button>
          )}
        </div>
      )}
    </div>
  )
}

export function FilterChips({ chips, onRemove, onReset }: {
  chips: { key: string; label: string }[]
  onRemove: (key: string) => void
  onReset: () => void
}) {
  if (!chips.length) return null
  return (
    <div className="flex items-center gap-1.5 flex-wrap w-full pt-2">
      {chips.map(c => (
        <span key={c.key} className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
          style={{ background: '#EFEBE4', color: '#4A4E53', border: '1px solid #E4DFD6' }}>
          {c.label}
          <button type="button" onClick={() => onRemove(c.key)} aria-label={`Remove ${c.label}`}>
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <button type="button" onClick={onReset} className="text-[10px] font-bold px-2 py-0.5" style={{ color: '#B42318' }}>
        Reset Filters
      </button>
    </div>
  )
}
