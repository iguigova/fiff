// The JS port's answers are correct, in ordered mode never larger than the
// C# original's, and, wherever the original's answer passes every check, the same answer.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cases } from './cases.js';
import { parse } from './parse.js';
import { strict, size } from './check.js';
import { args, judge, load, recorded } from './judge.js';
import { run } from '../src/cli.js';

const ported = c => run(args(c));

const passes = r => Object.values(strict(r)).every(check => check(r).length === 0);

judge('js', ported);

// Size is an ordered diff's measure; unordered answers are judged exact.
cases.forEach((c, i) => c.ordered && test(`js ${i} ${c.name}: no larger than the C# original's`, () =>
  assert.ok(size(load(c, ported(c))).reported <= size(load(c, recorded(c, i))).reported)));

cases
  .map((c, i) => ({ c, i, record: recorded(c, i) }))
  .filter(({ c, record }) => passes(load(c, record)))
  .forEach(({ c, i, record }) => test(`js ${i} ${c.name}: the answer of the C# original, which passes`, () =>
    assert.deepEqual(parse(ported(c)), parse(record))));
