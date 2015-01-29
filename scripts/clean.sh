#!/usr/bin/env bash

# The next three lines are for the go shell.
export SCRIPT_NAME="Clean"
export SCRIPT_HELP="Clean the build."
[[ "$GOGO_GOSH_SOURCE" -eq 1 ]] && return 0

# Normal script execution starts here.
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"/../
source "$DIR"/env.sh || exit 1

assert_env BUILD || exit 1
rm -fr "$BUILD" || exit 1

