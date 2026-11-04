import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const FONT_OPTIONS = [
  { id: 'inter', label: 'Inter', stack: '"Inter", system-ui, sans-serif', sample: 'The quick brown fox' },
  { id: 'jakarta', label: 'Plus Jakarta Sans', stack: '"Plus Jakarta Sans", system-ui, sans-serif', sample: 'The quick brown fox' },
  { id: 'roboto', label: 'Roboto', stack: '"Roboto", system-ui, sans-serif', sample: 'The quick brown fox' },
  { id: 'opensans', label: 'Open Sans', stack: '"Open Sans", system-ui, sans-serif', sample: 'The quick brown fox' },
] as const

export type FontId = typeof FONT_OPTIONS[number]['id']

interface FontStore {
  fontId: FontId
  previewId: FontId | null
  setFont: (id: FontId) => void
  setPreview: (id: FontId | null) => void
  apply: (id?: FontId | null) => void
}

export function applyFont(id: FontId) {
  const opt = FONT_OPTIONS.find(f => f.id === id) ?? FONT_OPTIONS[0]
  document.documentElement.style.setProperty('--font-sans', opt.stack)
  document.documentElement.style.fontFamily = opt.stack
  document.body.style.fontFamily = opt.stack
}

export const useFontStore = create<FontStore>()(
  persist(
    (set, get) => ({
      fontId: 'inter',
      previewId: null,
      setFont: (fontId) => {
        applyFont(fontId)
        set({ fontId, previewId: null })
      },
      setPreview: (previewId) => {
        applyFont(previewId ?? get().fontId)
        set({ previewId })
      },
      apply: (id) => applyFont(id ?? get().previewId ?? get().fontId),
    }),
    { name: 'auditlens-font', partialize: (s) => ({ fontId: s.fontId }) }
  )
)
