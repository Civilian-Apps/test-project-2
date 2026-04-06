#!/usr/bin/env bash
#
# Updates DEPLOYMENTS.md with a row for the given environment.
# Replaces any existing row whose Environment column matches.
#
# Usage: update-deployments.sh <environment> <url> <commit_sha> <actor>
#
set -euo pipefail

ENV_ID="${1:?environment id required}"
URL="${2:?url required}"
COMMIT_SHA="${3:?commit sha required}"
ACTOR="${4:?actor required}"

DEPLOYED_AT=$(date -u +%Y-%m-%dT%H:%M:%SZ)
SHORT_SHA="${COMMIT_SHA:0:7}"
NOTES="deployed by @${ACTOR}"
FILE="DEPLOYMENTS.md"

if [[ ! -f "$FILE" ]]; then
  cat > "$FILE" <<'HEADER'
# Deployments

> Active deployments only. Auto-maintained by `.github/workflows/deploy.yml` (writes/updates a row on every successful deploy) and `.github/workflows/deployment-cleanup.yml` (removes the preview row when its PR closes).
>
> The `Notes` column may be edited by hand to add context, but it will be overwritten on the next deploy of the same environment. To make notes survive, edit them right after a deploy and they'll persist until the next one.

| Environment | URL | Provider | Deployed at | Commit | Notes |
|---|---|---|---|---|---|
HEADER
fi

# Drop any existing row for this environment (matches at start of line, with surrounding pipes).
grep -v "^| ${ENV_ID} |" "$FILE" > "${FILE}.tmp" || true
mv "${FILE}.tmp" "$FILE"

# Append the new row.
printf '| %s | %s | Vercel | %s | %s | %s |\n' \
  "$ENV_ID" "$URL" "$DEPLOYED_AT" "$SHORT_SHA" "$NOTES" >> "$FILE"
