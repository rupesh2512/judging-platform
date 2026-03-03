#!/bin/sh
FILE="/input/$1"

if [ ! -f "$FILE" ]; then
  echo "File not found: $FILE" >&2
  exit 1
fi

node "$FILE"
exit $?