#!/bin/bash
# Auto-format files after edits
INPUT=$(cat)
FILE=$(echo "$INPUT" | jq -r '.file_path // empty')

if [ -n "$FILE" ] && [[ "$FILE" == *.ts || "$FILE" == *.tsx || "$FILE" == *.js || "$FILE" == *.jsx ]]; then
  npx prettier --write "$FILE" 2>/dev/null || true
fi
