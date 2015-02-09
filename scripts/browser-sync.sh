#!/usr/bin/env bash

# The next three lines are for the go shell.
export SCRIPT_NAME="BrowserSync"
export SCRIPT_HELP="Start BrowserSync."
[[ "$GOGO_GOSH_SOURCE" -eq 1 ]] && return 0

# Normal script execution starts here.
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"/../
source "$DIR"/env.sh || exit 1
use-gosh-contrib-or-die

# Create the node environment if needed...
create_node_env || exit 1
# ... and use it.
export PATH="$GOSH_CONTRIB_NODE_NPM_MODPATH/node_modules/.bin":$PATH

cd "$DIR" || exit 1
require-cmd-or-die "browser-sync"
assert-env-or-die BROWSERSYNC_PORT
browser-sync start --files "demo/*.css, demo/*.js, demo/*.html" \
                   --port="$BROWSERSYNC_PORT" \
                   --server \
                   --startPath demo
