const fs = require('fs')
const lines = fs.readFileSync(
  'C:/Users/ACER/.cursor/projects/c-Users-ACER-Documents-auditlens/agent-transcripts/19d36180-6492-4550-adaa-10101b777b14/19d36180-6492-4550-adaa-10101b777b14.jsonl',
  'utf8'
).split('\n')

const ops = []
for (let idx = 1365; idx <= 1410; idx++) {
  let j
  try { j = JSON.parse(lines[idx]) } catch { continue }
  for (const c of j.message?.content ?? []) {
    if (c.name !== 'StrReplace') continue
    const p = (c.input?.path ?? '').replace(/\\/g, '/')
    if (!p.includes('WorkCenterPage')) continue
    if (c.input.new_string.length > 800) {
      fs.writeFileSync(`${__dirname}/wc-new-${idx}-${ops.length}.txt`, c.input.new_string)
      console.log('wc', idx, c.input.new_string.length)
    }
    ops.push(c.input)
  }
}

for (let idx = 1392; idx <= 1410; idx++) {
  let j
  try { j = JSON.parse(lines[idx]) } catch { continue }
  for (const c of j.message?.content ?? []) {
    if (c.name !== 'StrReplace') continue
    const p = (c.input?.path ?? '').replace(/\\/g, '/')
    if (!p.includes('ClientOnboardPage')) continue
    if (c.input.new_string.length > 500) {
      fs.writeFileSync(`${__dirname}/onboard-new-${idx}-${ops.length}.txt`, c.input.new_string)
      console.log('onboard', idx, c.input.new_string.length)
    }
  }
}
