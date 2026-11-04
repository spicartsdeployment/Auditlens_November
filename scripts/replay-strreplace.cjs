const fs = require('fs')
const path = require('path')

const TRANSCRIPT =
  'C:/Users/ACER/.cursor/projects/c-Users-ACER-Documents-auditlens/agent-transcripts/19d36180-6492-4550-adaa-10101b777b14/19d36180-6492-4550-adaa-10101b777b14.jsonl'
const ROOT = 'E:/OFFICE_PROJECTS/auditlens'

function normalizeRel(p) {
  const norm = p.replace(/\\/g, '/')
  const m = norm.match(/(?:auditlens\/)(.+)$/i)
  return m ? m[1] : null
}

const lines = fs.readFileSync(TRANSCRIPT, 'utf8').split('\n')
const ops = []

lines.forEach((line, idx) => {
  if (!line.includes('StrReplace')) return
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
    if (!rel || !rel.startsWith('frontend/')) continue
    ops.push({ line: idx, rel, old_string: input.old_string, new_string: input.new_string })
  }
})

console.log(`Found ${ops.length} StrReplace operations`)

const byFile = new Map()
for (const op of ops) {
  if (!byFile.has(op.rel)) byFile.set(op.rel, [])
  byFile.get(op.rel).push(op)
}

let applied = 0
let skipped = 0
let missing = 0

for (const [rel, fileOps] of byFile.entries()) {
  const full = path.join(ROOT, rel)
  if (!fs.existsSync(full)) {
    missing++
    continue
  }
  let text = fs.readFileSync(full, 'utf8')
  fileOps.sort((a, b) => a.line - b.line)
  for (const op of fileOps) {
    if (text.includes(op.old_string)) {
      text = text.replace(op.old_string, op.new_string)
      applied++
    } else {
      skipped++
    }
  }
  fs.writeFileSync(full, text, 'utf8')
}

console.log(`Applied ${applied} replacements, skipped ${skipped} (old_string not found), ${missing} files missing`)
console.log('Files touched:', byFile.size)
