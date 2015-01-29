#!/usr/bin/env bash

# The next three lines are for the go shell.
export SCRIPT_NAME="Build"
export SCRIPT_HELP="Compile with Google's Closure Compiler."
[[ "$GOGO_GOSH_SOURCE" -eq 1 ]] && return 0

# Normal script execution starts here.
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"/../
source "$DIR"/env.sh || exit 1
use_gosh_contrib || exit 1

assert_env BUILD || exit 1
assert_env SRC || exit 1
assert_env MIN_JS || exit 1

mkdir -p "$BUILD" || exit 1
cd "$BUILD" || exit 1

echo -n "Getting the Closure Compiler if necessary... "
wget -qN "http://dl.google.com/closure-compiler/compiler-latest.zip"
echo "okay"

if [ "compiler-latest.zip" -nt "compiler.jar" ]; then
    echo -n "Extracting latest JAR... "
    unzip -qo "compiler-latest.zip"
    echo "okay"
    touch "compiler.jar"
fi

# --language_in: set what language spec we conform to
# --js_output_file: output filename
# --js: BELHop source JavaScript
CLOSURE_COMPILER_ARGS="--language_in ECMASCRIPT5_STRICT \
                       --js_output_file $MIN_JS \
                       --js $SRC/belhop.js"

echo -n "Executing the compiler... "
CC_OUTPUT=$(mktemp)
java -jar compiler.jar $CLOSURE_COMPILER_ARGS >"$CC_OUTPUT" 2>&1
if [ $? -eq 0 ]; then
    status=0
    echo "done"
else
    echo "FAILED"
    cat "$CC_OUTPUT" 
    status=1
fi
rm "$CC_OUTPUT" || exit 1
exit $status

