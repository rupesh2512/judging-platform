
# $1 = filename e.g. solution_64abc123.py
# Exit codes:
#   0 = success
#   1 = runtime error
#   2 = compile/syntax error (Python uses exit 1 for both, we detect via stderr pattern)

#!/bin/sh
FILE="/input/$1"

if [ ! -f "$FILE" ]; then
  echo "File not found: $FILE" >&2
  exit 1
fi

python3 "$FILE"
exit $?