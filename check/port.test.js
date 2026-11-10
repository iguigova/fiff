// Where the C# original's answer passes every check, the JS port gives the
// same answer.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cases } from './cases.js';
import { parse } from './parse.js';
import { checks } from './check.js';
import { args, load, recorded } from './judge.js';
import { run } from '../src/cli.js';

const passes = r => Object.values(checks(r)).every(check => check(r).length === 0);

cases
  .map((c, i) => ({ c, i, record: recorded(c, i) }))
  .filter(({ c, record }) => passes(load(c, record)))
  .forEach(({ c, i, record }) => test(`js ${i} ${c.name}: the answer of the C# original, which passes`, () =>
    assert.deepEqual(parse(run(args(c))), parse(record))));
