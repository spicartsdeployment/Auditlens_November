import type { ReminderPrefs } from './ReminderSettings'

export const TEAM_USERS = [
  { id: 'u1', name: 'Rohan Verma', role: 'Article', isCa: false },
  { id: 'u2', name: 'Sneha Iyer', role: 'Article', isCa: false },
  { id: 'u3', name: 'Priya Sharma', role: 'Admin', isCa: true },
  { id: 'u4', name: 'Arjun Mehta', role: 'Super Admin', isCa: true },
]

export const DEFAULT_REMINDERS: ReminderPrefs = { d2: true, d1: true, h12: false, h2: false }

export const PRIORITY_RANK: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 }

export function pendingFromClient(item: { pending_docs?: number; open_queries?: number; pending_other?: number }) {
  return (item.pending_docs ?? 0) + (item.open_queries ?? 0) + (item.pending_other ?? 0)
}

export function isTaskOverdue(item: { queue?: string; days_remaining: number }) {
  return item.queue !== 'done' && item.days_remaining < 0
}

export function reviewLabel(item: { queue: string; self_review?: string; senior_review?: string }) {
  if (item.queue === 'done' || item.senior_review === 'done') return 'Approved'
  if (item.senior_review === 'returned' || item.self_review === 'returned') return 'Returned for Changes'
  if (item.queue === 'in_review' && item.self_review === 'done') return 'Awaiting Senior Review'
  if (item.queue === 'in_review') return 'Awaiting Self Review'
  if (item.queue === 'todo') return 'To Do'
  return 'In Progress'
}

export function extraAssignees(item: { assigned_to: string; assignees?: string[]; lead_assignee?: string }) {
  const lead = item.lead_assignee || item.assigned_to
  const all = item.assignees?.length ? item.assignees : [item.assigned_to]
  return { lead, others: all.filter(n => n && n !== lead) }
}
