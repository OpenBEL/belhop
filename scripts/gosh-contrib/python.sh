# gosh-contrib: python.sh
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
# GOSH_CONTRIB_PYTHON_VENV
#   Path to virtual environment to, e.g., $DIR/python-env.
#
# GOSH_CONTRIB_PYTHON_REQ_DEPS
#   Path to required Python dependencies, e.g., $DIR/req.deps.
#
# GOSH_CONTRIB_PYTHON_OPT_DEPS
#   Path to optional Python dependencies, e.g., $DIR/opt.deps.
#
# GOSH_CONTRIB_PYTHON_VIRTUALENV
#   Path to virtualenvironment Python script.
#

# Installs dependencies into the current virtual environment.
# E.g.,
#    install_python_deps $DIR
# Installs all dependencies listed in GOSH_CONTRIB_PYTHON_REQ_DEP and fails if
# something failed to install. Tries installing GOSH_CONTRIB_PYTHON_OPT_DEPS but
# does not fail if something failed to install.
function install_python_deps {
    assert_env GOSH_CONTRIB_PYTHON_REQ_DEPS || return 1
    assert_env GOSH_CONTRIB_PYTHON_OPT_DEPS || return 1
    assert_env GOSH_CONTRIB_PYTHON_VENV || return 1
    . "$GOSH_CONTRIB_PYTHON_VENV"/bin/activate
    vdefault GOSH_CONTRIB_PYTHON_PIP_OPTS "--quiet"
    if [ -r "$GOSH_CONTRIB_PYTHON_REQ_DEPS" ]; then
        echo -en "Installing required dependencies... "
        # shellcheck disable=SC2086
        if ! pip install $GOSH_CONTRIB_PYTHON_PIP_OPTS \
                 -r "$GOSH_CONTRIB_PYTHON_REQ_DEPS"; then
            echo "failed"
            deactivate
            return 1
        fi
        echo "okay"
    fi
    if [ -r "$GOSH_CONTRIB_PYTHON_OPT_DEPS" ]; then
        echo -en "Installing optional dependencies... "
        # shellcheck disable=SC2086
        if ! pip install $GOSH_CONTRIB_PYTHON_PIP_OPTS \
                 -r "$GOSH_CONTRIB_PYTHON_OPT_DEPS"; then
            echo "Some errors occurred installing optional dependencies."
        else
            echo "okay"
        fi
    fi
    deactivate
    return 0
}

# Determines whether the virtual environment GOSH_CONTRIB_PYTHON_VENV needs updating.
# E.g.,
#    if $(python_env_needs_update); then
#        # update it
#    fi
function python_env_needs_update {
    # returning 0 indicates an update is needed
    assert_env GOSH_CONTRIB_PYTHON_VENV || return 0
    local venv_dir="$GOSH_CONTRIB_PYTHON_VENV"

    # directory doesn't exist?
    if [ ! -d "$venv_dir" ]; then return 0; fi
    # required dependencies have changed?
    if [ "$GOSH_CONTRIB_PYTHON_REQ_DEPS" -nt "$venv_dir" ]; then return 0; fi
    # optional dependencies have changed?
    if [ "$GOSH_CONTRIB_PYTHON_OPT_DEPS" -nt "$venv_dir" ]; then return 0; fi
    # previous creation failed?
    if [ ! -f "$venv_dir"/.ts ]; then return 0; fi
    return 1
}

# Marks the virtual environment GOSH_CONTRIB_PYTHON_VENV as complete. Call this function once a
# virtual environment has been configured and all of the necessary dependencies
# have been installed.
function complete_python_env {
    assert_env GOSH_CONTRIB_PYTHON_VENV || return 1
    date > "$GOSH_CONTRIB_PYTHON_VENV"/.ts || return 1
    return 0
}

# Creates a virtual environment for the Python interpreter $1.
# This function needs GOSH_CONTRIB_PYTHON_VENV and
# GOSH_CONTRIB_PYTHON_VIRTUALENV set. If GOSH_CONTRIB_PYTHON_VIRTUALENV_ARGS
# is set, it the value will be passed to virtualenv when creating the
# environment.
function create_python_env {
    assert_env GOSH_CONTRIB_PYTHON_VENV || exit 1
    assert_env GOSH_CONTRIB_PYTHON_VIRTUALENV || exit 1
    if [ $# -ne 1 ]; then
        echo "create_python_env: called without \$1" >&2
        exit 1
    fi
    local INTERP="$1"
    if python_env_needs_update; then
        echo "Python virtual environment out-of-date - it will be created."
        echo "($GOSH_CONTRIB_PYTHON_VENV)"
        rm -fr "$GOSH_CONTRIB_PYTHON_VENV"
        local PROMPT="\n($GOSH_CONTRIB_PYTHON_VENV)"
        local ARGS="$GOSH_CONTRIB_PYTHON_VENV --prompt=${PROMPT}"
        # shellcheck disable=SC2086
        $INTERP "$GOSH_CONTRIB_PYTHON_VIRTUALENV" $ARGS || exit 1
        install_python_deps || exit 1
        complete_python_env || exit 1
        echo
    fi
}
