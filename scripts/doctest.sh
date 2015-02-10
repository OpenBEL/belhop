#!/usr/bin/env bash

# The next three lines are for the go shell.
export SCRIPT_NAME="Doctest"
export SCRIPT_HELP="Execute examples in JavaScript source via doctest."
[[ "$GOGO_GOSH_SOURCE" -eq 1 ]] && return 0

# Normal script execution starts here.
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"/../
source "$DIR"/env.sh || exit 1
use-gosh-contrib-or-die

# Create the node environment if needed.
create_node_env

cd "$DIR" || exit 1
require-cmd-or-die "doctest"
# shellcheck disable=SC2046
doctest $(find "$SRC" -name "*.js")

