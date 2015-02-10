#!/usr/bin/env bash

# The next three lines are for the go shell.
export SCRIPT_NAME="ESLint"
export SCRIPT_HELP="Lint JavaScript source via ESLint."
[[ "$GOGO_GOSH_SOURCE" -eq 1 ]] && return 0

# Normal script execution starts here.
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"/../
source "$DIR"/env.sh || exit 1
use-gosh-contrib-or-die

# Create the node environment if needed.
create_node_env

cd "$DIR" || exit 1
require-cmd-or-die "eslint"
assert-env-or-die ESLINT_CFG
eslint --config "$ESLINT_CFG" \
       src/belhop.js

