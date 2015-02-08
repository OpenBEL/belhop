#!/usr/bin/env bash

# The next three lines are for the go shell.
export SCRIPT_NAME="Doctest"
export SCRIPT_HELP="Execute examples in JavaScript source via doctest."
[[ "$GOGO_GOSH_SOURCE" -eq 1 ]] && return 0

# Normal script execution starts here.
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"/../
source "$DIR"/env.sh || exit 1
use_gosh_contrib || exit 1

# Create the node environment if needed...
create_node_env || exit 1
# ... and use it.
export PATH="$GOSH_CONTRIB_NODE_NPM_MODPATH/node_modules/.bin":$PATH

cd "$DIR" || exit 1
require_cmd "doctest" || exit 1
# shellcheck disable=SC2046
doctest $(find "$SRC" -name "*.js")

