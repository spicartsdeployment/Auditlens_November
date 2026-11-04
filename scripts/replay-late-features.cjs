const fs = require('fs')
const path = require('path')

const TRANSCRIPT =
  'C:/Users/ACER/.cursor/projects/c-Users-ACER-Documents-auditlens/agent-transcripts/19d36180-6492-4550-adaa-10101b777b14/19d36180-6492-4550-adaa-10101b777b14.jsonl'
const ROOT = 'E:/OFFICE_PROJECTS/auditlens'
const MIN_LINE = 1330
const TARGET_FILES = new Set([
  'frontend/src/features/clients/ClientsPage.tsx',
  'frontend/src/features/audit/AuditPage.tsx',
  'frontend/src/features/workcenter/WorkCenterPage.tsx',
  'frontend/src/features/clients/ClientOnboardPage.tsx',
])

function normalizeRel(p) {
  const norm = p.replace(/\\/g, '/')
  const m = norm.match(/(?:auditlens\/)(.+)$/i)
  return m ? m[1] : null
}

const lines = fs.readFileSync(TRANSCRIPT, 'utf8').split('\n')
const ops = []

lines.forEach((line, idx) => {
  if (idx < MIN_LINE || !line.includes('StrReplace')) return
  let j
  try {
    j = JSON.parse(line)
  } catch {
    return
  }
  const content = j.message?.content
  if (!Array.isArray(content)) return
  for (const c of content) {
    if (c.name !== 'StrReplace') continue
    const input = c.input
    if (!input?.path || input.new_string === undefined || input.old_string === undefined) continue
    const rel = normalizeRel(input.path)
    if (!rel || !TARGET_FILES.has(rel)) continue
    ops.push({ line: idx, rel, old_string: input.old_string, new_string: input.new_string })
  }
})

console.log(`Found ${ops.length} late StrReplace ops for target files`)

const byFile = new Map()
for (const op of ops) {
  if (!byFile.has(op.rel)) byFile.set(op.rel, [])
  byFile.get(op.rel).push(op)
}

let applied = 0
let skipped = 0

for (const [rel, fileOps] of byFile.entries()) {
  const full = path.join(ROOT, rel)
  if (!fs.existsSync(full)) {
    console.log(`MISSING: ${rel}`)
    continue
  }
  let text = fs.readFileSync(full, 'utf8')
  fileOps.sort((a, b) => a.line - b.line)
  for (const op of fileOps) {
    if (text.includes(op.old_string)) {
      text = text.replace(op.old_string, op.new_string)
      applied++
      console.log(`  [${op.line}] applied ${rel}`)
    } else {
      skipped++
      console.log(`  [${op.line}] SKIP ${rel} (${op.old_string.slice(0, 60).replace(/\n/g, ' ')}...)`)
    }
  }
  fs.writeFileSync(full, text, 'utf8')
}

console.log(`Done: applied ${applied}, skipped ${skipped}`)
