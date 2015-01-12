#!/usr/bin/env bash

# The next three lines are for the go shell.
export SCRIPT_NAME="JavaScript Code Style"
export SCRIPT_HELP="Lint JavaScript code style via jscs."
[[ "$GOGO_GOSH_SOURCE" -eq 1 ]] && return 0

# Normal script execution starts here.
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"/../
source "$DIR"/env.sh || exit 1
cd "$DIR" || exit 1

require_cmd "jscs"
jscs -p google $(find -name "*.js" | grep -v "node_modules")

