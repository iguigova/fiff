#!/bin/bash
# Inside the .NET SDK container: builds FIFFConsole and runs it on each line of
# cases.tsv, in the sentinel format check/parse.js reads. The run's time and
# memory lines vary from run to run and are left out, so the record changes
# only when an answer does. The container runs as root, so every file it
# writes goes back to OWNER.
set -euo pipefail
FORMAT=$'\x01{1}\x02{2}\x03{3}\x02{4}\x04'
VARYING=(-e '/^Delta peak/d' -e '/^[0-9][0-9]:[0-9][0-9]:[0-9][0-9]\./d')
trap 'chown -R "$OWNER" out obj build.log ../record/csharp' EXIT
dotnet build -c Release -o out -nologo -v q > build.log
while IFS=$'\t' read -r i f1 f2 delim ordered buffer; do
  dotnet out/FIFFConsole.dll "../original/test/$f1" "../original/test/$f2" "$delim" "$ordered" "$buffer" "$FORMAT" \
    | sed "${VARYING[@]}" > "../record/csharp/$i.out"
done < cases.tsv
