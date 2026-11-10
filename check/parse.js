// Reads FIFFConsole output written with SENTINEL_FORMAT, whose control
// characters cannot occur in the sample texts, so a difference's text is
// read back exactly.

export const SENTINEL_FORMAT = '\x01{1}\x02{2}\x03{3}\x02{4}\x04';

const HUNK = /\x01(-?\d+)\x02([\s\S]*?)\x03(-?\d+)\x02([\s\S]*?)\x04/g;
const TOTAL = /Total number of differences: (\d+)/;

const hunk = m => ({ pos1: Number(m[1]), text1: m[2], pos2: Number(m[3]), text2: m[4] });

export const parse = output => ({
  hunks: [...output.matchAll(HUNK)].map(hunk),
  total: Number(output.match(TOTAL)?.[1] ?? NaN),
});
