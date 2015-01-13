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

# Installs dependencies into the current virtual environment.
# E.g.,
#    install_deps $DIR
# Installs all dependencies listed in deps.req and deps.opt files.
function install_deps {
    assert_env PYTHON_REQ_DEPS || exit 1
    assert_env PYTHON_OPT_DEPS || exit 1
    if [ -z "${ENV}" ]; then
        echo "install_deps: called without ENV" >&2
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
#    if $(env_needs_update); then
#        # update it
#    fi
function env_needs_update {
    if [ -z "${ENV}" ]; then
        echo "env_needs_update: called without ENV" >&2
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
function complete_env {
    if [ -z "${ENV}" ]; then
        echo "complete_env: called without ENV" >&2
        return 1
    fi
    date > "${ENV}"/.ts
    return 0
}

# Creates a virtual environment for the Python interpreter $1.
# This function needs $ENV and $VIRTUALENV set. If VIRTUALENV_ARGS is set, it
# the value will be passed to virtualenv when creating the environment.
function create_env {
    if [ -z "$ENV" ]; then
        echo "create_env: called without ENV" >&2
        return 1
    fi
    if [ -z "$VIRTUALENV" ]; then
        echo "create_env: called without VIRTUALENV" >&2
        return 1
    fi
    if [ $# -ne 1 ]; then
        echo "create_env: called without \$1" >&2
        return 1
    fi
    local INTERP="$1"
    if env_needs_update; then
        echo "Python virtual environment out-of-date - it will be created."
        echo "(${ENV})"
        rm -fr "${ENV}"
        local PROMPT="\n(${ENV})"
        local ARGS="${ENV} --prompt=${PROMPT}"
        # shellcheck disable=SC2086
        $INTERP "$VIRTUALENV" $ARGS || exit 1
        PKG_DIR="$PYTHON_PKGS"
        install_deps || exit 1
        complete_env || exit 1
        echo
    fi
}

