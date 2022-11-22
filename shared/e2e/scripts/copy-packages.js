#!/usr/bin/env node

const fs = require('fs');

const packages = fs.readdirSync('../../packages');

for (const pkg of packages) {
  const files = fs.readdirSync(`../../packages/${pkg}/src`);

  for (const file of files) {
    if (!fs.existsSync(`./packages/${pkg}/src`)) fs.mkdirSync(`./packages/${pkg}/src`, { recursive: true });

    fs.copyFileSync(`../../packages/${pkg}/src/${file}`, `./packages/${pkg}/src/${file}`);
  }
}

console.log('\x1b[0;32m', 'Packages successfully copied before instrumentation.', '\x1b[0m');
