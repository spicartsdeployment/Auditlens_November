import { useEffect, useState } from 'react'
import { G } from '@/shared/components/GrayKpi'
import {
  normalizeHex,
  usePaletteStore,
  type ThemeColors,
} from '@/shared/hooks/usePaletteStore'

const FIELDS: { key: keyof ThemeColors; label: string; hint: string }[] = [
  { key: 'brand', label: 'Brand', hint: 'Buttons, active nav, highlights' },
  { key: 'sidebar', label: 'Sidebar', hint: 'Navigation rail background' },
  { key: 'canvas', label: 'Canvas', hint: 'Page background' },
  { key: 'surface', label: 'Cards', hint: 'Elevated panels and tables' },
]

function ColorField({
  label,
  hint,
  value,
  onChange,
}: {
  label: string
  hint: string
  value: string
  onChange: (hex: string) => void
}) {
  const [draft, setDraft] = useState(value)
  const [editing, setEditing] = useState(false)
  useEffect(() => {
    if (!editing) setDraft(value)
  }, [value, editing])

  return (
    <label className="flex flex-col h-full rounded-2xl p-4 cursor-pointer"
      style={{ background: G.canvas, border: `1px solid ${G.border}` }}>
      <span className="text-sm font-bold" style={{ color: G.primary }}>{label}</span>
      <span className="text-[11px] mt-0.5 mb-3" style={{ color: G.secondary }}>{hint}</span>
      <input
        type="color"
        value={normalizeHex(value) ?? '#000000'}
        onChange={e => {
          const hex = e.target.value.toUpperCase()
          setDraft(hex)
          onChange(hex)
        }}
        className="theme-color-input w-full flex-1 min-h-[200px]"
        aria-label={label}
      />
      <input
        type="text"
        value={editing ? draft : value}
        onFocus={() => { setEditing(true); setDraft(value) }}
        onChange={e => {
          const next = e.target.value.toUpperCase()
          setDraft(next)
          const hex = normalizeHex(next)
          if (hex) onChange(hex)
        }}
        onBlur={() => { setEditing(false); setDraft(value) }}
        spellCheck={false}
        className="mt-3 w-full rounded-xl px-3 py-2 text-sm font-mono font-semibold outline-none"
        style={{
          color: G.primary,
          background: G.white,
          border: `1px solid ${G.border}`,
        }}
        aria-label={`${label} hex`}
      />
    </label>
  )
}

export function ColorPickerPanel() {
  const colors = usePaletteStore(s => s.colors)
  const setColor = usePaletteStore(s => s.setColor)
  const resetColors = usePaletteStore(s => s.resetColors)

  return (
    <div
      className="rounded-2xl border p-5 md:p-6 flex flex-col flex-1 min-h-[calc(100dvh-13rem)]"
      style={{ background: G.white, borderColor: G.border }}
    >
      <div className="flex items-start justify-between gap-3 mb-4 shrink-0">
        <div>
          <h2 className="text-sm font-bold" style={{ color: G.primary }}>Colour</h2>
          <p className="text-xs mt-1" style={{ color: G.secondary }}>
            Pick colours for the interface. Changes apply immediately and stay in this browser.
          </p>
        </div>
        <button
          type="button"
          onClick={resetColors}
          className="text-xs font-semibold rounded-xl px-3 py-1.5 shrink-0"
          style={{ color: G.secondary, border: `1px solid ${G.border}`, background: G.canvas }}
        >
          Reset defaults
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 flex-1">
        {FIELDS.map(field => (
          <ColorField
            key={field.key}
            label={field.label}
            hint={field.hint}
            value={colors[field.key]}
            onChange={hex => setColor(field.key, hex)}
          />
        ))}
      </div>
    </div>
  )
}
