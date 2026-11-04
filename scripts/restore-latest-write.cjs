const fs = require('fs')
const path = require('path')

const TRANSCRIPT =
  'C:/Users/ACER/.cursor/projects/c-Users-ACER-Documents-auditlens/agent-transcripts/19d36180-6492-4550-adaa-10101b777b14/19d36180-6492-4550-adaa-10101b777b14.jsonl'
const ROOT = 'E:/OFFICE_PROJECTS/auditlens'
const TARGET = process.argv[2] || 'AuditPage'

function normalizeRel(p) {
  const norm = p.replace(/\\/g, '/')
  const m = norm.match(/(?:auditlens\/)(.+)$/i)
  return m ? m[1] : null
}

const lines = fs.readFileSync(TRANSCRIPT, 'utf8').split('\n')
let best = null

lines.forEach((line, idx) => {
  if (!line.includes(TARGET)) return
  let j
  try {
    j = JSON.parse(line)
  } catch {
    return
  }
  for (const c of j.message?.content ?? []) {
    if (c.name !== 'Write') continue
    const rel = normalizeRel(c.input?.path ?? '')
    if (!rel || !rel.includes(TARGET)) continue
    if (!best || idx > best.line) best = { line: idx, rel, contents: c.input.contents }
  }
})

if (!best) {
  console.log('No Write found for', TARGET)
  process.exit(1)
}

const out = path.join(ROOT, best.rel)
fs.writeFileSync(out, best.contents, 'utf8')
console.log(`Restored [${best.line}] ${best.rel} (${best.contents.length} bytes)`)
