// The cases TestHarness.bat runs on files the branch holds, each under the five
// argument sets of FIFFConsoleTestHarness.bat, and the competition test.

const TEXT = {
  f1: 'This is a text.txt',
  f2: 'This is a simple text.txt',
  f3: 'This is a complex text.txt',
  f5: 'This is a text simple.txt',
  f6: 'This is convoluted text that my sister wrote.txt',
  f7: 'This text is in red.txt',
  f8: 'This is a complex convoluted text.txt',
};

const PAIRS = [
  ['f1', 'f2'], ['f1', 'f5'], ['f2', 'f5'], ['f2', 'f3'],
  ['f1', 'f6'], ['f1', 'f7'], ['f8', 'f6'],
];

const SETS = [
  { delimiter: 32, ordered: true, buffer: 4096 },
  { delimiter: 32, ordered: false, buffer: 4096 },
  { delimiter: 32, ordered: true, buffer: 10 },
  { delimiter: 13, ordered: true, buffer: 4096 },
  { delimiter: 13, ordered: false, buffer: 4096 },
];

const GRID = { file1: 'grid1.html', file2: 'grid2.html', delimiter: 13, ordered: true, buffer: 200 };

const pairCases = ([a, b]) => SETS.map(set => ({ file1: TEXT[a], file2: TEXT[b], ...set }));

const name = c => `${c.file1} | ${c.file2} | ${c.delimiter} ${c.ordered} ${c.buffer}`;

export const cases = [...PAIRS.flatMap(pairCases), GRID].map(c => ({ ...c, name: name(c) }));

const row = (c, i) => [i, c.file1, c.file2, c.delimiter, c.ordered, c.buffer].join('\t');

// One line per case for the C# runner: index, files and arguments, tab separated.
export const tsv = () => cases.map(row).join('\n');
