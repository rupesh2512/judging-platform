#!/bin/sh
FILE="/input/$1"
BINARY="/tmp/solution_bin"

if [ ! -f "$FILE" ]; then
  echo "File not found: $FILE" >&2
  exit 1
fi

g++ -o "$BINARY" "$FILE" 2>&1
if [ $? -ne 0 ]; then
  exit 2
fi

"$BINARY"
exit $?