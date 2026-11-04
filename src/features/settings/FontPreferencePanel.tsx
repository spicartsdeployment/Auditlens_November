import { FONT_OPTIONS, useFontStore, type FontId } from '@/shared/hooks/useFontStore'

export function FontPreferencePanel() {
  const fontId = useFontStore(s => s.fontId)
  const setFont = useFontStore(s => s.setFont)
  const setPreview = useFontStore(s => s.setPreview)

  return (
    <div className="rounded-2xl border bg-white p-5" style={{ borderColor: '#E4DFD6' }}>
      <h2 className="text-sm font-bold mb-1" style={{ color: '#2B2F33' }}>Font preference</h2>
      <p className="text-xs mb-4" style={{ color: '#6E7176' }}>
        Applies across the AuditLens interface. Stored in this browser only — not a server setting.
      </p>
      <div className="grid sm:grid-cols-2 gap-2">
        {FONT_OPTIONS.map(opt => {
          const active = fontId === opt.id
          return (
            <button
              key={opt.id}
              type="button"
              onMouseEnter={() => setPreview(opt.id as FontId)}
              onMouseLeave={() => setPreview(null)}
              onClick={() => setFont(opt.id as FontId)}
              className="rounded-xl p-3 text-left"
              style={{
                background: active ? '#F5F2EC' : '#fff',
                border: `1.5px solid ${active ? '#2B2F33' : '#E4DFD6'}`,
                fontFamily: opt.stack,
              }}
            >
              <p className="text-xs font-bold" style={{ color: '#2B2F33' }}>{opt.label}</p>
              <p className="text-sm mt-1" style={{ color: '#5C5F63' }}>{opt.sample} jumps over the lazy dog.</p>
              <p className="text-[10px] mt-2 font-semibold" style={{ color: active ? '#3D6B5E' : '#8A8D91' }}>
                {active ? 'Applied' : 'Hover to preview · click to apply'}
              </p>
            </button>
          )
        })}
      </div>
    </div>
  )
}
