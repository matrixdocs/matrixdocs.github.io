#!/usr/bin/env bash
# Shallow-clone the pinned upstream sources the gate checks against into ${1:-.upstream}.
# To bump a pin: edit scripts/upstream-versions.json, rerun this, run `npm run check`, fix, merge.
set -euo pipefail
DEST=${1:-.upstream}
mkdir -p "$DEST"
for name in matrix-spec synapse; do
  repo=$(node -p "require('./scripts/upstream-versions.json')['$name'].repo")
  tag=$(node -p "require('./scripts/upstream-versions.json')['$name'].tag")
  rm -rf "$DEST/$name"
  git clone -q --depth 1 --branch "$tag" "$repo" "$DEST/$name"
done
echo "MATRIX_SPEC=$DEST/matrix-spec SYNAPSE_SRC=$DEST/synapse"
