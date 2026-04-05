#!/bin/bash
INPUT=$(cat)
ACTIVE=$(echo "$INPUT" | jq -r '.stop_hook_active // false')
[[ "$ACTIVE" == "true" ]] && exit 0

npm test --passWithNoTests 2>/dev/null
if [ $? -ne 0 ]; then
  echo '{"decision":"block","reason":"Tests failing. Fix before completing."}'
  exit 0
fi

npx tsc --noEmit 2>/dev/null
if [ $? -ne 0 ]; then
  echo '{"decision":"block","reason":"Type errors. Fix before completing."}'
  exit 0
fi

exit 0
