const { spawnSync } = require('child_process');

console.log('RUN Post commit hook');

const status = spawnSync('gtm', ['commit', '-yes']);
const commitResult = status.stdout.toString();
const error = status.stderr.toString();

console.log('RUN Post commit hook');

if (error) {
  console.log(`GTM can't commit your work: ${error}`);
  process.exit(1);
}

console.log(`Results: ${commitResult}`);
