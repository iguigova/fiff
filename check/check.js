// Judges one FIFF result against the reference. Each check returns the list of
// its failures, empty when the result passes it.

import { tokenize, decode, keys } from './tokens.js';
import { minimalEdit, absent } from './reference.js';

// Where a reported difference ends in the file, or -1 when the file does not
// hold its text at its position.
export const locate = (bytes, pos, text) => {
  if (pos < 0 || pos > bytes.length) return -1;
  for (let end = pos; end <= bytes.length; end++) {
    if (decode(bytes.subarray(pos, end)) === text) return end;
  }
  return -1;
};

const SIDES = [['bytes1', 'pos1', 'text1', 1], ['bytes2', 'pos2', 'text2', 2]];

const spans = (run, side) => run.hunks.map(h => [h[side[1]], locate(run[side[0]], h[side[1]], h[side[2]])]);

const misplaced = (run, side) => run.hunks.flatMap((h, i) =>
  locate(run[side[0]], h[side[1]], h[side[2]]) === -1
    ? [`difference ${i + 1}: file ${side[3]} has no ${JSON.stringify(h[side[2]])} at ${h[side[1]]}`]
    : []);

const outside = (bytes, ranges) => {
  const kept = Array.from(bytes, () => true);
  ranges.forEach(([s, e]) => { for (let i = s; i < e; i++) kept[i] = false; });
  return decode(bytes.filter((_, i) => kept[i])).toLowerCase();
};

const tokenCount = (bytes, ranges, delimiter) =>
  ranges.reduce((n, [s, e]) => n + tokenize(bytes.subarray(s, e), delimiter).length, 0);

const reportedKeys = (bytes, ranges, delimiter) =>
  ranges.flatMap(([s, e]) => keys(bytes.subarray(s, e), delimiter)).sort();

const sameList = (label, got, want) =>
  JSON.stringify(got) === JSON.stringify(want) ? [] : [`${label}: reported ${JSON.stringify(got)}, expected ${JSON.stringify(want)}`];

export const counted = run =>
  run.total === run.hunks.length ? [] : [`counts ${run.total} differences, reports ${run.hunks.length}`];

export const placed = run => SIDES.flatMap(side => misplaced(run, side));

// Ordered: taking the reported differences out of both files leaves the same text.
export const sound = run => {
  const [one, two] = SIDES.map(side => outside(run[side[0]], spans(run, side)));
  return one === two ? [] : ['the text outside the differences is not the same in both files'];
};

// The tokens the differences hold, and the tokens the smallest diff holds.
export const size = run => ({
  reported: SIDES.reduce((n, side) => n + tokenCount(run[side[0]], spans(run, side), run.delimiter), 0),
  smallest: minimalEdit(keys(run.bytes1, run.delimiter), keys(run.bytes2, run.delimiter)),
});

// Ordered: the differences hold no more tokens than the smallest diff. FIFF
// does not promise it, so it judges the original's record and is a figure
// for the port.
export const minimal = run => {
  const { reported, smallest } = size(run);
  return reported === smallest ? [] : [`differences hold ${reported} tokens, the smallest diff ${smallest}`];
};

// Unordered: each side reports exactly its tokens absent from the other file.
export const exact = run => {
  const [k1, k2] = [keys(run.bytes1, run.delimiter), keys(run.bytes2, run.delimiter)];
  return [
    ...sameList('file 1', reportedKeys(run.bytes1, spans(run, SIDES[0]), run.delimiter), absent(k1, k2).sort()),
    ...sameList('file 2', reportedKeys(run.bytes2, spans(run, SIDES[1]), run.delimiter), absent(k2, k1).sort()),
  ];
};

// What a correct answer satisfies.
export const checks = run => run.ordered
  ? { counted, placed, sound }
  : { counted, placed, exact };

// The checks, and in ordered mode the smallest diff too.
export const strict = run => (run.ordered ? { ...checks(run), minimal } : checks(run));
