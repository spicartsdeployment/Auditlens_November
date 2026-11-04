import { useMemo, useState } from 'react'

export type TeamMember = { id: string; name: string; role: string; isCa: boolean }

export function AssigneePicker({
  team, selected, lead, onChange, includeSelfNote,
}: {
  team: TeamMember[]
  selected: string[]
  lead: string
  onChange: (selected: string[], lead: string) => void
  includeSelfNote?: string
}) {
  const [q, setQ] = useState('')
  const cas = team.filter(t => t.isCa)
  const others = team.filter(t => !t.isCa)
  const match = (list: TeamMember[]) => list.filter(t => t.name.toLowerCase().includes(q.toLowerCase()))

  function toggle(name: string) {
    const next = selected.includes(name) ? selected.filter(n => n !== name) : [...selected, name]
    const nextLead = next.includes(lead) ? lead : (next[0] ?? '')
    onChange(next, nextLead)
  }

  const grouped = useMemo(() => ([
    { title: 'Chartered Accountants', list: match(cas) },
    { title: 'Other than CA', list: match(others) },
  ]), [q, team, selected, lead])

  return (
    <div className="rounded-xl p-3 space-y-2" style={{ background: '#F5F2EC', border: '1px solid #E4DFD6' }}>
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#8A8D91' }}>Assignees</p>
        {includeSelfNote && <p className="text-[10px]" style={{ color: '#6E7176' }}>{includeSelfNote}</p>}
      </div>
      <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search users…"
        className="w-full rounded-lg px-2 py-1.5 text-xs outline-none"
        style={{ background: '#fff', border: '1px solid #E4DFD6' }} />
      {grouped.map(g => (
        <div key={g.title}>
          <p className="text-[10px] font-semibold mb-1" style={{ color: '#5C5F63' }}>{g.title}</p>
          <div className="space-y-1">
            {g.list.map(u => (
              <label key={u.id} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs cursor-pointer hover:bg-white">
                <input type="checkbox" checked={selected.includes(u.name)} onChange={() => toggle(u.name)} />
                <span className="flex-1 font-medium" style={{ color: '#2B2F33' }}>{u.name}</span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{ background: u.isCa ? '#EEF4F2' : '#EFEBE4', color: u.isCa ? '#1D4ED8' : '#5C5F63', border: '1px solid #E4DFD6' }}>
                  {u.isCa ? 'CA' : u.role}
                </span>
                {selected.includes(u.name) && (
                  <label className="flex items-center gap-1 text-[10px]" style={{ color: '#5C5F63' }}
                    onClick={e => e.stopPropagation()}>
                    <input type="checkbox" checked={lead === u.name}
                      onChange={() => onChange(selected, u.name)} />
                    Lead
                  </label>
                )}
              </label>
            ))}
            {g.list.length === 0 && <p className="text-[10px] px-2" style={{ color: '#8A8D91' }}>None</p>}
          </div>
        </div>
      ))}
      {!lead && selected.length > 0 && (
        <p className="text-[10px]" style={{ color: '#B42318' }}>Select a lead assignee (checkbox beside the name).</p>
      )}
      {selected.length === 0 && (
        <p className="text-[10px]" style={{ color: '#B42318' }}>Assign at least one member.</p>
      )}
    </div>
  )
}
