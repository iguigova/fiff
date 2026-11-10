# fiff

FIFF, a text diff that reads two files in chunks until they differ, then token
by token until a token of one is found among the other's, and its check
against a reference diff.

- `original/` is FIFFConsole 0.2 in C#, unchanged, from the `FIFFConsole`
  branch of `snippets_cs` at `e9d8cb1`: its source, documentation and test
  files.
- `csharp/record.sh` builds it on .NET 8 in Docker and runs it on every case
  in `check/cases.js`, writing `record/csharp/<case>.out`.
- `src/fiff.js` is the JS port, for Node and the browser, with no
  dependencies; `src/cli.js` takes FIFFConsole's arguments. On every case it
  reports the differences the original reports.
- `check/` judges a result: the differences counted match those listed; each
  sits in its file where it says; in ordered mode, removing them leaves the
  same text in both files, and they hold no more tokens than the smallest
  diff, by longest common subsequence; in unordered mode, each side reports
  exactly its tokens absent from the other file.

`npm test` runs the port against the record, the port's own tests and the
checker's. `npm run original` runs the checks on the record.

The cases are those of `original/test/TestHarness.bat` whose files the branch
holds, under the five argument sets of `FIFFConsoleTestHarness.bat`, and the
competition test on `grid1.html` and `grid2.html`.

## What the checks find in the original

`npm run original` fails 11 of its 130 tests. Each failure traces to one of
five causes, all in `original/src/FIFFBroker.cs`, confirmed by tracing each
failing case through the code:

| Cause | Lines | Failing cases |
|---|---|---|
| Unordered mode removes a token as matched when its lookup found nothing: both `Process` calls pass `matched = true` whatever `IndexOf` returned, so "a" vanishes from the differences. | 135–138 | 31 |
| When the two windows each hold the other's current token at different places, the whole window is reported as one difference instead of syncing on the nearer match, so a swapped word pair is 4 tokens where 2 do. | 142–145 | 10, 12 |
| When either file ends, the difference is reported in the same pass that reads the other file's remaining tokens, before they are searched for a match, so a shared line end is reported as changed. | 90–91, 107–119 | 5, 7 |
| An empty side's position is read from its empty token list, which answers -1. | 73–74 | 1, 6, 21, 26, 31 |
| A difference ends at the first token both windows share, and a line repeated through the file, such as `<TR vAlign=top>`, ends it early, so the competition test reports 25 lines where 19 do. This is the algorithm, not a slip in the code. | 128–147 | 35 |

## What the port fixes

The port answers as the original does wherever the original passes every
check, and fixes these causes at their source in `src/fiff.js`:

- Unordered mode takes one token a step: file 1's first token, found anywhere
  in file 2, leaves with its match; else file 2's first token, found anywhere
  in file 1; else both are a difference.
- Ordered mode, when each side holds the other's current token, ends the
  difference at the nearer of the two matches.
- Ordered mode, at the end of a file, reports the rest only once every token
  has been looked for in the other side.
- A side with no tokens left in a difference gives as its position how far
  its file has been read: in ordered mode where the other side's text goes,
  in unordered mode the end of the file.
