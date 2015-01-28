#!/usr/bin/env bash

# The next three lines are for the go shell.
export SCRIPT_NAME="Clean World"
export SCRIPT_HELP="Cleans all artifacts, effectively resetting the working tree."
[[ "$GOGO_GOSH_SOURCE" -eq 1 ]] && return 0

# Normal script execution starts here.
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"/../
source "$DIR"/env.sh || exit 1

assert_env BUILD
assert_env NPM_MODPATH
assert_env PYTHON_ENVS
rm -fr "$BUILD" || exit 1
rm -fr "$NPM_MODPATH" || exit 1
rm -fr "$PYTHON_ENVS"/* || exit 1


