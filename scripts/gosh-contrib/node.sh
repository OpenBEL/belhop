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

# Installs dependencies into the node_modules of the current directory.
# E.g.,
#    install_node_deps
# Runs npm install in the current directory.
function install_node_deps {
    echo -en "Running npm install... "
    # redirect stdout/stderr to mimic silent behavior
    # (npm currently lacks this functionality as of 2014-10-20)
    NODE_OUTPUT=$(mktemp)
    npm install >"$NODE_OUTPUT" 2>&1
    EC=$?
    if [ $EC -ne 0 ]; then
        echo "failed"
        cat "$NODE_OUTPUT" || return 1
        rm "$NODE_OUTPUT" || return 1
    fi
    echo "okay"
    return 0
}

# Determines whether the node_modules of the current directory need updating.
# E.g.,
#    if $(node_env_needs_update); then
#        # update it
#    fi
function node_env_needs_update {
    if [ -z "$NPM_MODPATH" ]; then
        echo "node_env_needs_update: called without NPM_MODPATH" >&2
        return 1
    elif [ -z "$NPM_PKGJSON" ]; then
        echo "node_env_needs_update: called without NPM_PKGJSON" >&2
        return 1
    fi
    # node_modules directory doesn't exist?
    if [ ! -d "$NPM_MODPATH" ]; then return 0; fi
    # package.json has changed?
    if [ "$NPM_PKGJSON" -nt "$NPM_MODPATH" ]; then return 0; fi
    # previous npm install failed?
    if [ ! -f "$NPM_MODPATH"/.ts ]; then return 0; fi
    return 1
}

# Marks the virtual environment $ENV as complete. Call this function once a
# virtual environment has been configured and all of the necessary dependencies
# have been installed.
function complete_node_env {
    if [ -z "$NPM_MODPATH" ]; then
        echo "complete_node_env: called without NPM_MODPATH" >&2
        return 1
    elif [ -z "$NPM_PKGJSON" ]; then
        echo "complete_node_env: called without NPM_PKGJSON" >&2
        return 1
    fi
    date > "$NPM_MODPATH"/.ts
    return 0
}

# Creates a node environment using npm.
# This function needs $NPM_MODPATH and $NPM_PKGJSON set.
function create_node_env {
    if [ -z "$NPM_MODPATH" ]; then
        echo "create_node_env: called without NPM_MODPATH" >&2
        return 1
    elif [ -z "$NPM_PKGJSON" ]; then
        echo "create_node_env: called without NPM_PKGJSON" >&2
        return 1
    fi
    if node_env_needs_update; then
        echo "Node environment out-of-date - it will be created."
        echo "($(pwd)/$NPM_MODPATH)"
        rm -fr "$NPM_MODPATH"
        install_node_deps || exit 1
        complete_node_env || exit 1
        echo
    fi
}
