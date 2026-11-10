// Loads one implementation's output for each case and registers a test per
// check: `judge(label, outputOf)`, where outputOf(case, index) is the text the
// implementation printed in the sentinel format.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { cases } from './cases.js';
import { parse, SENTINEL_FORMAT } from './parse.js';
import { checks } from './check.js';

const FILES = new URL('../original/test/', import.meta.url);

export const path = file => fileURLToPath(new URL(file, FILES));

// The command-line arguments of a case, as both implementations take them.
export const args = c => [path(c.file1), path(c.file2), String(c.delimiter), String(c.ordered), String(c.buffer), SENTINEL_FORMAT];

export const recorded = (c, i) => readFileSync(new URL(`../record/csharp/${i}.out`, import.meta.url), 'utf8');

const load = (c, output) => ({ ...c, ...parse(output), bytes1: readFileSync(path(c.file1)), bytes2: readFileSync(path(c.file2)) });

export const judge = (label, outputOf) => cases.forEach((c, i) => {
  const run = load(c, outputOf(c, i));
  Object.entries(checks(run)).forEach(([name, check]) =>
    test(`${label} ${i} ${c.name}: ${name}`, () => assert.deepEqual(check(run), [])));
});
