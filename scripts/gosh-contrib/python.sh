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

# Installs dependencies into the current virtual environment.
# E.g.,
#    install_python_deps $DIR
# Installs all dependencies listed in deps.req and deps.opt files.
function install_python_deps {
    assert_env PYTHON_REQ_DEPS || exit 1
    assert_env PYTHON_OPT_DEPS || exit 1
    if [ -z "${ENV}" ]; then
        echo "install_python_deps: called without ENV" >&2
        return 1
    fi
    . "${ENV}"/bin/activate
    if [ ! -z "$__PYVENV_LAUNCHER__" ]; then
        echo "*************************************************"
        echo "* UNSETTING __PYVENV_LAUNCHER__ FOR PORTABILITY *"
        echo "*                                               *"
        echo "* If you run into problems creating the virtual *"
        echo "* environment, try removing the unset of this   *"
        echo "* variable in functions.sh.                     *"
        echo "*************************************************"
        unset __PYVENV_LAUNCHER__
    fi
    PIP_OPTS="--quiet"
    if [ -r "$PYTHON_REQ_DEPS" ]; then
        echo -en "Installing required dependencies... "
        # shellcheck disable=SC2086
        if ! pip install $PIP_OPTS -r "$PYTHON_REQ_DEPS"; then
            echo "failed"
            deactivate
            return 1
        fi
        echo "okay"
    fi
    if [ -r "$PYTHON_OPT_DEPS" ]; then
        echo -en "Installing optional dependencies... "
        # shellcheck disable=SC2086
        if ! pip install $PIP_OPTS -r "$PYTHON_OPT_DEPS"; then
            echo "Some errors occurred installing optional dependencies."
        else
            echo "okay"
        fi
    fi
    deactivate
    return 0
}

# Determines whether the virtual environment $ENV needs updating.
# E.g.,
#    if $(python_env_needs_update); then
#        # update it
#    fi
function python_env_needs_update {
    if [ -z "${ENV}" ]; then
        echo "python_env_needs_update: called without ENV" >&2
        return 1
    fi
    # ENV directory doesn't exist?
    if [ ! -d "${ENV}" ]; then return 0; fi
    # required dependencies have changed?
    if [ "$PYTHON_REQ_DEPS" -nt "${ENV}" ]; then return 0; fi
    # optional dependencies have changed?
    if [ "$PYTHON_OPT_DEPS" -nt "${ENV}" ]; then return 0; fi
    # previous ENV creation failed?
    if [ ! -f "${ENV}"/.ts ]; then return 0; fi
    return 1
}

# Marks the virtual environment $ENV as complete. Call this function once a
# virtual environment has been configured and all of the necessary dependencies
# have been installed.
function complete_python_env {
    if [ -z "${ENV}" ]; then
        echo "complete_python_env: called without ENV" >&2
        return 1
    fi
    date > "${ENV}"/.ts
    return 0
}

# Creates a virtual environment for the Python interpreter $1.
# This function needs $ENV and $VIRTUALENV set. If VIRTUALENV_ARGS is set, it
# the value will be passed to virtualenv when creating the environment.
function create_python_env {
    if [ -z "$ENV" ]; then
        echo "create_python_env: called without ENV" >&2
        return 1
    fi
    if [ -z "$VIRTUALENV" ]; then
        echo "create_python_env: called without VIRTUALENV" >&2
        return 1
    fi
    if [ $# -ne 1 ]; then
        echo "create_python_env: called without \$1" >&2
        return 1
    fi
    local INTERP="$1"
    if python_env_needs_update; then
        echo "Python virtual environment out-of-date - it will be created."
        echo "(${ENV})"
        rm -fr "${ENV}"
        local PROMPT="\n(${ENV})"
        local ARGS="${ENV} --prompt=${PROMPT}"
        # shellcheck disable=SC2086
        $INTERP "$VIRTUALENV" $ARGS || exit 1
        install_python_deps || exit 1
        complete_python_env || exit 1
        echo
    fi
}
