// The reference answers: the smallest ordered diff, by longest common
// subsequence, and the unordered rule of FIFF 0.2.

const nextRow = (a, prev, y) => {
  const row = [0];
  for (let i = 0; i < a.length; i++) row.push(a[i] === y ? prev[i] + 1 : Math.max(row[i], prev[i + 1]));
  return row;
};

export const lcsLength = (a, b) => b.reduce((prev, y) => nextRow(a, prev, y), Array(a.length + 1).fill(0))[a.length];

// Tokens deleted plus tokens inserted, in the smallest diff.
export const minimalEdit = (a, b) => a.length + b.length - 2 * lcsLength(a, b);

// A token present anywhere in the other file is not a difference.
export const absent = (a, b) => { const other = new Set(b); return a.filter(t => !other.has(t)); };
