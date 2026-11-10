// The reference answers: the smallest ordered diff, by longest common
// subsequence, and the unordered rule of FIFF 0.2: the same tokens in any
// order.

const nextRow = (a, prev, y) => {
  const row = [0];
  for (let i = 0; i < a.length; i++) row.push(a[i] === y ? prev[i] + 1 : Math.max(row[i], prev[i + 1]));
  return row;
};

export const lcsLength = (a, b) => b.reduce((prev, y) => nextRow(a, prev, y), Array(a.length + 1).fill(0))[a.length];

// Tokens deleted plus tokens inserted, in the smallest diff.
export const minimalEdit = (a, b) => a.length + b.length - 2 * lcsLength(a, b);

// The tokens of `a` the other side lacks: each token of `b` cancels one copy,
// so order does not matter and repeats count.
export const absent = (a, b) => {
  const left = new Map();
  b.forEach(t => left.set(t, (left.get(t) ?? 0) + 1));
  return a.filter(t => {
    const n = left.get(t) ?? 0;
    left.set(t, n - 1);
    return n <= 0;
  });
};
