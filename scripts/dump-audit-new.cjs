const fs = require('fs')
const ops = require('./audit-ops.json')
ops.forEach((op, i) => {
  if (op.new.length > 500) {
    fs.writeFileSync(`${__dirname}/audit-new-${i}.txt`, op.new)
    console.log(i, op.new.length, 'bytes')
  }
})
