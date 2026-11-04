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

const latest = new Map()
const lines = fs.readFileSync(TRANSCRIPT, 'utf8').split('\n')

lines.forEach((line, idx) => {
  if (!line.includes('auditlens')) return
  let j
  try {
    j = JSON.parse(line)
  } catch {
    return
  }
  const content = j.message?.content
  if (!Array.isArray(content)) return
  for (const c of content) {
    if (c.name !== 'Write') continue
    const input = c.input
    if (!input?.path || !input?.contents || input.contents.length < 50) continue
    const rel = normalizeRel(input.path)
    if (!rel) continue
    const prev = latest.get(rel)
    if (!prev || idx > prev.line) {
      latest.set(rel, { line: idx, contents: input.contents })
    }
  }
})

console.log(`Found ${latest.size} file snapshots`)

let restored = 0
for (const [rel, { line, contents }] of [...latest.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
  const out = path.join(ROOT, rel)
  fs.mkdirSync(path.dirname(out), { recursive: true })
  fs.writeFileSync(out, contents, 'utf8')
  restored++
  if (rel.includes('frontend/src/features') || rel.includes('frontend/src/layouts') || rel.includes('frontend/src/app')) {
    console.log(`  [${line}] ${rel} (${contents.length}b)`)
  }
}
console.log(`Restored ${restored} files to ${ROOT}`)
