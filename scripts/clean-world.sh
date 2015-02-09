#!/usr/bin/env bash

# The next three lines are for the go shell.
export SCRIPT_NAME="Clean World"
export SCRIPT_HELP="Cleans all artifacts, effectively resetting the working tree."
[[ "$GOGO_GOSH_SOURCE" -eq 1 ]] && return 0

# Normal script execution starts here.
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"/../
source "$DIR"/env.sh || exit 1

assert-env-or-die BUILD
assert-env-or-die GOSH_CONTRIB_NODE_NPM_MODPATH
assert-env-or-die PYTHON_ENVS
rm -fr "$BUILD" || exit 1
rm -fr "$GOSH_CONTRIB_NODE_NPM_MODPATH/node_modules" || exit 1
rm -fr "$PYTHON_ENVS"/* || exit 1


