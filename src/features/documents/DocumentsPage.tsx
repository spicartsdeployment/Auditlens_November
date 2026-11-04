import { useMemo, useState } from 'react'
import { Search, Upload, FileText, Share2, CheckCircle2, Eye, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { G, PageHeader, DarkBtn, OutlineBtn, ContentCard } from '@/shared/components/GrayKpi'
import { MOCK_RECEIVED_DOCS, MOCK_SENT_DOCS, MOCK_DOC_TEMPLATES, MOCK_CHECKLISTS } from '@/mock/uxEnhancements'

type MainTab = 'received' | 'sent' | 'checklists' | 'templates'
type ShareDraft = { ids: number[]; client: string }

function StatusPill({ label, tone }: { label: string; tone: 'ok' | 'warn' | 'muted' }) {
  const map = {
    ok: { bg: '#ECFDF5', color: '#047857' },
    warn: { bg: '#FFFBEB', color: '#B45309' },
    muted: { bg: '#EFEBE4', color: '#5C5F63' },
  }[tone]
  return (
    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: map.bg, color: map.color, border: '1px solid #E4DFD6' }}>
      {label}
    </span>
  )
}

export function DocumentsPage() {
  const [tab, setTab] = useState<MainTab>('received')
  const [search, setSearch] = useState('')
  const [client, setClient] = useState('all')
  const [category, setCategory] = useState('all')
  const [fy, setFy] = useState('all')
  const [status, setStatus] = useState('all')
  const [selected, setSelected] = useState<number[]>([])
  const [share, setShare] = useState<ShareDraft | null>(null)
  const [shareHistory, setShareHistory] = useState(MOCK_SENT_DOCS)
  const [preview, setPreview] = useState<{ title: string; body: string; demo?: boolean } | null>(null)
  const [generating, setGenerating] = useState<string | null>(null)
  const [checklists, setChecklists] = useState(MOCK_CHECKLISTS)
  const [openCl, setOpenCl] = useState<string | null>(MOCK_CHECKLISTS[0]?.id ?? null)
  const [lastShareKey, setLastShareKey] = useState('')

  const clients = ['Sunrise Textiles', 'BlueSky Software', 'Redwood Constructions', 'Green Pharma', 'Apex Auto Parts']

  const received = useMemo(() => MOCK_RECEIVED_DOCS.filter(d => {
    if (search && !`${d.name} ${d.client}`.toLowerCase().includes(search.toLowerCase())) return false
    if (client !== 'all' && d.client !== client) return false
    if (category !== 'all' && d.category !== category) return false
    if (fy !== 'all' && d.fy !== fy) return false
    if (status !== 'all' && d.verification !== status) return false
    return true
  }), [search, client, category, fy, status])

  const sent = useMemo(() => shareHistory.filter(d => {
    if (search && !`${d.name} ${d.client}`.toLowerCase().includes(search.toLowerCase())) return false
    if (client !== 'all' && d.client !== client) return false
    if (category !== 'all' && d.category !== category) return false
    if (status !== 'all' && d.delivery !== status) return false
    return true
  }), [search, client, category, status, shareHistory])

  function toggleSelect(id: number) {
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id])
  }

  function confirmShare() {
    if (!share || !share.client || !share.ids.length) return
    const key = `${share.client}:${share.ids.slice().sort().join(',')}`
    if (key === lastShareKey) {
      toast.error('Those documents were already marked shared in this session.')
      return
    }
    const docs = MOCK_RECEIVED_DOCS.filter(d => share.ids.includes(d.id))
    const next = docs.map((d, i) => ({
      id: Date.now() + i,
      name: d.name,
      client: share.client,
      category: d.category,
      sent_at: new Date().toISOString().slice(0, 10),
      related: d.related,
      delivery: 'Demo — marked sent',
      task_id: d.task_id,
    }))
    setShareHistory(h => [...next, ...h])
    setLastShareKey(key)
    setSelected([])
    setShare(null)
    setTab('sent')
    toast.success('Frontend demo: documents marked as shared. No email was sent.')
  }

  async function generateTemplate(id: string, name: string) {
    setGenerating(id)
    await new Promise(r => setTimeout(r, 900))
    setGenerating(null)
    setPreview({
      title: name,
      demo: true,
      body: `DEMO DOCUMENT — not stored on the server.\n\nTemplate: ${name}\nFirm: AuditLens Demo CA Firm\nGenerated in the browser for preview only.\n\nThis is a representative draft for internal CA-firm operations. It is not an official or legally approved form.`,
    })
    toast.info('Simulated generation complete — no file was stored.')
  }

  const openChecklist = checklists.find(c => c.id === openCl)

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto" style={{ background: G.canvas }}>
      <PageHeader title="Document Management" sub="Received from clients, sent documents, checklists, and templates">
        <DarkBtn onClick={() => toast.info('Upload uses the existing document repository (demo).')}>
          <Upload className="h-4 w-4" />Upload
        </DarkBtn>
      </PageHeader>

      <div className="flex gap-1 mb-4 flex-wrap">
        {([
          { id: 'received', label: 'Received Documents' },
          { id: 'sent', label: 'Send Documents' },
          { id: 'checklists', label: 'Checklists' },
          { id: 'templates', label: 'Templates' },
        ] as const).map(t => (
          <button key={t.id} type="button" onClick={() => { setTab(t.id); setSearch('') }}
            className="rounded-xl px-3 py-2 text-xs font-bold"
            style={{
              background: tab === t.id ? G.primary : G.white,
              color: tab === t.id ? '#fff' : G.secondary,
              border: `1px solid ${tab === t.id ? G.primary : G.border}`,
            }}>{t.label}</button>
        ))}
      </div>

      {(tab === 'received' || tab === 'sent') && (
        <div className="flex items-center gap-2 mb-4 rounded-2xl p-3 flex-wrap" style={{ background: G.white, border: `1px solid ${G.border}` }}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5" style={{ color: G.icon }} />
            <input type="search" value={search} onChange={e => setSearch(e.target.value)}
              placeholder={tab === 'received' ? 'Search received…' : 'Search sent…'}
              className="rounded-xl pl-8 pr-3 py-1.5 text-xs outline-none"
              style={{ width: 200, background: G.canvas, border: `1px solid ${G.border}` }} />
          </div>
          <select value={client} onChange={e => setClient(e.target.value)} className="rounded-xl px-2.5 py-1.5 text-xs"
            style={{ background: G.canvas, border: `1px solid ${G.border}` }}>
            <option value="all">All clients</option>
            {clients.map(c => <option key={c}>{c}</option>)}
          </select>
          <select value={category} onChange={e => setCategory(e.target.value)} className="rounded-xl px-2.5 py-1.5 text-xs"
            style={{ background: G.canvas, border: `1px solid ${G.border}` }}>
            <option value="all">All categories</option>
            {['GST', 'TDS', 'Audit', 'Legal', 'Financials', 'Notices'].map(c => <option key={c}>{c}</option>)}
          </select>
          {tab === 'received' && (
            <>
              <select value={fy} onChange={e => setFy(e.target.value)} className="rounded-xl px-2.5 py-1.5 text-xs"
                style={{ background: G.canvas, border: `1px solid ${G.border}` }}>
                <option value="all">All FY</option>
                <option>FY 2025-26</option>
                <option>FY 2024-25</option>
              </select>
              <select value={status} onChange={e => setStatus(e.target.value)} className="rounded-xl px-2.5 py-1.5 text-xs"
                style={{ background: G.canvas, border: `1px solid ${G.border}` }}>
                <option value="all">Verification</option>
                <option>Verified</option>
                <option>Pending review</option>
                <option>Missing items</option>
              </select>
            </>
          )}
          {tab === 'sent' && (
            <select value={status} onChange={e => setStatus(e.target.value)} className="rounded-xl px-2.5 py-1.5 text-xs"
              style={{ background: G.canvas, border: `1px solid ${G.border}` }}>
              <option value="all">Delivery status</option>
              <option>Demo — queued</option>
              <option>Demo — marked sent</option>
            </select>
          )}
          {tab === 'received' && selected.length > 0 && (
            <DarkBtn onClick={() => setShare({ ids: selected, client: '' })}>
              <Share2 className="h-3.5 w-3.5" />Share ({selected.length})
            </DarkBtn>
          )}
        </div>
      )}

      {tab === 'received' && (
        <ContentCard>
          <div className="p-4 overflow-x-auto">
            {received.length === 0 ? (
              <p className="text-sm text-center py-12" style={{ color: G.secondary }}>No received documents match the filters.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[10px] uppercase" style={{ color: G.secondary }}>
                    <th className="p-2" /><th className="p-2">Document</th><th className="p-2">Client</th><th className="p-2">Category</th>
                    <th className="p-2">Upload Date</th><th className="p-2">Financial Year</th><th className="p-2">Related Task</th>
                    <th className="p-2">Verification</th><th className="p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {received.map(d => (
                    <tr key={d.id} style={{ borderTop: `1px solid ${G.border}` }}>
                      <td className="p-2"><input type="checkbox" checked={selected.includes(d.id)} onChange={() => toggleSelect(d.id)} aria-label={`Select ${d.name}`} /></td>
                      <td className="p-2 font-semibold" style={{ color: G.primary }}>{d.name}</td>
                      <td className="p-2" style={{ color: G.secondary }}>{d.client}</td>
                      <td className="p-2">{d.category}</td>
                      <td className="p-2">{d.uploaded_at}</td>
                      <td className="p-2">{d.fy}</td>
                      <td className="p-2">{d.related}</td>
                      <td className="p-2"><StatusPill label={d.verification} tone={d.verification === 'Verified' ? 'ok' : 'warn'} /></td>
                      <td className="p-2">
                        <button type="button" className="text-xs font-semibold" style={{ color: '#3D6B5E' }}
                          onClick={() => setPreview({ title: d.name, body: `Preview of ${d.name}\nClient: ${d.client}\nLinked: ${d.related}` })}>
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </ContentCard>
      )}

      {tab === 'sent' && (
        <ContentCard>
          <div className="p-4 overflow-x-auto">
            <p className="text-[11px] mb-3" style={{ color: G.secondary }}>Delivery states are frontend demo values — not confirmed client receipt.</p>
            {sent.length === 0 ? (
              <p className="text-sm text-center py-12" style={{ color: G.secondary }}>No sent documents match the filters.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[10px] uppercase" style={{ color: G.secondary }}>
                    <th className="p-2">Document</th><th className="p-2">Client</th><th className="p-2">Category</th>
                    <th className="p-2">Sent Date</th><th className="p-2">Related Task</th><th className="p-2">Delivery</th><th className="p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sent.map(d => (
                    <tr key={d.id} style={{ borderTop: `1px solid ${G.border}` }}>
                      <td className="p-2 font-semibold" style={{ color: G.primary }}>{d.name}</td>
                      <td className="p-2">{d.client}</td>
                      <td className="p-2">{d.category}</td>
                      <td className="p-2">{d.sent_at}</td>
                      <td className="p-2">{d.related}</td>
                      <td className="p-2"><StatusPill label={d.delivery} tone="muted" /></td>
                      <td className="p-2">
                        <button type="button" className="text-xs font-semibold" style={{ color: '#3D6B5E' }}
                          onClick={() => setPreview({ title: d.name, demo: true, body: `Sharing details (frontend)\nClient: ${d.client}\nDate: ${d.sent_at}\nStatus: ${d.delivery}` })}>
                          History
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </ContentCard>
      )}

      {tab === 'checklists' && (
        <div className="grid lg:grid-cols-12 gap-4">
          <div className="lg:col-span-4 space-y-2">
            {checklists.map(cl => {
              const req = cl.items.filter(i => i.required)
              const done = req.filter(i => i.received).length
              const pct = req.length ? Math.round((done / req.length) * 100) : 0
              return (
                <button key={cl.id} type="button" onClick={() => setOpenCl(cl.id)}
                  className="w-full text-left rounded-2xl p-4"
                  style={{ background: G.white, border: `1.5px solid ${openCl === cl.id ? G.primary : G.border}` }}>
                  <p className="text-sm font-bold" style={{ color: G.primary }}>{cl.name}</p>
                  <p className="text-[11px]" style={{ color: G.secondary }}>{cl.client} · {cl.related}</p>
                  <p className="text-xs mt-2 font-semibold" style={{ color: G.primary }}>{done} of {req.length} required · {pct}%</p>
                  <div className="h-1.5 rounded-full mt-1" style={{ background: G.border }}>
                    <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, background: '#3D6B5E' }} />
                  </div>
                </button>
              )
            })}
          </div>
          <ContentCard className="lg:col-span-8">
            <div className="p-4">
              {!openChecklist ? <p className="text-sm" style={{ color: G.secondary }}>Select a checklist.</p> : (
                <>
                  <h3 className="text-sm font-bold mb-3" style={{ color: G.primary }}>{openChecklist.name}</h3>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-[10px] uppercase" style={{ color: G.secondary }}>
                        <th className="p-2">Document</th><th className="p-2">Required</th><th className="p-2">Status</th><th className="p-2">Reference</th>
                      </tr>
                    </thead>
                    <tbody>
                      {openChecklist.items.map((it, idx) => (
                        <tr key={it.name} style={{ borderTop: `1px solid ${G.border}` }}>
                          <td className="p-2">{it.name}</td>
                          <td className="p-2">{it.required ? 'Required' : 'Optional'}</td>
                          <td className="p-2">
                            <button type="button" className="text-xs font-semibold"
                              style={{ color: it.received ? '#047857' : '#B45309' }}
                              onClick={() => {
                                setChecklists(list => list.map(c => c.id !== openChecklist.id ? c : {
                                  ...c,
                                  items: c.items.map((x, i) => i === idx ? { ...x, received: !x.received, ref: x.received ? undefined : (x.ref ?? 'Associated in UI') } : x),
                                }))
                              }}>
                              {it.received ? 'Received' : 'Missing'}
                            </button>
                          </td>
                          <td className="p-2" style={{ color: G.secondary }}>{it.ref ?? '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}
            </div>
          </ContentCard>
        </div>
      )}

      {tab === 'templates' && (
        <div className="grid md:grid-cols-2 gap-3">
          {MOCK_DOC_TEMPLATES.map(t => (
            <ContentCard key={t.id}>
              <div className="p-4">
                <div className="flex items-start gap-2">
                  <FileText className="h-4 w-4 mt-0.5" style={{ color: G.icon }} />
                  <div>
                    <p className="text-sm font-bold" style={{ color: G.primary }}>{t.name}</p>
                    <p className="text-[10px] font-semibold" style={{ color: G.secondary }}>{t.category}</p>
                    <p className="text-xs mt-1" style={{ color: G.secondary }}>{t.description}</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <OutlineBtn onClick={() => setPreview({ title: t.name, demo: true, body: `Preview — ${t.name}\n\n${t.description}\n\n[Sample body for internal use. Not a filed statutory form.]` })}>
                    <Eye className="h-3.5 w-3.5" />Preview
                  </OutlineBtn>
                  <DarkBtn onClick={() => { if (!generating) generateTemplate(t.id, t.name) }}>
                    <Sparkles className="h-3.5 w-3.5" />{generating === t.id ? 'Generating…' : 'Generate Document'}
                  </DarkBtn>
                </div>
              </div>
            </ContentCard>
          ))}
        </div>
      )}

      {share && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(43,47,51,0.4)' }}
          onClick={e => { if (e.target === e.currentTarget) setShare(null) }}>
          <div className="w-full max-w-md rounded-2xl bg-white p-5" style={{ border: `1px solid ${G.border}` }}>
            <h3 className="text-sm font-bold mb-2" style={{ color: G.primary }}>Share with client (demo)</h3>
            <p className="text-xs mb-3" style={{ color: G.secondary }}>No email or portal delivery is performed.</p>
            <p className="text-xs font-semibold mb-2">{share.ids.length} document(s) selected</p>
            <select value={share.client} onChange={e => setShare({ ...share, client: e.target.value })}
              className="w-full rounded-xl px-3 py-2 text-sm mb-3" style={{ border: `1px solid ${G.border}` }}>
              <option value="">Select client…</option>
              {clients.map(c => <option key={c}>{c}</option>)}
            </select>
            <div className="flex gap-2">
              <OutlineBtn onClick={() => setShare(null)}>Cancel</OutlineBtn>
              <DarkBtn onClick={() => { if (share.client) confirmShare() }}><CheckCircle2 className="h-3.5 w-3.5" />Confirm share</DarkBtn>
            </div>
          </div>
        </div>
      )}

      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(43,47,51,0.4)' }}
          onClick={e => { if (e.target === e.currentTarget) setPreview(null) }}>
          <div className="w-full max-w-lg rounded-2xl bg-white p-5" style={{ border: `1px solid ${G.border}` }}>
            <h3 className="text-sm font-bold mb-2" style={{ color: G.primary }}>{preview.title}</h3>
            {preview.demo && <p className="text-[10px] font-bold mb-2" style={{ color: '#B45309' }}>FRONTEND DEMO — not stored</p>}
            <pre className="text-xs whitespace-pre-wrap rounded-xl p-3 mb-3" style={{ background: G.canvas, color: G.secondary }}>{preview.body}</pre>
            <OutlineBtn onClick={() => setPreview(null)}>Close</OutlineBtn>
          </div>
        </div>
      )}
    </div>
  )
}
