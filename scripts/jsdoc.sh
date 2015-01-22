#!/usr/bin/env bash

# The next three lines are for the go shell.
export SCRIPT_NAME="JSDoc"
export SCRIPT_HELP="Generate API documentation via JSDoc."
[[ "$GOGO_GOSH_SOURCE" -eq 1 ]] && return 0

# Normal script execution starts here.
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"/../
source "$DIR"/env.sh || exit 1
source "$SCRIPTS"/functions.sh || exit 1
assert_env NPM_MODPATH
assert_env SRC
assert_env DOCS_BUILD

# Create the node environment if needed...
create_node_env || exit 1
# ... and use it.
export PATH="$NPM_MODPATH/.bin":$PATH

cd "$DIR" || exit 1
require_cmd "jsdoc"
jsdoc --readme docs/readme \
      --destination "$DOCS_BUILD" \
      "$SRC" \
      --verbose
