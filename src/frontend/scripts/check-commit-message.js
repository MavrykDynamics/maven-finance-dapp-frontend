const fs = require('fs')
const path = require('path')
const { spawnSync } = require('child_process')

const p = path.join(__dirname, '../../../')
const msg = fs.readFileSync(p, { encoding: 'utf8' })

const taskReg = /^((MEG-[0-9]+)|(MEGAPP-[0-9]+))/
const reg = /^(MEG-[0-9]+)|(MEGAPP-[0-9]+)|Merge/

const status = spawnSync('gtm', ['status', '--total-only'])
const time = status.stdout.toString()
const error = status.stderr.toString()

if (error || time.includes('Git Time Metric is not initialized')) {
  console.log('Please make sure that you already install gtm', error)
  process.exit(1)
}

if (msg.includes('#time')) {
  process.exit(0)
}

const timeWithoutSeconds = time.replace(/([0-9]{1,2}[hm])?([0-9]{1,2}s)?/g, '$1 ')

fs.writeFileSync(p, msg.replace(taskReg, `$1 #time ${timeWithoutSeconds}`))

if (reg.test(msg)) {
  process.exit(0)
}

console.log(`Bad commit message, see example: MAV-123 commit message \n Current message: ${msg}`)

process.exit(1)
