#!/bin/bash
# Builds the original C# FIFFConsole in the .NET SDK image and writes its output
# for every case in check/cases.js to record/csharp/<index>.out; run.sh is the
# part that runs inside the container.
set -euo pipefail
ROOT=$(cd "$(dirname "$0")/.." && pwd)
IMAGE=mcr.microsoft.com/dotnet/sdk:8.0
(cd "$ROOT/check" && node --input-type=module -e "import('./cases.js').then(m => console.log(m.tsv()))") > "$ROOT/csharp/cases.tsv"
docker run --rm -e OWNER="$(id -u):$(id -g)" -v "$ROOT":/work -w /work/csharp "$IMAGE" bash run.sh
