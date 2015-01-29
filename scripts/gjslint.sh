#!/usr/bin/env bash

# The next three lines are for the go shell.
export SCRIPT_NAME="Closure Linter"
export SCRIPT_HELP="Lint JavaScript source via Google's Closure Linter."
[[ "$GOGO_GOSH_SOURCE" -eq 1 ]] && return 0

# Normal script execution starts here.
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"/../
source "$DIR"/env.sh || exit 1
use_gosh_contrib || exit 1
assert_env TOOLS || exit 1
assert_env GJSLINT_ENV || exit 1

# Create the virtual environment if needed...
export PYTHON_REQ_DEPS="$TOOLS"/gjslint-deps.req
export ENV="$GJSLINT_ENV"
create_python_env "python2" || exit 1
# ... and enter it.
. "$ENV"/bin/activate

cd "$DIR" || exit 1
require_cmd "gjslint" || exit 1
gjslint $(find src spec -name "*.js")

