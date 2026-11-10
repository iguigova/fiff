// FIFF: a text diff that compares two files chunk by chunk until the chunks
// differ, then token by token, ending a difference at the first token one
// side finds among the other's. A port of FIFFConsole 0.2; positions are byte
// offsets, and text is decoded as UTF-8.

// ---- Configuration ----

const UNDEFINED = -1;
const NEWLINE = '\n';

export const DEFAULT_FORMAT = '{0}1:{1} {2}{0}2:{3} {4}{0}';

export const DEFAULTS = { delimiter: 32, ordered: true, buffer: 4096, format: DEFAULT_FORMAT };

const onOff = flag => (flag ? 'ON' : 'OFF');

// The configuration as FIFFConsole prints it, and as {5} in a format.
export const describe = options => [
  `Delimiter ASCII Code \t${options.delimiter}`,
  `Ordered Compare \t${onOff(options.ordered)}`,
  `Stream Buffer Size \t${options.buffer}`,
  `Output Format \t\t${options.format}`,
  '\t\t\t\t{0} = New Line,',
  '\t\t\t\t{1} = file 1 position,',
  '\t\t\t\t{2} = file 1 difference,',
  '\t\t\t\t{3} = file 2 position,',
  '\t\t\t\t{4} = file 2 difference',
  '\t\t\t\t{5} = Configuration',
  'Ignore Case \tON',
  'Optimization \tON',
].map(line => `\n${line}`).join('');

export const format = (template, values) => template.replace(/\{(\d)\}/g, (_, n) => String(values[n]));

// ---- Text ----

const DECODER = new TextDecoder('utf-8', { ignoreBOM: true });

const decode = bytes => DECODER.decode(bytes);

// FIFF ignores case when it decides whether two texts differ.
const sameText = (a, b) => a.toLowerCase() === b.toLowerCase();

// ---- Stream: a read position over one file's bytes ----

const stream = bytes => ({ bytes, next: 0, prev: UNDEFINED });

const last = s => s.bytes.length;

const notAtEnd = s => s.next < last(s);

// Moves to `from` unless it is undefined, and returns the bytes up to `to`.
const readBytes = (s, from, to) => {
  if (from > UNDEFINED && from !== s.next) s.next = Math.min(from, last(s));
  const size = Math.min(Math.max(0, to - s.next), Math.max(0, last(s) - s.next));
  if (!notAtEnd(s)) return new Uint8Array(0);
  s.prev = s.next;
  s.next += size;
  return s.bytes.subarray(s.prev, s.next);
};

const read = (s, from, to) => decode(readBytes(s, from, to));

const endsToken = (text, delimiter) => text.at(-1) === delimiter || text.endsWith(NEWLINE);

// One token from `from`: byte by byte up to the delimiter or a line end.
const readToken = (s, from, delimiter) => {
  readBytes(s, from, 0);
  let text = '';
  let byte = readBytes(s, s.next, s.next + 1);
  while (byte.length > 0) {
    text += decode(byte);
    if (endsToken(text, delimiter)) break;
    byte = readBytes(s, s.next, s.next + 1);
  }
  s.prev = Math.min(from, last(s));
  return text;
};

// ---- Data: the tokens read from one file and not yet matched ----

const inRange = (data, i) => i > UNDEFINED && i < data.length;

const peek = (data, i, field) => (inRange(data, i) ? data[i][field] : UNDEFINED);

const peekEnd = (data, i) => (inRange(data, i) ? data[i].pos + data[i].len : UNDEFINED);

const indexOf = (data, hash) => data.findIndex(t => t.hash === hash);

const removeAt = (data, i) => { if (inRange(data, i)) data.splice(i, 1); };

const removeRange = (data, i, count) => { if (inRange(data, i)) data.splice(i, Math.min(count, data.length - i)); };

// ---- Broker: the comparison ----

export const compare = (bytes1, bytes2, options = DEFAULTS) => {
  const { delimiter, ordered, buffer } = options;
  const delimiterChar = String.fromCharCode(delimiter);
  // Ordered comparison reads one token at a time; unordered reads them all.
  const optimized = ordered;
  const s1 = stream(bytes1);
  const s2 = stream(bytes2);
  const d1 = [];
  const d2 = [];
  let diff = '';
  let count = 0;

  // Reads one token from `pos`, or every token to the end when `one` is false.
  const readIn = (s, data, pos, one) => {
    let more = pos >= 0 && pos < last(s);
    while (more) {
      const hash = readToken(s, pos, delimiterChar);
      data.push({ pos, hash, len: s.next - s.prev });
      more = notAtEnd(s) && !one;
      pos = s.next;
    }
  };

  // Reads out the text of tokens 0..idx, moves the stream to `reposition`, and
  // drops those tokens.
  const readOut = (s, data, idx, reposition) => {
    const upTo = Math.min(idx, data.length - 1);
    const text = upTo > UNDEFINED ? read(s, peek(data, 0, 'pos'), peekEnd(data, upTo)) : '';
    if (reposition > UNDEFINED) read(s, reposition, 0);
    if (optimized) data.length = 0;
    else removeRange(data, 0, upTo + 1);
    return text;
  };

  const reindex = idx => (ordered ? idx : 0);

  const reposition = (s, pos) => (ordered ? pos : last(s));

  // Reports file 1's tokens 0..idx1 against file 2's tokens 0..idx2.
  const report = (idx1, idx2) => {
    const pos1 = peek(d1, 0, 'pos');
    const pos2 = peek(d2, 0, 'pos');
    const offset = peek(d1, idx1, 'hash') === peek(d2, idx2, 'hash') ? -1 : 0;
    const diff1 = readOut(s1, d1, reindex(idx1 + offset), reposition(s1, peekEnd(d1, idx1)));
    const diff2 = readOut(s2, d2, reindex(idx2 + offset), reposition(s2, peekEnd(d2, idx2)));
    if (sameText(diff1, diff2)) return;
    diff += format(options.format, [NEWLINE, pos1, diff1, pos2, diff2, describe(options)]);
    count++;
  };

  const step = (idx1, idx2, matched) => {
    const bothOpen = notAtEnd(s1) && notAtEnd(s2);
    const atEnd = optimized && !bothOpen;
    if (!(ordered || matched) || (ordered && matched && idx1 + idx2 > 0)) {
      report(idx1, idx2);
    } else {
      if (matched) { removeAt(d1, idx1); removeAt(d2, idx2); }
      if (optimized) { readIn(s1, d1, s1.next, bothOpen); readIn(s2, d2, s2.next, bothOpen); }
    }
    const next = matched || !ordered ? 0 : Math.min(idx1, idx2) + 1;
    const oneSided = (d1.length === 0 && d2.length > 0) || (d2.length === 0 && d1.length > 0);
    // At the end of a file the rest of both files is read in, and is reported
    // only once every token has been looked for in the other side.
    const unmatchable = atEnd && next >= Math.max(d1.length, d2.length);
    if (oneSided || unmatchable) report(d1.length, d2.length);
    return next;
  };

  // Ordered: where the difference ends. File 2's token at idx found at match1
  // in file 1 ends it at (match1, idx); file 1's found at match2 ends it at
  // (idx, match2); when both are found, the one that ends it sooner wins.
  const syncOrdered = (idx, match1, match2) => {
    if (match1 > UNDEFINED && (match2 === UNDEFINED || match1 <= match2)) return [match1, idx];
    if (match2 > UNDEFINED) return [idx, match2];
    return [idx, idx];
  };

  // Unordered: file 1's first token, found anywhere in file 2, leaves with its
  // match; else file 2's first token, found anywhere in file 1; else both are
  // a difference.
  const stepUnordered = (match1, match2) => {
    if (match2 > UNDEFINED) return step(0, match2, true);
    if (match1 > UNDEFINED) return step(match1, 0, true);
    return step(0, 0, false);
  };

  const processAll = () => {
    let idx = 0;
    while (d1.length + d2.length > 0) {
      const match1 = indexOf(d1, peek(d2, idx, 'hash'));
      const match2 = indexOf(d2, peek(d1, idx, 'hash'));
      if (!ordered) {
        idx = stepUnordered(match1, match2);
      } else {
        idx = step(...syncOrdered(idx, match1, match2), match1 + match2 >= UNDEFINED);
      }
    }
  };

  while (notAtEnd(s1) || notAtEnd(s2)) {
    if (read(s1, s1.next, s1.next + buffer) !== read(s2, s2.next, s2.next + buffer)) {
      readIn(s1, d1, s1.prev, optimized);
      readIn(s2, d2, s2.prev, optimized);
      processAll();
    }
  }

  return total(diff, count);
};

export const total = (diff, count) => `${diff}${NEWLINE}${NEWLINE}Total number of differences: ${count}`;
