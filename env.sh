#!/usr/bin/env bash
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Pull in standard functions, e.g., default.
source "$DIR/.gosh.sh" || return 1
default CUSTOM_ENV_SH "$DIR/env.sh.custom"
assert_source "$CUSTOM_ENV_SH" || return 1

### GENERAL ENV VARS ###
default DIR             "$DIR"
default CUSTOM_ENV_SH   "$DIR/env.sh.custom"

### PATHS ###
default SCRIPTS         "$DIR"/scripts
default TOOLS           "$DIR"/tools
default VIRTUALENV      "$TOOLS"/virtualenv-12.0.5/virtualenv.py
default BUILD           "$DIR"/build
default SRC             "$DIR"/src
default MIN_JS          "$BUILD"/belhop.min.js
default DOCS            "$DIR"/docs
default DOCS_BUILD      "$DOCS"/build

### NODE/NPM ENV VARS ###
default NPM_MODPATH     "$DIR"/node_modules
default NPM_PKGJSON     "$DIR"/package.json

### PYTHON ENV VARS ###
default PYTHON_ENVS     "$TOOLS"/envs
default GJSLINT_ENV     "$PYTHON_ENVS"/gjslint
default PYTHON_REQ_DEPS "deps.req"
default PYTHON_OPT_DEPS "deps.opt"

### THE GO SHELL ###
default GOSH_SCRIPTS    "$DIR"/scripts
