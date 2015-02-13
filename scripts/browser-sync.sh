#!/usr/bin/env bash

# The next three lines are for the go shell.
export SCRIPT_NAME="BrowserSync"
export SCRIPT_HELP="Start BrowserSync."
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
require_cmd "browser-sync" || exit 1
assert_env BROWSERSYNC_PORT || exit 1
browser-sync start --files "demo/*.css, demo/*.js, demo/*.html" \
                   --port="$BROWSERSYNC_PORT" \
                   --server \
                   --startPath demo
