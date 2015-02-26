#!/usr/bin/env bash

# The next three lines are for the go shell.
export SCRIPT_NAME="JSDoc"
export SCRIPT_HELP="Generate API documentation via JSDoc."
[[ "$GOGO_GOSH_SOURCE" -eq 1 ]] && return 0

# Normal script execution starts here.
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"/../
source "$DIR"/env.sh || exit 1
use-gosh-contrib-or-die

# Create the node environment if needed...
create_node_env || exit 1
# ... and use it.
export PATH="$GOSH_CONTRIB_NODE_NPM_MODPATH/node_modules/.bin":$PATH

assert-env-or-die SRC
assert-env-or-die DOCS
assert-env-or-die TUTS
assert-env-or-die DOCS_BUILD

cd "$DIR" || exit 1
require-cmd-or-die "jsdoc"
jsdoc --readme "$DOCS"/readme \
      --template "./tools/jsdoc/template" \
      --destination "$DOCS_BUILD" \
      --tutorials "$TUTS" \
      --configure "./tools/jsdoc/jsdoc-conf.js" \
      "$SRC" \
      --verbose
