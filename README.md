# fiff

FIFF, a text diff that reads two files in chunks until they differ, then token
by token until a token of one is found among the other's, and its check
against a reference diff.

- `original/` is FIFFConsole 0.2 in C#, unchanged, from the `FIFFConsole`
  branch of `snippets_cs` at `e9d8cb1b69053e98e4a873d4712e49757ea0e481`: its source, documentation and
  test files.
- `csharp/record.sh` builds it on .NET 8 in Docker and runs it on every case
  in `check/cases.js`, writing `record/csharp/<case>.out`.
- `check/` judges each recorded result: the differences counted match those
  listed; each sits in its file where it says; in ordered mode, removing them
  leaves the same text in both files, and they hold no more tokens than the
  smallest diff, by longest common subsequence; in unordered mode, each side
  reports exactly its tokens absent from the other file.

`npm test` runs the checks on the record, and the checker's own tests.

The cases are those of `original/test/TestHarness.bat` whose files the branch
holds, under the five argument sets of `FIFFConsoleTestHarness.bat`, and the
competition test on `grid1.html` and `grid2.html`.
