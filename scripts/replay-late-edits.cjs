const fs = require('fs')
const path = require('path')

const TRANSCRIPT =
  'C:/Users/ACER/.cursor/projects/c-Users-ACER-Documents-auditlens/agent-transcripts/19d36180-6492-4550-adaa-10101b777b14/19d36180-6492-4550-adaa-10101b777b14.jsonl'
const SRC = 'E:/OFFICE_PROJECTS/auditlens/frontend/src'
const lines = fs.readFileSync(TRANSCRIPT, 'utf8').split('\n')

// Clean AuditPage baseline
const write686 = JSON.parse(lines[686])
fs.writeFileSync(
  path.join(SRC, 'features/audit/AuditPage.tsx'),
  write686.message.content.find((c) => c.name === 'Write').input.contents
)

function findFile(basename) {
  const hits = []
  function walk(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name)
      if (e.isDirectory()) walk(p)
      else if (e.name === basename) hits.push(p)
    }
  }
  walk(SRC)
  return hits[0]
}

function replay(basename, minLine) {
  const full = findFile(basename)
  if (!full) {
    console.log('NOT FOUND', basename)
    return
  }
  let text = fs.readFileSync(full, 'utf8')
  const ops = []
  lines.forEach((line, idx) => {
    if (idx < minLine || !line.includes(basename)) return
    try {
      const j = JSON.parse(line)
      for (const c of j.message?.content || []) {
        if (c.name === 'StrReplace' && c.input?.path?.includes(basename)) {
          ops.push({ line: idx, old: c.input.old_string, neu: c.input.new_string })
        }
      }
    } catch {}
  })
  let ok = 0
  let skip = 0
  for (const op of ops) {
    if (text.includes(op.old)) {
      text = text.replace(op.old, op.neu)
      ok++
    } else skip++
  }
  fs.writeFileSync(full, text)
  console.log(`${basename}: ${ops.length} ops, ${ok} applied, ${skip} skipped`)
}

;[
  ['ClientsPage.tsx', 1333],
  ['ClientOnboardPage.tsx', 1392],
  ['CommunicationPage.tsx', 1460],
  ['WorkCenterPage.tsx', 1360],
  ['DocumentsPage.tsx', 1400],
  ['AuditPage.tsx', 1344],
].forEach(([f, n]) => replay(f, n))
