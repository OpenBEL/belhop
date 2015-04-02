#!/usr/bin/env bash
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"/../
source "$DIR"/env.sh || exit 1
cd "$SCRIPTS" || exit 1

echo "[ESLINT]"
./eslint.sh || exit 1
echo

echo "[JSDOC]"
./jsdoc.sh || exit 1
echo

echo "[DOCTEST]"
./doctest.sh || exit 1
echo

echo "[KARMA TEST]"
./karma-test.sh || exit 1
echo

