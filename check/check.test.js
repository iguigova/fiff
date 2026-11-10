// Runs every check on every case, against the outputs one implementation wrote
// to FIFF_OUT, one <case index>.out per case.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { cases } from './cases.js';
import { parse } from './parse.js';
import { checks } from './check.js';

const OUT = process.env.FIFF_OUT;
const FILES = process.env.FIFF_FILES;

const load = (c, i) => ({
  ...c,
  ...parse(readFileSync(join(OUT, `${i}.out`), 'utf8')),
  bytes1: readFileSync(join(FILES, c.file1)),
  bytes2: readFileSync(join(FILES, c.file2)),
});

cases.forEach((c, i) => {
  const run = load(c, i);
  Object.entries(checks(run)).forEach(([label, check]) =>
    test(`${i} ${c.name}: ${label}`, () => assert.deepEqual(check(run), [])));
});
