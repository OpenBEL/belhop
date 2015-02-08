#!/usr/bin/env bash

# The next three lines are for the go shell.
export SCRIPT_NAME="Start Karma"
export SCRIPT_HELP="Continuous testing as JavaScript modifications occur."
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
require_cmd "karma" || exit 1

CMD="karma"
CMD_ARGS="start belhop.conf.js"
if [ "$TEST_HEADLESS" == "yes" ]; then
    echo "(headless)"
    require_cmd "xvfb-run" || exit 1
    # shellcheck disable=SC2086
    xvfb-run $CMD $CMD_ARGS
else
    # shellcheck disable=SC2086
    $CMD $CMD_ARGS
fi

