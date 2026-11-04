const fs = require('fs')
const path = 'E:/OFFICE_PROJECTS/auditlens/frontend/src/features/audit/AuditPage.tsx'
let text = fs.readFileSync(path, 'utf8')

// Fix RightPanel corruption
text = text.replace(
  /(\s+<\/div>\s+<\/div>\s+)<\/>\s+\)\}\s+(\s+<\/div>\s+\n\s+\)\s+\n\}\s+\n\/\/ ─── Main Page)/,
  '$1$2'
)

// Imports
if (!text.includes('Settings')) {
  text = text.replace(
    'ClipboardList, Star, Zap\n} from \'lucide-react\'',
    "ClipboardList, Star, Zap, Settings, ArrowLeft\n} from 'lucide-react'"
  )
}

const selectionBlock = fs.readFileSync(__dirname + '/audit-new-1.txt', 'utf8').trim()
if (!text.includes('function AuditTypeSelection')) {
  text = text.replace(
    '// ─── Main Page ───────────────────────────────────────────────────────────────',
    selectionBlock + '\n\n// ─── Main Page ───────────────────────────────────────────────────────────────'
  )
}

// State + handlers in export function
text = text.replace(
`export function AuditPage() {
  const [selectedId, setSelectedId] = useState(1)
  const [expandedStage, setExpandedStage] = useState<StageId | null>('planning')
  const [showEngSearch, setShowEngSearch] = useState(false)

  const eng = ENGAGEMENTS.find`,
`export function AuditPage() {
  const [hasSelectedType, setHasSelectedType] = useState(false)
  const [selectedId, setSelectedId] = useState(1)
  const [expandedStage, setExpandedStage] = useState<StageId | null>('planning')
  const [showEngSearch, setShowEngSearch] = useState(false)
  const [auditType, setAuditType] = useState('Statutory Audit')
  const [visibleAuditTypes, setVisibleAuditTypes] = useState<Set<string>>(() => new Set(AUDIT_TYPES))
  const [showTypeSettings, setShowTypeSettings] = useState(false)

  function toggleAuditTypeVisibility(t: string) {
    setVisibleAuditTypes(prev => {
      const next = new Set(prev)
      if (next.has(t)) { if (next.size > 1) next.delete(t) } else next.add(t)
      return next
    })
  }

  function selectAuditType(t: string) {
    setAuditType(t)
    const matching = ENGAGEMENTS.find(e => e.type === t || (t === 'Tax Audit (u/s 44AB)' && e.type === 'Tax Audit'))
    if (matching) setSelectedId(matching.id)
    setHasSelectedType(true)
    setShowTypeSettings(false)
    setExpandedStage('planning')
  }

  function backToAuditTypes() {
    setHasSelectedType(false)
    setShowTypeSettings(false)
    setShowEngSearch(false)
  }

  const eng = ENGAGEMENTS.find`
)

const returnWrap = fs.readFileSync(__dirname + '/audit-new-6.txt', 'utf8').trim()

text = text.replace(
`  return (
    <div className="p-3 md:p-4 max-w-[1600px] mx-auto" style={{ background: G.canvas }}>

      {/* ── Engagement Header ──────────────────────────────────────────────── */}`,
  returnWrap + '\n\n      {/* ── Engagement Header ──────────────────────────────────────────────── */}'
)

// Close conditional before final page div
text = text.replace(
`      </div>
    </div>
  )
}
`,
`      </div>
        </>
      )}
    </div>
  )
}
`
)

fs.writeFileSync(path, text)
console.log('Patched AuditPage')
