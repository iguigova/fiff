// The JS port prints what the C# original printed, on every case.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cases } from './cases.js';
import { parse } from './parse.js';
import { args, recorded } from './judge.js';
import { run } from '../src/cli.js';

cases.forEach((c, i) => test(`js ${i} ${c.name}: the differences the C# original reports`, () =>
  assert.deepEqual(parse(run(args(c))), parse(recorded(c, i)))));
