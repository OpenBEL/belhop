#!/usr/bin/env bash

# The next three lines are for the go shell.
export SCRIPT_NAME="Start Karma"
export SCRIPT_HELP="Continuous testing as JavaScript modifications occur."
[[ "$GOGO_GOSH_SOURCE" -eq 1 ]] && return 0

# Normal script execution starts here.
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"/../
source "$DIR"/env.sh || exit 1
use-gosh-contrib-or-die

# Create the node environment if needed.
create_node_env

cd "$DIR" || exit 1
require-cmd-or-die "karma"

CMD="karma"
CMD_ARGS="start belhop.conf.js"
if [ "$TEST_HEADLESS" == "yes" ]; then
    echo "(headless)"
    require-cmd-or-die "xvfb-run" || exit 1
    # shellcheck disable=SC2086
    xvfb-run $CMD $CMD_ARGS
else
    # shellcheck disable=SC2086
    $CMD $CMD_ARGS
fi

