#!/usr/bin/env bash
# Download the images referenced by the migrated posts from Tumblr's CDN.
# Usage: bash scripts/import-tumblr-images.sh   (run from the repo root)
set -euo pipefail

manifest="scripts/tumblr-images.tsv"
fetched=0; skipped=0; failed=0

while IFS=$'\t' read -r path url; do
  [[ -z "${path:-}" ]] && continue
  if [[ -s "$path" ]]; then
    skipped=$((skipped + 1)); continue
  fi
  mkdir -p "$(dirname "$path")"
  if curl -fsSL --retry 3 -A "Mozilla/5.0 (site migration)" -o "$path.tmp" "$url"; then
    mv "$path.tmp" "$path"; fetched=$((fetched + 1)); echo "ok   $path"
  else
    rm -f "$path.tmp"; failed=$((failed + 1)); echo "FAIL $url" >&2
  fi
done < "$manifest"

echo "fetched=$fetched skipped=$skipped failed=$failed"
[[ $failed -eq 0 ]]
