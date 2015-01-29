#!/usr/bin/env bash

# The next three lines are for the go shell.
export SCRIPT_NAME="ESLint"
export SCRIPT_HELP="Lint JavaScript source via ESLint."
[[ "$GOGO_GOSH_SOURCE" -eq 1 ]] && return 0

# Normal script execution starts here.
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"/../
source "$DIR"/env.sh || exit 1
use_gosh_contrib || exit 1
assert_env NPM_MODPATH || exit 1

# Create the node environment if needed...
create_node_env || exit 1
# ... and use it.
export PATH="$NPM_MODPATH/.bin":$PATH

cd "$DIR" || exit 1
require_cmd "eslint" || exit 1
eslint $(find src spec -name "*.js")

