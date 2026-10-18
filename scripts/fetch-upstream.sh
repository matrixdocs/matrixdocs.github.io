#!/usr/bin/env bash
# Shallow-clone the pinned upstream sources the gate checks against into ${1:-.upstream}, and fetch each
# bridge's example config at its pinned tag into ${1:-.upstream}/bridges/<name>/<path>.
# To bump a pin: edit scripts/upstream-versions.json, rerun this, run `npm run check` and
# `npm run check:bridges`, fix, merge. Heisenbridge has no config file (settings live on the homeserver),
# so it has no entry; its registration file is checked against the spec instead.
set -euo pipefail
DEST=${1:-.upstream}
mkdir -p "$DEST"
for name in matrix-spec synapse; do
  repo=$(node -p "require('./scripts/upstream-versions.json')['$name'].repo")
  tag=$(node -p "require('./scripts/upstream-versions.json')['$name'].tag")
  rm -rf "$DEST/$name"
  git clone -q --depth 1 --branch "$tag" "$repo" "$DEST/$name"
done
rm -rf "$DEST/bridges"
node -e 'for (const [n, b] of Object.entries(require("./scripts/upstream-versions.json").bridges)) console.log(n, b.repo, b.tag, b.config)' |
  while read -r name repo tag file; do
    mkdir -p "$DEST/bridges/$name/$(dirname "$file")"
    curl -fsSL --retry 3 -o "$DEST/bridges/$name/$file" "https://raw.githubusercontent.com/$repo/$tag/$file"
  done
echo "MATRIX_SPEC=$DEST/matrix-spec SYNAPSE_SRC=$DEST/synapse BRIDGES_SRC=$DEST/bridges"
