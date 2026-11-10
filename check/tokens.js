// A token is FIFFStream.Read(from, char): the bytes up to and including the
// delimiter or a line feed, whichever comes first.

const LF = 0x0a;

const ends = (bytes, delimiter, i) => bytes[i] === delimiter || bytes[i] === LF;

export const tokenize = (bytes, delimiter) => {
  const ranges = [];
  let start = 0;
  for (let i = 0; i < bytes.length; i++) {
    if (ends(bytes, delimiter, i)) { ranges.push([start, i + 1]); start = i + 1; }
  }
  if (start < bytes.length) ranges.push([start, bytes.length]);
  return ranges;
};

export const decode = bytes => Buffer.from(bytes).toString('utf8');

// FIFF reports with IgnoreCase on, so two texts are the same text when they
// differ only in case.
export const key = bytes => decode(bytes).toLowerCase();

export const keys = (bytes, delimiter) =>
  tokenize(bytes, delimiter).map(([s, e]) => key(bytes.subarray(s, e)));
