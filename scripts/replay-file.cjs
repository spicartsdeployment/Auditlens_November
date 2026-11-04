const fs = require('fs')
const path = require('path')

const TRANSCRIPT =
  'C:/Users/ACER/.cursor/projects/c-Users-ACER-Documents-auditlens/agent-transcripts/19d36180-6492-4550-adaa-10101b777b14/19d36180-6492-4550-adaa-10101b777b14.jsonl'
const ROOT = 'E:/OFFICE_PROJECTS/auditlens'
const REL = process.argv[2]
const MIN_LINE = Number(process.argv[3] || 0)

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
  try { j = JSON.parse(line) } catch { return }
  for (const c of j.message?.content ?? []) {
    if (c.name !== 'StrReplace') continue
    const rel = normalizeRel(c.input?.path ?? '')
    if (rel !== REL) continue
    ops.push({ line: idx, old_string: c.input.old_string, new_string: c.input.new_string })
  }
})

const full = path.join(ROOT, REL)
let text = fs.readFileSync(full, 'utf8')
let applied = 0, skipped = 0
for (const op of ops) {
  if (text.includes(op.old_string)) {
    text = text.replace(op.old_string, op.new_string)
    applied++
  } else skipped++
}
fs.writeFileSync(full, text, 'utf8')
console.log(`${REL}: applied ${applied}, skipped ${skipped} (${ops.length} ops from line ${MIN_LINE})`)
