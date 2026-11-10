#!/usr/bin/env node
// fiff <file1> <file2> [<delimiter code> [<ordered> [<buffer> [<format>]]]]
// The optional arguments are read in order up to the first that does not
// parse; the rest keep their defaults.

import { readFileSync } from 'node:fs';
import { compare, describe, total, DEFAULTS } from './fiff.js';

const INT32 = /^\s*[+-]?\d+\s*$/;
const BOOLEAN = /^\s*(true|false)\s*$/i;

const int32 = text => {
  const n = INT32.test(text) ? Number(text) : NaN;
  if (!Number.isInteger(n) || n < -(2 ** 31) || n >= 2 ** 31) throw new Error(`not an integer: ${text}`);
  return n;
};

const boolean = text => {
  const m = BOOLEAN.exec(text);
  if (!m) throw new Error(`not a boolean: ${text}`);
  return m[1].toLowerCase() === 'true';
};

// A delimiter is a character code: the low 16 bits of the integer given.
const OPTIONAL = [
  ['delimiter', text => int32(text) & 0xffff],
  ['ordered', boolean],
  ['buffer', int32],
  ['format', text => text],
];

export const parseOptions = texts => {
  let options = { ...DEFAULTS };
  for (const [i, [name, parse]] of OPTIONAL.slice(0, texts.length).entries()) {
    try {
      options = { ...options, [name]: parse(texts[i]) };
    } catch {
      break;
    }
  }
  return options;
};

const USAGE = [
  '\nPlease enter the names of the files to compare.',
  '\nUsage: fiff <filename1> <filename2> [<delimiterchar> [<ordered> [<buffer> [<format>]]]]',
  '',
].join('\n');

// Comparing a file with itself, by name, reads neither.
const result = (file1, file2, options) =>
  file1 === file2 ? total('', 0) : compare(readFileSync(file1), readFileSync(file2), options);

export const run = args => {
  if (args.length < 2 || args.length > 6) return `${USAGE}\n${describe(DEFAULTS)}\n`;
  const [file1, file2, ...rest] = args;
  const options = parseOptions(rest);
  try {
    return `Comparing ${file1} to ${file2}...\n${result(file1, file2, options)}\n`;
  } catch (e) {
    return `Comparing ${file1} to ${file2}...\nException: ${e.message}\n`;
  }
};

if (process.argv[1] === new URL(import.meta.url).pathname) process.stdout.write(run(process.argv.slice(2)));
