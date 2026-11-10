// The checker on results whose verdict is known, so a pass from check.test.js
// means the result is right and a failure means it is wrong.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tokenize } from './tokens.js';
import { lcsLength, minimalEdit, absent } from './reference.js';
import { parse, SENTINEL_FORMAT } from './parse.js';
import { strict, locate } from './check.js';

const run = (text1, text2, hunks, ordered = true) => ({
  bytes1: Buffer.from(text1), bytes2: Buffer.from(text2), delimiter: 32, ordered, hunks, total: hunks.length,
});

const verdicts = r => Object.fromEntries(Object.entries(strict(r)).map(([k, f]) => [k, f(r).length === 0]));

const A = 'This is a text \n';
const B = 'This is a simple text \n';
const RIGHT = { pos1: 10, text1: '', pos2: 10, text2: 'simple ' };

test('a token ends at the delimiter or a line feed', () =>
  assert.deepEqual(tokenize(Buffer.from('ab c\nd'), 32), [[0, 3], [3, 5], [5, 6]]));

test('the LCS of two token lists', () => assert.equal(lcsLength(['a', 'b', 'c', 'd'], ['b', 'x', 'd']), 2));

test('the smallest edit counts deletions and insertions', () => assert.equal(minimalEdit(['a', 'b'], ['a', 'c']), 2));

test('absent keeps the tokens the other list lacks, with repeats', () =>
  assert.deepEqual(absent(['a', 'b', 'b'], ['a']), ['b', 'b']));

test('the parser reads the sentinel format back exactly', () => {
  const out = SENTINEL_FORMAT.replace('{1}', '3').replace('{2}', 'x\ny').replace('{3}', '-1').replace('{4}', '');
  assert.deepEqual(parse(`${out}\n\nTotal number of differences: 1`), { hunks: [{ pos1: 3, text1: 'x\ny', pos2: -1, text2: '' }], total: 1 });
});

test('locate finds where a difference ends, and -1 when the text is not there', () => {
  assert.equal(locate(Buffer.from(B), 10, 'simple '), 17);
  assert.equal(locate(Buffer.from(B), 9, 'simple '), -1);
});

test('the smallest right diff passes every ordered check', () =>
  assert.deepEqual(verdicts(run(A, B, [RIGHT])), { counted: true, placed: true, sound: true, minimal: true }));

test('a diff that also takes a shared token is sound but not minimal', () =>
  assert.deepEqual(verdicts(run(A, B, [{ pos1: 10, text1: 'text ', pos2: 10, text2: 'simple text ' }])),
    { counted: true, placed: true, sound: true, minimal: false }));

test('a diff that misses a change is not sound', () =>
  assert.equal(verdicts(run(A, B, [])).sound, false));

test('a difference at the wrong position is not placed', () =>
  assert.equal(verdicts(run(A, B, [{ ...RIGHT, pos2: 9 }])).placed, false));

test('a count that disagrees with the differences is caught', () =>
  assert.equal(verdicts({ ...run(A, B, [RIGHT]), total: 2 }).counted, false));

test('unordered: tokens present in the other file in another order are no difference', () =>
  assert.deepEqual(verdicts(run('b a \n', 'a b \n', [], false)), { counted: true, placed: true, exact: true }));

test('unordered: a missed absent token is caught', () =>
  assert.equal(verdicts(run('a x y \n', 'a \n', [{ pos1: 2, text1: 'x ', pos2: 2, text2: '' }], false)).exact, false));

test('the runner list has one tab-separated line per case, by index', async () => {
  const { tsv, cases } = await import('./cases.js');
  const lines = tsv().split('\n');
  assert.equal(lines.length, cases.length);
  assert.equal(lines[35], '35\tgrid1.html\tgrid2.html\t13\ttrue\t200');
});
