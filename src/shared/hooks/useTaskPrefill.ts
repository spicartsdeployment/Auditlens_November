import { create } from 'zustand'

interface TaskPrefill {
  dueDate?: string
  openCreate: boolean
  setPrefill: (p: { dueDate?: string; openCreate?: boolean }) => void
  consume: () => { dueDate?: string; openCreate: boolean }
}

export const useTaskPrefill = create<TaskPrefill>((set, get) => ({
  dueDate: undefined,
  openCreate: false,
  setPrefill: (p) => set({ dueDate: p.dueDate, openCreate: p.openCreate ?? true }),
  consume: () => {
    const { dueDate, openCreate } = get()
    set({ dueDate: undefined, openCreate: false })
    return { dueDate, openCreate }
  },
}))
