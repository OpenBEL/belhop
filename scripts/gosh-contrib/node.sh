# gosh-contrib: node.sh
# https://github.com/formwork-io/gosh-contrib
#
# Copyright (c) 2015 Nick Bargnesi
#
# Permission is hereby granted, free of charge, to any person
# obtaining a copy of this software and associated documentation
# files (the "Software"), to deal in the Software without
# restriction, including without limitation the rights to use,
# copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the
# Software is furnished to do so, subject to the following
# conditions:
#
# The above copyright notice and this permission notice shall be
# included in all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
# EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
# OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
# NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
# HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
# WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
# FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
# OTHER DEALINGS IN THE SOFTWARE.
#

# This contrib uses the following env vars:
#
# GOSH_CONTRIB_NODE_NPM_MODPATH
#   Path to node_modules directory, e.g., $DIR.
#
# GOSH_CONTRIB_NODE_NPM_PKGJSON
#   Path to package.json, e.g., $DIR/package.json.
#

# Installs dependencies into the node_modules of the current directory.
# E.g.,
#    install_node_deps
# Runs npm install in the current directory.
function install_node_deps {
    require-cmd "npm" || return 1
    echo -en "Running npm install... "
    # redirect stdout/stderr to mimic silent behavior
    # (npm currently lacks this functionality as of 2014-10-20)
    NODE_OUTPUT=$(mktemp) || return 1
    npm install >"$NODE_OUTPUT" 2>&1
    EC=$?
    if [ $EC -ne 0 ]; then
        echo "failed"
        cat "$NODE_OUTPUT" || return 1
        rm "$NODE_OUTPUT" || return 1
        return 1
    fi
    rm "$NODE_OUTPUT" || return 1
    echo "okay"
    return 0
}

# Determines whether the node_modules need updating.
# E.g.,
#    if $(node_env_needs_update); then
#        # update it
#    fi
function node_env_needs_update {
    # returning 0 indicates an update is needed
    assert-env GOSH_CONTRIB_NODE_NPM_MODPATH || return 0
    assert-env GOSH_CONTRIB_NODE_NPM_PKGJSON || return 0

    # E.g., $DIR -> $DIR/node_modules
    local nm_dir="$GOSH_CONTRIB_NODE_NPM_MODPATH"/node_modules

    # directory doesn't exist?
    if [ ! -d "$nm_dir" ]; then return 0; fi
    # package.json has changed?
    if [ "$GOSH_CONTRIB_NODE_NPM_PKGJSON" -nt "$nm_dir" ]; then return 0; fi
    # previous npm install failed?
    if [ ! -f "$nm_dir"/.ts ]; then return 0; fi
    return 1
}

# Marks the node environment GOSH_CONTRIB_NODE_NPM_MODPATH as complete. Call
# this function once a node envrionment has been configured and all of the
# necessary dependencies have been installed.
function complete_node_env {
    assert-env GOSH_CONTRIB_NODE_NPM_MODPATH || return 1
    # E.g., $DIR -> $DIR/node_modules
    local nm_dir="$GOSH_CONTRIB_NODE_NPM_MODPATH"/node_modules
    date > "$nm_dir"/.ts || return 1
    return 0
}

# Creates a node environment using npm.
# This function needs GOSH_CONTRIB_NODE_NPM_MODPATH and
# GOSH_CONTRIB_NODE_NPM_PKGJSON set.
function create_node_env {
    assert-env GOSH_CONTRIB_NODE_NPM_MODPATH || exit 1
    assert-env GOSH_CONTRIB_NODE_NPM_PKGJSON || exit 1
    if node_env_needs_update; then
        echo "Node environment out-of-date - it will be created."
        echo "($GOSH_CONTRIB_NODE_NPM_MODPATH)"
        # E.g., $DIR -> $DIR/node_modules
        local nm_dir="$GOSH_CONTRIB_NODE_NPM_MODPATH"/node_modules
        rm -fr "$nm_dir"
        install_node_deps || exit 1
        complete_node_env || exit 1
        echo
    fi

    local node_binpath="$GOSH_CONTRIB_NODE_NPM_MODPATH/node_modules/.bin"
    _g_add_path "$node_binpath"
}

