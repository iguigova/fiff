// The port's own surface: the configuration text, the format, the argument
// rules of the command line and its edges. check/ judges its answers.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { compare, describe, format, total, DEFAULTS } from './fiff.js';
import { parseOptions, run } from './cli.js';

const bytes = text => new TextEncoder().encode(text);
const CLI = fileURLToPath(new URL('./cli.js', import.meta.url));
const TEXT = fileURLToPath(new URL('../original/test/This is a text.txt', import.meta.url));
const SIMPLE = fileURLToPath(new URL('../original/test/This is a simple text.txt', import.meta.url));

test('the configuration names each setting', () => {
  assert.match(describe(DEFAULTS), /\nDelimiter ASCII Code \t32\nOrdered Compare \tON\nStream Buffer Size \t4096/);
  assert.match(describe({ ...DEFAULTS, ordered: false }), /Ordered Compare \tOFF/);
});

test('a format fills each numbered place', () => assert.equal(format('{0}-{1}-{0}', ['a', 2]), 'a-2-a'));

test('the total follows the differences', () => assert.equal(total('x', 3), 'x\n\nTotal number of differences: 3'));

test('identical texts have no differences', () => assert.equal(compare(bytes('a b \n'), bytes('a b \n')), total('', 0)));

test('the default options report one changed word', () =>
  assert.equal(compare(bytes('a b \n'), bytes('a c \n')), total('\n1:2 b \n2:2 c \n', 1)));

test('texts that differ only in case have no differences', () =>
  assert.equal(compare(bytes('a B \n'), bytes('a b \n')), total('', 0)));

test('options are read in order and stop at the first that does not parse', () => {
  assert.deepEqual(parseOptions([' 13 ', 'TRUE', '10', 'x']), { delimiter: 13, ordered: true, buffer: 10, format: 'x' });
  assert.deepEqual(parseOptions(['13', 'maybe', '10']), { ...DEFAULTS, delimiter: 13 });
  assert.deepEqual(parseOptions(['3000000000']), DEFAULTS);
  assert.deepEqual(parseOptions(['70000']), { ...DEFAULTS, delimiter: 70000 & 0xffff });
});

test('too few or too many arguments print the usage', () => {
  assert.match(run(['one']), /^\nPlease enter the names of the files to compare\.\n\nUsage: /);
  assert.match(run(['1', '2', '3', '4', '5', '6', '7']), /Delimiter ASCII Code \t32/);
});

test('a file compared with itself by name is not read', () =>
  assert.equal(run(['missing', 'missing']), `Comparing missing to missing...\n${total('', 0)}\n`));

test('an unreadable file is reported, not thrown', () => assert.match(run(['missing1', 'missing2']), /\nException: ENOENT/));

test('the command line prints the comparison', () =>
  assert.match(execFileSync('node', [CLI, TEXT, SIMPLE], { encoding: 'utf8' }), /\n2:10 simple \n\n\nTotal number of differences: 1\n$/));

const UNORDERED = { ...DEFAULTS, ordered: false, format: '[{1}:{2}|{3}:{4}]' };

test('unordered: a token absent from the other file is a difference', () =>
  assert.equal(
    compare(bytes('This is a complex convoluted text .\n'), bytes('This is convoluted text that my sister wrote.\n'), UNORDERED),
    total('[8:a |24:that ][10:complex |29:my ][34:.\n|32:sister ][-1:|39:wrote.\n]', 4)));

test('unordered: a token absent from file 1 is a difference even when file 1 goes on matching', () =>
  assert.equal(compare(bytes('b \n'), bytes('c d b \n'), UNORDERED), total('[-1:|0:c ][-1:|2:d ]', 2)));
