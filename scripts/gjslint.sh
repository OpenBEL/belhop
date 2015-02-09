#!/usr/bin/env bash

# The next three lines are for the go shell.
export SCRIPT_NAME="Closure Linter"
export SCRIPT_HELP="Lint JavaScript source via Google's Closure Linter."
[[ "$GOGO_GOSH_SOURCE" -eq 1 ]] && return 0

# Normal script execution starts here.
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"/../
source "$DIR"/env.sh || exit 1
use-gosh-contrib-or-die
assert-env-or-die TOOLS
assert-env-or-die GJSLINT_ENV

# Create the virtual environment if needed.
export GOSH_CONTRIB_PYTHON_REQ_DEPS="$TOOLS"/gjslint/gjslint-deps.req
export GOSH_CONTRIB_PYTHON_OPT_DEPS="$TOOLS"/gjslint/gjslint-deps.opt
export GOSH_CONTRIB_PYTHON_VENV="$GJSLINT_ENV"
create_python_env "python2"

JSDOC_TAGS="function,namespace,default,example,property,name,file,exports,
version,readonly"

cd "$DIR" || exit 1
require-cmd-or-die "gjslint"
# shellcheck disable=SC2046
gjslint --custom_jsdoc_tags="$JSDOC_TAGS" $(find src spec -name "*.js")
