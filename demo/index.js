// The page's demo: runs the port on the two texts, marks each difference in
// both files and lists it, and judges the answer with the same checks the
// tests use.

import { compare } from '../src/fiff.js';
import { parse, SENTINEL_FORMAT } from '../check/parse.js';
import { checks, locate, size } from '../check/check.js';

const TEST = 'original/test/';

// Each example is two of the original's test files and the options to read
// them with.
const EXAMPLES = {
  moved: { files: ['This is a simple text.txt', 'This is a text simple.txt'], delimiter: 32, ordered: true },
  unordered: { files: ['This is a simple text.txt', 'This is a text simple.txt'], delimiter: 32, ordered: false },
  sister: { files: ['This is a text.txt', 'This is convoluted text that my sister wrote.txt'], delimiter: 32, ordered: true },
  grid: { files: ['grid1.html', 'grid2.html'], delimiter: 10, ordered: true },
};

// The test files are Windows-1252, as the competition gave them.
const DECODER = new TextDecoder('windows-1252');
const ENCODER = new TextEncoder();
const UTF8 = new TextDecoder('utf-8', { ignoreBOM: true });

const $ = id => document.getElementById(id);

const el = (tag, props = {}, ...children) => {
  const node = Object.assign(document.createElement(tag), props);
  node.append(...children);
  return node;
};

const load = async name => DECODER.decode(await (await fetch(TEST + encodeURIComponent(name))).arrayBuffer());

// FIFF's answer for the two texts, as the checks read it.
const run = (text1, text2, delimiter, ordered) => {
  const bytes1 = ENCODER.encode(text1);
  const bytes2 = ENCODER.encode(text2);
  const output = compare(bytes1, bytes2, { delimiter, ordered, buffer: 4096, format: SENTINEL_FORMAT });
  return { ...parse(output), bytes1, bytes2, delimiter, ordered };
};

// Where each difference sits in one file: [start, end, its number].
const spans = (bytes, hunks, pos, text) =>
  hunks.map((h, i) => [h[pos], Math.max(h[pos], locate(bytes, h[pos], h[text])), i + 1]).sort((a, b) => a[0] - b[0]);

const badge = n => el('span', { className: 'n' }, String(n));

// One file's text with its differences marked, each led by its number, and
// an empty side marked where the other side's text goes.
const view = (bytes, marks) => {
  const parts = [];
  let at = 0;
  for (const [start, end, n] of marks) {
    parts.push(UTF8.decode(bytes.subarray(at, start)));
    const text = UTF8.decode(bytes.subarray(start, end));
    parts.push(start === end
      ? el('mark', { className: 'gap', title: `Difference ${n}: nothing here` }, badge(n), el('span', { className: 'sr' }, ' nothing here'))
      : el('mark', { title: `Difference ${n}` }, badge(n), text));
    at = Math.max(at, end);
  }
  parts.push(UTF8.decode(bytes.subarray(at)));
  return parts;
};

const shown = text => (text === '' ? el('em', {}, 'nothing') : el('code', {}, text));

const row = (h, i) => el('tr', {},
  el('td', {}, String(i + 1)),
  el('td', {}, String(h.pos1)), el('td', {}, shown(h.text1)),
  el('td', {}, String(h.pos2)), el('td', {}, shown(h.text2)));

const verdict = result => {
  const all = Object.entries(checks(result));
  const failed = all.filter(([, check]) => check(result).length > 0).map(([name]) => name);
  return failed.length === 0
    ? `It passes every check: ${all.map(([name]) => name).join(', ')}.`
    : `It fails ${failed.join(', ')}.`;
};

const tokens = n => `${n} token${n === 1 ? '' : 's'}`;

const summary = result => {
  const n = result.total;
  const count = n === 0 ? 'No differences.' : `${n} difference${n === 1 ? '' : 's'}.`;
  if (!result.ordered) return `${count} ${verdict(result)}`;
  const { reported, smallest } = size(result);
  return `${count} They hold ${tokens(reported)}; the smallest diff holds ${tokens(smallest)}. ${verdict(result)}`;
};

const render = () => {
  const delimiter = Number($('delimiter').value);
  const ordered = $('ordered').checked;
  const result = run($('text1').value, $('text2').value, delimiter, ordered);
  $('view1').replaceChildren(...view(result.bytes1, spans(result.bytes1, result.hunks, 'pos1', 'text1')));
  $('view2').replaceChildren(...view(result.bytes2, spans(result.bytes2, result.hunks, 'pos2', 'text2')));
  $('diffs').replaceChildren(...result.hunks.map(row));
  $('summary').textContent = summary(result);
};

let pending;
const later = () => { clearTimeout(pending); pending = setTimeout(render, 200); };

const choose = async key => {
  const { files, delimiter, ordered } = EXAMPLES[key];
  const [text1, text2] = await Promise.all(files.map(load));
  $('text1').value = text1;
  $('text2').value = text2;
  $('delimiter').value = String(delimiter);
  $('ordered').checked = ordered;
  render();
};

$('example').addEventListener('change', e => choose(e.target.value));
$('delimiter').addEventListener('change', render);
$('ordered').addEventListener('change', render);
$('text1').addEventListener('input', later);
$('text2').addEventListener('input', later);
$('demo').addEventListener('submit', e => e.preventDefault());

choose($('example').value).catch(e => { $('summary').textContent = `The example did not load: ${e.message}`; });
