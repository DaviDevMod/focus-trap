#!/usr/bin/env node

// @ts-check

const fs = require('fs');

const coverage = require('../coverage/coverage-final.json');

// const coveragePieces: { [packageName: string]: string[] } = {};
const coveragePieces = {};

for (const filePath in coverage) {
  const packageName = filePath.match(/\/packages\/(.+)\/src\//)?.[1];

  if (packageName) {
    if (coveragePieces[packageName]) coveragePieces[packageName][filePath] = coverage[filePath];
    else coveragePieces[packageName] = { [filePath]: coverage[filePath] };
  } else throw new Error(`There's something wrong with '${__dirname}/../coverage/coverage-final.json'`);
}

for (const packageName in coveragePieces) {
  if (!fs.existsSync(`./coverage/${packageName}`)) fs.mkdirSync(`./coverage/${packageName}`, { recursive: true });

  fs.writeFileSync(`./coverage/${packageName}/coverage-final.json`, JSON.stringify(coveragePieces[packageName]));
}

console.log('\x1b[0;32m', 'Coverage successfully split.', '\x1b[0m');
