const fs = require('fs')
const path = require('path')

const WC = path.join(__dirname, '..', 'src', 'features', 'workcenter', 'WorkCenterPage.tsx')
const FULL = fs.readFileSync(path.join(__dirname, 'wc-create-full.txt'), 'utf8')

let c = fs.readFileSync(WC, 'utf8')

c = c.replace(
  /const MOCK_CLIENTS = \[[\s\S]*?\]\nconst MOCK_TEAM/,
  `const MOCK_CLIENTS = [
  { id: 'c1', name: 'Sunrise Textiles', gstins: ['27AABCS1429B1ZB', '27AABCS1429B1ZC'], tan: 'MUMS12345A', gst_enabled: true, tds_enabled: true, audit_enabled: true },
  { id: 'c2', name: 'BlueSky Software', gstins: ['29AADCB2230M1ZV'], tan: 'BLRS67890B', gst_enabled: true, tds_enabled: false, audit_enabled: false },
  { id: 'c3', name: 'Redwood Constructions', gstins: ['07AAECR1234F1ZQ'], tan: 'DELS11223C', gst_enabled: true, tds_enabled: true, audit_enabled: false },
  { id: 'c4', name: 'Apex Auto Parts', gstins: ['08AAAPA1234A1ZT'], tan: 'JAIS44556D', gst_enabled: false, tds_enabled: true, audit_enabled: true },
  { id: 'c5', name: 'Green Pharma', gstins: ['24AABCG9988P1Z3'], tan: 'AHMS77889E', gst_enabled: true, tds_enabled: false, audit_enabled: true },
]
const MOCK_TEAM`
)

const start = c.indexOf('// ─── Create Work Item Modal')
const end = c.indexOf('\n// ─── Ops Panel', start)
if (start < 0 || end < 0) {
  console.error('Create modal section not found', start, end)
  process.exit(1)
}

c = c.slice(0, start) + FULL.trim() + '\n\n' + c.slice(end + 1)
fs.writeFileSync(WC, c)
console.log('Applied eligible-modules task wizard')
