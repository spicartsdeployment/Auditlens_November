/**
 * Restore Work Center: Saturday backup + Jun 30 morning deltas
 */
const fs = require('fs')
const path = require('path')

const SAT = 'C:\\Users\\ACER\\Downloads\\src\\src\\features\\workcenter\\WorkCenterPage.tsx'
const OUT = path.join(__dirname, '..', 'src', 'features', 'workcenter', 'WorkCenterPage.tsx')
const WC_NEW = path.join(__dirname, 'wc-1156-new.txt')

let content = fs.readFileSync(SAT, 'utf8')

const wcNew = fs.readFileSync(WC_NEW, 'utf8')
  .replace(/G\.accent/g, "'#0584C7'")
  .replace(/G\.muted/g, 'G.icon')

// Replace 2-step CreateModal with 3-step wizard + GST auto due
content = content.replace(
  /function CreateModal\([\s\S]*?\n\}\n\n\/\/ ─── Ops Panel/,
  `${wcNew}\n\n// ─── Ops Panel`
)

// Remove Assigned By column from WorkRow
content = content.replace(
  /\n      \{\/\* Assigned By \(admin only\) \*\/\}\n      \{showAssignedBy && \(\n        <td className="px-3 py-2\.5 hidden lg:table-cell" style=\{\{ maxWidth: 110 \}\}>\n          <span className="text-xs truncate block" title=\{item\.assigned_by\}\n            style=\{\{ color: G\.secondary, maxWidth: 100 \}\}>\{item\.assigned_by\}<\/span>\n        <\/td>\n      \)\}/,
  ''
)

// Simplify WorkRow — drop showAssignedBy prop
content = content.replace(
  /function WorkRow\(\{ item, onClick, showAssignedBy \}/,
  'function WorkRow({ item, onClick }'
)
content = content.replace(
  /showAssignedBy\?: boolean \}\) \{\n  const typeCfg/,
  '}) {\n  const typeCfg'
)

// Simplify WorkListView — drop Assigned By column
content = content.replace(
  /function WorkListView\(\{ items, onItemClick, showAssignedBy \}: \{\n  items: WorkItem\[\]; onItemClick: \(i: WorkItem\) => void; showAssignedBy\?: boolean\n\}/,
  'function WorkListView({ items, onItemClick }: {\n  items: WorkItem[]; onItemClick: (i: WorkItem) => void\n}'
)
content = content.replace(
  /\{showAssignedBy && <col className="hidden lg:table-column" style=\{\{ width: '10%' \}\} \/> \}\n/,
  ''
)
content = content.replace(
  /\.\.\.\(showAssignedBy \? \[\{ label: 'Assigned By', className: 'hidden lg:table-cell' \}\] : \[\]\),\n/,
  ''
)
content = content.replace(
  /<WorkRow key=\{item\.id\} item=\{item\} onClick=\{\(\) => onItemClick\(item\)\} showAssignedBy=\{showAssignedBy\} \/>/,
  '<WorkRow key={item.id} item={item} onClick={() => onItemClick(item)} />'
)

// Simplify BoardColumn — drop showAssignedBy / assignedBy on cards
content = content.replace(
  /function BoardColumn\(\{ queueId, items, onCardClick, showAssignedBy \}: \{\n  queueId: QueueId; items: WorkItem\[\]; onCardClick: \(item: WorkItem\) => void; showAssignedBy\?: boolean\n\}/,
  'function BoardColumn({ queueId, items, onCardClick }: {\n  queueId: QueueId; items: WorkItem[]; onCardClick: (item: WorkItem) => void\n}'
)
content = content.replace(
  /<WorkCard key=\{item\.id\} item=\{item\} onClick=\{\(\) => onCardClick\(item\)\} assignedBy=\{showAssignedBy \? item\.assigned_by : undefined\} \/>/,
  '<WorkCard key={item.id} item={item} onClick={() => onCardClick(item)} />'
)

// Remove insights toggle button
content = content.replace(
  /\n            \{\/\* Dashboard toggle button \*\/\}\n            <button onClick=\{\(\) => setShowDashboard\(v => !v\)\}[\s\S]*?\{articleView \? 'My Dashboard' : 'Insights'\}\n            <\/button>\n/,
  '\n'
)

// Remove insights right panel
content = content.replace(
  /\n      \{\/\* ── Right: Dashboard Panel \(conditionally shown\) ──────────── \*\/\}\n      \{showDashboard && \([\s\S]*?\)\}\n/,
  '\n'
)

// Remove showDashboard state
content = content.replace(/\n  const \[showDashboard, setShowDashboard\] = useState\(false\)/, '')

// Add filter state after filterStatus
content = content.replace(
  /const \[filterStatus, setFilterStatus\] = useState<QueueId \| 'all'>\('all'\)/,
  `const [filterStatus, setFilterStatus] = useState<QueueId | 'all'>('all')
  const [filterAssignedTo, setFilterAssignedTo] = useState<string>('all')
  const [filterCompany, setFilterCompany] = useState<string>('all')`
)

// Add filter logic
content = content.replace(
  /if \(filterStatus !== 'all'\) items = items\.filter\(i => i\.queue === filterStatus\)\n    return items\n  \}, \[workItems, search, filterType, filterPriority, filterStatus, currentUser\?\.full_name, articleView\]\)/,
  `if (filterStatus !== 'all') items = items.filter(i => i.queue === filterStatus)
    if (filterAssignedTo !== 'all') items = items.filter(i => i.assigned_to === filterAssignedTo)
    if (filterCompany !== 'all') items = items.filter(i => i.client === filterCompany)
    return items
  }, [workItems, search, filterType, filterPriority, filterStatus, filterAssignedTo, filterCompany, currentUser?.full_name, articleView])`
)

// Add filter dropdowns before flex-1 spacer in header
const filterDropdowns = `
            {/* Company filter */}
            <div className="relative shrink-0">
              <select value={filterCompany} onChange={e => setFilterCompany(e.target.value)}
                className="appearance-none pl-3 pr-7 py-[7px] rounded-xl text-xs font-semibold outline-none cursor-pointer"
                style={{ background: G.canvas, border: \`1px solid \${G.border}\`, color: G.secondary }}>
                <option value="all">All Companies</option>
                {Array.from(new Set(workItems.map(i => i.client).filter(Boolean))).sort().map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3" style={{ color: G.icon }} />
            </div>

            {/* Assigned To filter */}
            <div className="relative shrink-0">
              <select value={filterAssignedTo} onChange={e => setFilterAssignedTo(e.target.value)}
                className="appearance-none pl-3 pr-7 py-[7px] rounded-xl text-xs font-semibold outline-none cursor-pointer"
                style={{ background: G.canvas, border: \`1px solid \${G.border}\`, color: G.secondary }}>
                <option value="all">Assigned To</option>
                {Array.from(new Set(workItems.map(i => i.assigned_to).filter(Boolean))).sort().map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3" style={{ color: G.icon }} />
            </div>
`

content = content.replace(
  /(\{\/\* NEW: Status filter[\s\S]*?<\/div>\n)\n            <div className="flex-1" \/>/,
  `$1${filterDropdowns}\n            <div className="flex-1" />`
)

// Remove showAssignedBy from view usages
content = content.replace(/showAssignedBy=\{!articleView\}\n/g, '')
content = content.replace(/showAssignedBy=\{false\} /g, '')
content = content.replace(/showAssignedBy=\{true\} /g, '')

// Clean unused imports
content = content.replace(
  /  TrendingUp, BarChart2, ChevronDown/,
  '  TrendingUp, ChevronDown'
)
content = content.replace(
  /  ChevronRight, Lock, LayoutGrid, List, PanelRightOpen, PanelRightClose,/,
  '  ChevronRight, Lock, LayoutGrid, List,'
)

// Update CreateModal comment
content = content.replace(
  '// ─── Create Work Item Modal (unchanged) ────────────────────────────────────────',
  '// ─── Create Work Item Modal (3-step wizard) ───────────────────────────────────'
)

fs.writeFileSync(OUT, content, 'utf8')
console.log('Patched WorkCenterPage.tsx:', OUT.length, 'bytes')
