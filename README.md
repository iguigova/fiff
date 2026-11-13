# fiff

FIFF, a text diff that reads two files in chunks until they differ, then token
by token until a token of one is found among the other's, and its check
against a reference diff.

- `original/` is FIFFConsole 0.2 in C#, unchanged, from the `FIFFConsole`
  branch of `snippets_cs` at `e9d8cb1`: its source, documentation and test
  files. Its CodeProject article, which `original/README` links, is gone
  from codeproject.com; the Wayback Machine holds it as of 2012-01-10:
  http://web.archive.org/web/20120110151009/http://www.codeproject.com:80/KB/recipes/FIFF.aspx
- `csharp/record.sh` builds it on .NET 8 in Docker and runs it on every case
  in `check/cases.js`, writing `record/csharp/<case>.out`.
- `src/fiff.js` is the JS port, for Node and the browser, with no
  dependencies; `src/cli.js` takes FIFFConsole's arguments.
- `index.html` and `demo/` are the page at https://iguigova.github.io/fiff/:
  it runs the port in the browser on the original's test files or any text,
  marks each difference in both files and judges the answer with
  `check/check.js`. It loads `../brand.css` and `../brand.js` from the site
  root.
- `check/` judges a result. A correct answer counts as many differences as
  it lists, and each sits in its file where it says; in ordered mode,
  removing them leaves the same text in both files; in unordered mode, each
  side reports exactly the tokens the other file lacks, each token
  cancelling one copy on the other side, so order does not matter and
  repeats count, as the pseudo-code of `original/doc/FIFF.html` clears a
  matched pair. Its size is the tokens the differences hold, against the
  smallest diff by longest common subsequence.

`npm test` runs the checks on the port's answers, holds them to no larger
than the original's in ordered mode and to the original's wherever the
original passes every check and the smallest diff, and runs the port's and
the checker's own tests. `npm run original` runs the checks and the smallest
diff on the record.

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
| A difference ends at the first token both windows share, and a line repeated through the file, such as `<TR vAlign=top>`, ends it early, so the competition test reports 25 lines where 19 do. This is the algorithm, not a slip in the code: `original/doc/FIFF.html` names it, a deletion reported "as edition followed by deletion when there is a repeating token present in both files such as <TR vAlign=top>". | 128–147 | 35 |

## What the port fixes

The port fixes the first four causes at their source in `src/fiff.js`:

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

The fifth cause is FIFF's design, which trades the smallest diff for time
linear in the differences when they are few (`original/README`,
`original/doc/FIFF.html`): the port
keeps it, and on the competition test reports 25 lines where the smallest
diff is 19.
