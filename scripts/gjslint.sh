#!/usr/bin/env bash

# The next three lines are for the go shell.
export SCRIPT_NAME="Closure Linter"
export SCRIPT_HELP="Lint JavaScript source via Google's Closure Linter."
[[ "$GOGO_GOSH_SOURCE" -eq 1 ]] && return 0

# Normal script execution starts here.
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"/../
source "$DIR"/env.sh || exit 1
cd "$DIR" || exit 1

require_cmd "gjslint"
gjslint $(find -name "*.js" | grep -v "node_modules")

