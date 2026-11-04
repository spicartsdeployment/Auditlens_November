const fs = require('fs')
const lines = fs.readFileSync(
  'C:/Users/ACER/.cursor/projects/c-Users-ACER-Documents-auditlens/agent-transcripts/19d36180-6492-4550-adaa-10101b777b14/19d36180-6492-4550-adaa-10101b777b14.jsonl',
  'utf8'
).split('\n')

const out = []
for (let idx = 1343; idx <= 1356; idx++) {
  let j
  try { j = JSON.parse(lines[idx]) } catch { continue }
  for (const c of j.message?.content ?? []) {
    if (c.name !== 'StrReplace' || !c.input?.path?.includes('AuditPage')) continue
    out.push({ line: idx, old: c.input.old_string, new: c.input.new_string })
  }
}
fs.writeFileSync('E:/OFFICE_PROJECTS/auditlens/frontend/scripts/audit-ops.json', JSON.stringify(out, null, 2))
console.log('Wrote', out.length, 'ops')
