# gosh-contrib: ruby.sh
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
# GOSH_CONTRIB_RUBY_GEMFILE
#   Path to Gemfile, e.g., $DIR/Gemfile.
#
# GOSH_CONTRIB_RUBY_GEMPATH
#   Path to install gems to, e.g., $DIR/gems.
#

# Installs gems into the GOSH_CONTRIB_RUBY_GEMPATH using the Gemfile in
# GOSH_CONTRIB_RUBY_GEMFILE.
# E.g.,
#    bundle_install_gems
function bundle_install_gems {
    assert_env GOSH_CONTRIB_RUBY_GEMFILE || return 1
    assert_env GOSH_CONTRIB_RUBY_GEMPATH || return 1
    vdefault BUNDLE_OPTS "--quiet"
    echo -en "Running bundle install... "
    # shellcheck disable=SC2086
    if ! bundle install $BUNDLE_OPTS \
                --gemfile="$GOSH_CONTRIB_RUBY_GEMFILE" \
                --path="$GOSH_CONTRIB_RUBY_GEMPATH"; then
        echo "failed"
        return 1
    fi
    echo "okay"
    return 0
}

# Installs bundler into the GOSH_CONTRIB_RUBY_GEMPATH.
# E.g.,
#     gem_install_bundler
function gem_install_bundler {
    assert_env GOSH_CONTRIB_RUBY_GEMPATH || return 1
    require_cmd "gem" || return 1
    echo -en "Running gem install bundler... "
    # redirect stdout/stderr to make gem really quiet
    GEM_OUTPUT=$(mktemp) || return 1
    GEM_HOME="$GOSH_CONTRIB_RUBY_GEMPATH" gem install bundler >"$GEM_OUTPUT" 2>&1
    EC=$?
    if [ $EC -ne 0 ]; then
        echo "failed"
        cat "$GEM_OUTPUT" || return 1
        rm "$GEM_OUTPUT" || return 1
        return 1
    fi
    rm "$GEM_OUTPUT" || return 1
    echo "okay"
    return 0
}

# Determines whether the gem path GOSH_CONTRIB_RUBY_GEMPATH needs updating.
# E.g.,
#    if $(gem_path_needs_updating); then
#        # update it
#    fi
function gem_path_needs_updating {
    # returning 0 indicates an update is needed
    assert_env GOSH_CONTRIB_RUBY_GEMFILE || return 0
    assert_env GOSH_CONTRIB_RUBY_GEMPATH || return 0
    # gem path doesn't exist?
    if [ ! -d "$GOSH_CONTRIB_RUBY_GEMPATH" ]; then return 0; fi
    # gemfile changed?
    if [ "$GOSH_CONTRIB_RUBY_GEMFILE" -nt "$GOSH_CONTRIB_RUBY_GEMPATH" ]; then
        return 0
    fi
    # previous gem path creation failed?
    if [ ! -f "$GOSH_CONTRIB_RUBY_GEMPATH"/.ts ]; then return 0; fi
    return 1
}

# Marks the gem path GOSH_CONTRIB_RUBY_GEMPATH as complete. Call this function
# once a gem path has been configured and all of the necessary dependencies
# have been installed.
function complete_gem_path {
    assert_env GOSH_CONTRIB_RUBY_GEMPATH || return 1
    date > "$GOSH_CONTRIB_RUBY_GEMPATH"/.ts || return 1
    return 0
}

# Creates a gem path.
# This function needs GOSH_CONTRIB_RUBY_GEMFILE and GOSH_CONTRIB_RUBY_GEMPATH
# set.
function create_gem_path {
    assert_env GOSH_CONTRIB_RUBY_GEMFILE || return 1
    assert_env GOSH_CONTRIB_RUBY_GEMPATH || return 1
    if gem_path_needs_updating; then
        echo "Gem path out-of-date - it will be created."
        echo "($GOSH_CONTRIB_RUBY_GEMPATH)"
        rm -fr "$GOSH_CONTRIB_RUBY_GEMPATH"
        gem_install_bundler || exit 1
        bundle_install_gems || exit 1
        complete_gem_path || exit 1
        echo
    fi
}
